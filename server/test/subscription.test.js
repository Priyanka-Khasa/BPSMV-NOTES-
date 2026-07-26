const test = require('node:test');
const assert = require('node:assert/strict');
const { hasActiveSubscription, subscriptionSummary } = require('../src/utils/subscription');

const fixedNow = new Date('2026-07-26T00:00:00.000Z');

test('admins always have active access', () => {
  assert.equal(hasActiveSubscription({ role: 'admin' }, fixedNow), true);
});

test('active subscriptions require a future expiry date', () => {
  const activeUser = {
    role: 'student',
    subscription: {
      status: 'active',
      expiresAt: new Date('2026-08-26T00:00:00.000Z')
    }
  };
  const expiredUser = {
    role: 'student',
    subscription: {
      status: 'active',
      expiresAt: new Date('2026-06-26T00:00:00.000Z')
    }
  };

  assert.equal(hasActiveSubscription(activeUser, fixedNow), true);
  assert.equal(hasActiveSubscription(expiredUser, fixedNow), false);
});

test('subscription summary hides expired access as inactive', () => {
  const user = {
    role: 'student',
    subscription: {
      status: 'active',
      plan: 'monthly',
      startsAt: new Date('2026-05-26T00:00:00.000Z'),
      expiresAt: new Date('2026-06-26T00:00:00.000Z')
    }
  };

  const summary = subscriptionSummary(user);

  assert.equal(summary.status, 'inactive');
  assert.equal(summary.active, false);
  assert.equal(summary.plan, 'monthly');
});
