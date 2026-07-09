const User = require('../models/User');

const hasActiveSubscription = (user, now = new Date()) => (
  user?.role === 'admin' ||
  (user?.subscription?.status === 'active' &&
    user.subscription.expiresAt &&
    new Date(user.subscription.expiresAt) > now)
);

const subscriptionSummary = (user) => ({
  status: hasActiveSubscription(user) ? 'active' : 'inactive',
  plan: user?.subscription?.plan || null,
  startsAt: user?.subscription?.startsAt || null,
  expiresAt: user?.subscription?.expiresAt || null,
  active: hasActiveSubscription(user)
});

const requireActiveSubscription = async (req, res, next) => {
  try {
    const user = req.authUser || await User.findById(req.user?.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    if (!hasActiveSubscription(user)) {
      return res.status(402).json({
        code: 'SUBSCRIPTION_REQUIRED',
        message: 'An active subscription is required to access the Resource Hub.'
      });
    }

    req.authUser = user;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Could not verify access' });
  }
};

module.exports = { hasActiveSubscription, subscriptionSummary, requireActiveSubscription };
