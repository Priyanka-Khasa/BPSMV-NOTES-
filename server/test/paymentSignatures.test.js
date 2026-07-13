const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createRazorpayPaymentSignature,
  verifyRazorpayPaymentSignature,
  createRazorpayWebhookSignature,
  verifyRazorpayWebhookSignature
} = require('../src/utils/paymentSignatures');

test('verifies Razorpay checkout signatures', () => {
  const secret = 'payment-secret';
  const orderId = 'order_123';
  const paymentId = 'pay_456';
  const signature = createRazorpayPaymentSignature(orderId, paymentId, secret);

  assert.equal(verifyRazorpayPaymentSignature({ orderId, paymentId, signature, secret }), true);
  assert.equal(verifyRazorpayPaymentSignature({ orderId, paymentId: 'pay_tampered', signature, secret }), false);
});

test('verifies Razorpay webhook signatures against the raw body', () => {
  const secret = 'webhook-secret';
  const body = Buffer.from(JSON.stringify({ event: 'payment.captured' }));
  const signature = createRazorpayWebhookSignature(body, secret);

  assert.equal(verifyRazorpayWebhookSignature({ body, signature, secret }), true);
  assert.equal(verifyRazorpayWebhookSignature({ body: Buffer.from('{}'), signature, secret }), false);
});
