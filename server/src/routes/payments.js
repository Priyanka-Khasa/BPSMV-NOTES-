const express = require('express');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { verifyToken } = require('./auth');
const { subscriptionSummary } = require('../utils/subscription');

const router = express.Router();
const PLANS = Object.freeze({
  monthly: { amount: 1000, label: 'Monthly Access', months: 1 },
  yearly: { amount: 5000, label: 'Yearly Access', months: 12 }
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many payment attempts. Please try again later.' }
});

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

const extendAccess = async (payment) => {
  const user = await User.findById(payment.user);
  if (!user) throw new Error('Payment user no longer exists');
  if (payment.status === 'paid') return user;

  const now = new Date();
  const currentExpiry = user.subscription?.expiresAt
    ? new Date(user.subscription.expiresAt)
    : null;
  const startsAt = currentExpiry && currentExpiry > now ? currentExpiry : now;
  const expiresAt = new Date(startsAt);
  expiresAt.setUTCMonth(expiresAt.getUTCMonth() + PLANS[payment.plan].months);

  payment.status = 'paid';
  payment.paidAt = now;
  payment.accessStartsAt = startsAt;
  payment.accessExpiresAt = expiresAt;
  await payment.save();

  user.subscription = {
    status: 'active',
    plan: payment.plan,
    startsAt,
    expiresAt,
    lastPayment: payment._id
  };
  await user.save();
  return user;
};

router.get('/config', verifyToken, (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || '',
    plans: Object.entries(PLANS).map(([id, plan]) => ({
      id,
      amount: plan.amount,
      currency: 'INR',
      label: plan.label
    }))
  });
});

router.get('/status', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ subscription: subscriptionSummary(user) });
});

router.post('/order', verifyToken, paymentLimiter, async (req, res) => {
  try {
    const plan = PLANS[req.body.plan];
    if (!plan) return res.status(400).json({ message: 'Choose a valid access plan' });

    const user = await User.findById(req.user.id);
    if (!user?.onboarded) {
      return res.status(403).json({ message: 'Complete your profile before purchasing access' });
    }

    const receipt = `bpsmv_${user._id}_${Date.now()}`.slice(0, 40);
    const order = await getRazorpay().orders.create({
      amount: plan.amount,
      currency: 'INR',
      receipt,
      notes: { userId: String(user._id), plan: req.body.plan }
    });

    await Payment.create({
      user: user._id,
      plan: req.body.plan,
      amount: plan.amount,
      razorpayOrderId: order.id
    });

    res.status(201).json({
      orderId: order.id,
      amount: plan.amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      name: 'BPSMV Resource Hub',
      description: plan.label
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ message: 'Could not start payment. Please try again.' });
  }
});

router.post('/verify', verifyToken, paymentLimiter, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (![razorpay_order_id, razorpay_payment_id, razorpay_signature]
      .every((value) => typeof value === 'string' && value.length > 0)) {
      return res.status(400).json({ message: 'Incomplete payment response' });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user.id
    });
    if (!payment) return res.status(404).json({ message: 'Payment order not found' });

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    const signatureValid = expected.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
    if (!signatureValid) return res.status(400).json({ message: 'Payment verification failed' });

    payment.razorpayPaymentId = razorpay_payment_id;
    const user = await extendAccess(payment);
    res.json({
      message: 'Payment verified. Your access is active.',
      subscription: subscriptionSummary(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This payment has already been used' });
    }
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Could not verify payment' });
  }
});

const webhook = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return res.status(503).json({ message: 'Webhook is not configured' });
    }
    const signature = req.get('X-Razorpay-Signature') || '';
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(req.body)
      .digest('hex');
    const valid = signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) return res.status(400).json({ message: 'Invalid webhook signature' });

    const event = JSON.parse(req.body.toString('utf8'));
    const entity = event.payload?.payment?.entity;
    if (event.event === 'payment.captured' && entity?.order_id) {
      const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
      if (payment && payment.status !== 'paid') {
        payment.razorpayPaymentId = entity.id;
        await extendAccess(payment);
      }
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

module.exports = { router, webhook };
