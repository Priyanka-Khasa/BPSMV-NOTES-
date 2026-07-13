const nodemailer = require('nodemailer');
const { cleanEnvValue } = require('./env');

const EMAIL_TIMEOUT_MS = Number.parseInt(cleanEnvValue(process.env.EMAIL_TIMEOUT_MS || '10000'), 10);

const withTimeout = (promise, label) => {
  let timer;
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${EMAIL_TIMEOUT_MS}ms`)), EMAIL_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const createTransporter = () => {
  const host = cleanEnvValue(process.env.SMTP_HOST || 'smtp.gmail.com');
  const port = Number.parseInt(cleanEnvValue(process.env.SMTP_PORT || '587'), 10);
  const user = cleanEnvValue(process.env.SMTP_USER);
  const pass = cleanEnvValue(process.env.SMTP_PASS);

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    connectionTimeout: EMAIL_TIMEOUT_MS,
    greetingTimeout: EMAIL_TIMEOUT_MS,
    socketTimeout: EMAIL_TIMEOUT_MS,
    auth: { user, pass }
  });
};

const isEmailConfigured = () => Boolean(
  cleanEnvValue(process.env.RESEND_API_KEY) ||
  (cleanEnvValue(process.env.SMTP_USER) && cleanEnvValue(process.env.SMTP_PASS))
);

const sendWithResend = async ({ to, subject, html }) => {
  const apiKey = cleanEnvValue(process.env.RESEND_API_KEY);
  if (!apiKey) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);

  let response;
  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: cleanEnvValue(process.env.EMAIL_FROM || 'BPSMV Hub <onboarding@resend.dev>'),
        to,
        subject,
        html
      })
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${details}`);
  }

  return true;
};

const sendEmail = async ({ to, subject, html }) => {
  let resendError = null;
  try {
    const sentWithResend = await sendWithResend({ to, subject, html });
    if (sentWithResend) return { delivered: true, provider: 'resend' };
  } catch (error) {
    resendError = error;
    console.error('Resend email failed, trying SMTP fallback:', error.message);
  }

  const transporter = createTransporter();
  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('--- EMAIL NOT CONFIGURED ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(html);
      return { delivered: false, provider: 'console' };
    }
    throw resendError || new Error('Email provider is not configured');
  }

  await withTimeout(transporter.sendMail({
    from: `"BPSMV Hub" <${cleanEnvValue(process.env.SMTP_USER)}>`,
    to,
    subject,
    html
  }), 'SMTP email');
  return { delivered: true, provider: 'smtp' };
};

module.exports = { isEmailConfigured, sendEmail };
