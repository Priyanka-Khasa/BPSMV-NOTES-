const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { createAuthToken, isActiveSession } = require('../src/utils/authSession');

test('auth token includes the active session id and role claims', () => {
  process.env.JWT_SECRET = 'unit-test-secret';
  const user = {
    _id: '64f000000000000000000001',
    onboarded: true,
    role: 'student'
  };

  const token = createAuthToken(user, 'session-a');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  assert.equal(decoded.id, user._id);
  assert.equal(decoded.role, 'student');
  assert.equal(decoded.sessionId, 'session-a');
});

test('isActiveSession rejects old single-device sessions', () => {
  const user = { activeSessionId: 'current-session' };

  assert.equal(isActiveSession(user, { sessionId: 'current-session' }), true);
  assert.equal(isActiveSession(user, { sessionId: 'old-session' }), false);
  assert.equal(isActiveSession(user, {}), false);
});
