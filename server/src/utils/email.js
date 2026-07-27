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
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

const sendWithSmtp = async ({ to, subject, html, attachment, replyTo }) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const mail = {
    from: getFromHeader() || `"BPSMV Hub" <${process.env.SMTP_USER}>`,
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

const sendEmail = async ({ to, subject, html, attachment, replyTo, logLabel = 'EMAIL' }) => {
  try {
    if (await sendWithBrevo({ to, subject, html, attachment, replyTo })) return true;
  } catch (error) {
    console.error('Brevo email failed:', error);
  }

  try {
    if (await sendWithResend({ to, subject, html, attachment, replyTo })) return true;
  } catch (error) {
    console.error('Resend email failed:', error);
  }

  try {
    if (await sendWithSmtp({ to, subject, html, attachment, replyTo })) return true;
  } catch (error) {
    console.error('SMTP email failed:', error);
  }

  console.warn('Email provider credentials are not configured. Email was logged instead.');
  console.log(`--- ${logLabel} ---`);
  console.log(`To: ${to}`);
  if (replyTo) console.log(`Reply-To: ${replyTo}`);
  console.log(`Subject: ${subject}`);
  console.log(html);
  return false;
};

module.exports = { sendEmail };
