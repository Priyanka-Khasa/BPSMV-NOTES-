const nodemailer = require('nodemailer');
const { cleanEnvValue } = require('./env');

const EMAIL_TIMEOUT_MS = Number.parseInt(cleanEnvValue(process.env.EMAIL_TIMEOUT_MS || '20000'), 10);

const parseBoolean = (value, fallback = false) => {
  const normalized = cleanEnvValue(value).toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return fallback;
};

const withTimeout = (promise, label) => {
  let timer;
  const timeout = new Promise((resolve, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${EMAIL_TIMEOUT_MS}ms`)), EMAIL_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const getPrimarySmtpConfig = () => {
  const host = cleanEnvValue(process.env.SMTP_HOST || 'smtp.gmail.com');
  const port = Number.parseInt(cleanEnvValue(process.env.SMTP_PORT || '587'), 10);
  const secure = parseBoolean(process.env.SMTP_SECURE, port === 465);
  const user = cleanEnvValue(process.env.SMTP_USER);
  const pass = cleanEnvValue(process.env.SMTP_PASS);

  if (!user || !pass) return null;

  return { host, port, secure, user, pass };
};

const getSmtpConfigs = () => {
  const primaryConfig = getPrimarySmtpConfig();
  if (!primaryConfig) return [];

  const configs = [primaryConfig];
  const isGmail587 = primaryConfig.host === 'smtp.gmail.com' && primaryConfig.port !== 465;
  if (isGmail587) {
    configs.push({ ...primaryConfig, port: 465, secure: true });
  }

  return configs;
};

const createTransporter = ({ host, port, secure, user, pass }) => {
  return nodemailer.createTransport({
    host,
    port,
    secure,
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

const getEmailConfigStatus = () => {
  const smtpConfig = getPrimarySmtpConfig();
  return {
    resendConfigured: Boolean(cleanEnvValue(process.env.RESEND_API_KEY)),
    resendFromConfigured: Boolean(cleanEnvValue(process.env.EMAIL_FROM)),
    smtpConfigured: Boolean(smtpConfig),
    smtpHost: smtpConfig?.host || cleanEnvValue(process.env.SMTP_HOST || 'smtp.gmail.com'),
    smtpPort: smtpConfig?.port || Number.parseInt(cleanEnvValue(process.env.SMTP_PORT || '587'), 10),
    smtpSecure: smtpConfig?.secure ?? parseBoolean(process.env.SMTP_SECURE, false),
    timeoutMs: EMAIL_TIMEOUT_MS
  };
};

const isResendSandboxError = (error) => /only send testing emails/i.test(error?.message || '');

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
    if (isResendSandboxError(error)) {
      console.error('Resend is in testing mode. Verify a sending domain in Resend or unset RESEND_API_KEY and use SMTP.');
    }
  }

  const smtpConfigs = getSmtpConfigs();
  if (smtpConfigs.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('--- EMAIL NOT CONFIGURED ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(html);
      return { delivered: false, provider: 'console' };
    }
    throw resendError || new Error('Email provider is not configured');
  }

  let smtpError = null;
  for (const config of smtpConfigs) {
    try {
      const transporter = createTransporter(config);
      await withTimeout(transporter.sendMail({
        from: `"BPSMV Hub" <${config.user}>`,
        to,
        subject,
        html
      }), `SMTP email via ${config.host}:${config.port}`);
      return { delivered: true, provider: `smtp:${config.port}` };
    } catch (error) {
      smtpError = error;
      console.error(`SMTP email failed via ${config.host}:${config.port}:`, error.message);
    }
  }

  throw smtpError || resendError || new Error('Email delivery failed');
};

module.exports = { getEmailConfigStatus, isEmailConfigured, sendEmail };
