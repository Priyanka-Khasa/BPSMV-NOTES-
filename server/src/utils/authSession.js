const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const SESSION_DAYS = Math.max(1, Number(process.env.AUTH_SESSION_DAYS || 30));
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60 * 1000;
const SESSION_EXPIRES_IN = `${SESSION_DAYS}d`;

const getJwtSecret = () => process.env.JWT_SECRET || 'bpsmv_fallback_secret_2026';

const createSessionId = () => crypto.randomUUID();

const createAuthToken = (user, sessionId) => jwt.sign(
  { id: user._id, onboarded: user.onboarded, role: user.role, sessionId },
  getJwtSecret(),
  { expiresIn: SESSION_EXPIRES_IN }
);

const isActiveSession = (user, decodedToken) => Boolean(
  user &&
  decodedToken?.sessionId &&
  user.activeSessionId === decodedToken.sessionId
);

module.exports = {
  SESSION_DAYS,
  SESSION_MAX_AGE,
  SESSION_EXPIRES_IN,
  createSessionId,
  createAuthToken,
  isActiveSession
};
