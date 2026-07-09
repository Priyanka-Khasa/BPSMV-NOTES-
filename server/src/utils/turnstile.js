const verifyTurnstile = async (token, remoteIp, expectedAction) => {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    if (process.env.NODE_ENV === 'production') {
      return { success: false, reason: 'Turnstile is not configured' };
    }
    return { success: true };
  }

  if (!token || typeof token !== 'string' || token.length > 2048) {
    return { success: false, reason: 'Complete the security check' };
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: remoteIp
      }),
      signal: AbortSignal.timeout(8000)
    });
    const result = await response.json();
    const actionMatches = !expectedAction || !result.action || result.action === expectedAction;
    const hostnameMatches = !process.env.TURNSTILE_HOSTNAME ||
      result.hostname === process.env.TURNSTILE_HOSTNAME;

    return {
      success: Boolean(result.success && actionMatches && hostnameMatches),
      reason: 'Security verification failed. Please try again.'
    };
  } catch (error) {
    console.error('Turnstile verification error:', error.message);
    return { success: false, reason: 'Security verification is temporarily unavailable' };
  }
};

module.exports = { verifyTurnstile };
