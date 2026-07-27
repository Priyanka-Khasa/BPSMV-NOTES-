const fs = require('fs/promises');
const nodemailer = require('nodemailer');
const { cleanEnvValue } = require('./env');

const parseEmailFrom = (value) => {
  const from = cleanEnvValue(value);
  const match = from.match(/^(.*)<([^<>]+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, '') || undefined,
      email: match[2].trim()
    };
  }
  return from ? { email: from } : {};
};

const getSender = () => {
  const configured = parseEmailFrom(process.env.EMAIL_FROM);
  return {
    name: process.env.BREVO_SENDER_NAME || configured.name || 'BPSMV Hub',
    email: process.env.BREVO_SENDER_EMAIL || configured.email || process.env.SMTP_USER
  };
};

const getFromHeader = () => {
  const sender = getSender();
  if (!sender.email) return '';
  return sender.name ? `"${sender.name}" <${sender.email}>` : sender.email;
};

const getSmtpFromHeader = () => {
  const smtpFrom = cleanEnvValue(process.env.SMTP_FROM);
  if (smtpFrom) return smtpFrom;

  const configured = parseEmailFrom(process.env.EMAIL_FROM);
  const smtpUser = cleanEnvValue(process.env.SMTP_USER);
  if (!smtpUser) return getFromHeader();

  const senderName = process.env.BREVO_SENDER_NAME || configured.name || 'BPSMV Hub';
  const configuredEmail = (configured.email || '').toLowerCase();
  const smtpEmail = smtpUser.toLowerCase();
  const smtpHost = cleanEnvValue(process.env.SMTP_HOST || 'smtp.gmail.com').toLowerCase();

  if (smtpHost.includes('gmail') && configuredEmail && configuredEmail !== smtpEmail) {
    return `"${senderName}" <${smtpUser}>`;
  }

  return configured.email
    ? (configured.name ? `"${configured.name}" <${configured.email}>` : configured.email)
    : `"${senderName}" <${smtpUser}>`;
};

const buildApiAttachment = async (attachment) => {
  if (!attachment?.path) return null;
  if (/^https?:\/\//i.test(attachment.path)) {
    return {
      name: attachment.filename,
      url: attachment.path
    };
  }
  return {
    name: attachment.filename,
    content: await fs.readFile(attachment.path, 'base64')
  };
};

const sendWithBrevo = async ({ to, subject, html, attachment, replyTo }) => {
  const apiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  if (!apiKey) return false;

  const sender = getSender();
  if (!sender.email) {
    throw new Error('Brevo sender email is not configured. Set EMAIL_FROM or BREVO_SENDER_EMAIL.');
  }

  const payload = {
    sender,
    to: [{ email: to }],
    subject,
    htmlContent: html
  };

  if (replyTo) payload.replyTo = { email: replyTo };

  const apiAttachment = await buildApiAttachment(attachment);
  if (apiAttachment) payload.attachment = [apiAttachment];

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Brevo email failed (${response.status}): ${details}`);
  }

  return true;
};

const sendWithResend = async ({ to, subject, html, attachment, replyTo }) => {
  if (cleanEnvValue(process.env.DISABLE_RESEND).toLowerCase() === 'true') return false;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const payload = {
    from: getFromHeader() || 'BPSMV Hub <onboarding@resend.dev>',
    to,
    subject,
    html
  };

  if (replyTo) payload.reply_to = replyTo;

  const apiAttachment = await buildApiAttachment(attachment);
  if (apiAttachment?.content) {
    payload.attachments = [{
      filename: apiAttachment.name,
      content: apiAttachment.content
    }];
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${details}`);
  }

  return true;
};

const createTransporter = () => {
  const host = cleanEnvValue(process.env.SMTP_HOST || 'smtp.gmail.com');
  const port = parseInt(cleanEnvValue(process.env.SMTP_PORT), 10) || 587;
  const secureEnv = cleanEnvValue(process.env.SMTP_SECURE).toLowerCase();
  const user = cleanEnvValue(process.env.SMTP_USER);
  const pass = cleanEnvValue(process.env.SMTP_PASS);

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: secureEnv ? secureEnv === 'true' : port === 465,
    auth: { user, pass }
  });
};

const sendWithSmtp = async ({ to, subject, html, attachment, replyTo }) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const mail = {
    from: getSmtpFromHeader(),
    to,
    subject,
    html
  };

  if (replyTo) mail.replyTo = replyTo;

  if (attachment?.path && !/^https?:\/\//i.test(attachment.path)) {
    mail.attachments = [{
      filename: attachment.filename,
      path: attachment.path
    }];
  }

  await transporter.sendMail(mail);
  return true;
};

const getEmailFailureMessage = (errors = []) => {
  const authError = errors.find((error) => (
    error?.code === 'EAUTH' ||
    error?.responseCode === 535 ||
    /username and password not accepted|badcredentials|invalid login/i.test(error?.message || '')
  ));

  if (authError) {
    return 'Gmail SMTP login failed. Please create a fresh Gmail App Password and update SMTP_PASS in Render.';
  }

  if (errors.length) {
    return 'Email provider failed. Please check the Render email settings and backend logs.';
  }

  return 'Email provider credentials are not configured.';
};

const sendEmailWithStatus = async ({ to, subject, html, attachment, replyTo, logLabel = 'EMAIL' }) => {
  let providerConfigured = false;
  const errors = [];

  try {
    providerConfigured = Boolean(createTransporter()) || providerConfigured;
    if (await sendWithSmtp({ to, subject, html, attachment, replyTo })) {
      return { sent: true, provider: 'smtp' };
    }
  } catch (error) {
    errors.push(error);
    console.error('SMTP email failed:', error);
  }

  try {
    providerConfigured = Boolean(process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY) || providerConfigured;
    if (await sendWithBrevo({ to, subject, html, attachment, replyTo })) {
      return { sent: true, provider: 'brevo' };
    }
  } catch (error) {
    errors.push(error);
    console.error('Brevo email failed:', error);
  }

  try {
    providerConfigured = (
      cleanEnvValue(process.env.DISABLE_RESEND).toLowerCase() !== 'true' &&
      Boolean(process.env.RESEND_API_KEY)
    ) || providerConfigured;
    if (await sendWithResend({ to, subject, html, attachment, replyTo })) {
      return { sent: true, provider: 'resend' };
    }
  } catch (error) {
    errors.push(error);
    console.error('Resend email failed:', error);
  }

  console.warn(providerConfigured
    ? 'Configured email providers did not deliver. Email was logged instead.'
    : 'Email provider credentials are not configured. Email was logged instead.');
  console.log(`--- ${logLabel} ---`);
  console.log(`To: ${to}`);
  if (replyTo) console.log(`Reply-To: ${replyTo}`);
  console.log(`Subject: ${subject}`);
  console.log(html);
  return {
    sent: false,
    configured: providerConfigured,
    message: getEmailFailureMessage(errors),
    errors
  };
};

const sendEmail = async (options) => {
  const result = await sendEmailWithStatus(options);
  return result.sent;
};

module.exports = { sendEmail, sendEmailWithStatus };
