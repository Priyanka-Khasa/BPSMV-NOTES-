const crypto = require('crypto');

const safeCompareHex = (expected, received) => (
  typeof received === 'string' &&
  expected.length === received.length &&
  crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received))
);

const createRazorpayPaymentSignature = (orderId, paymentId, secret) => crypto
  .createHmac('sha256', secret)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

const verifyRazorpayPaymentSignature = ({ orderId, paymentId, signature, secret }) => {
  if (![orderId, paymentId, signature, secret].every((value) => typeof value === 'string' && value.length > 0)) {
    return false;
  }
  return safeCompareHex(createRazorpayPaymentSignature(orderId, paymentId, secret), signature);
};

const createRazorpayWebhookSignature = (body, secret) => crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

const verifyRazorpayWebhookSignature = ({ body, signature, secret }) => {
  if (!body || typeof signature !== 'string' || !signature || typeof secret !== 'string' || !secret) {
    return false;
  }
  return safeCompareHex(createRazorpayWebhookSignature(body, secret), signature);
};

module.exports = {
  createRazorpayPaymentSignature,
  verifyRazorpayPaymentSignature,
  createRazorpayWebhookSignature,
  verifyRazorpayWebhookSignature
};
