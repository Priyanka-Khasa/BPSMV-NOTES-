const nodemailer = require('nodemailer');

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number.parseInt(process.env.SMTP_PORT || '587', 10);
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

const sendWithResend = async ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'BPSMV Hub <onboarding@resend.dev>',
      to,
      subject,
      html
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend email failed (${response.status}): ${details}`);
  }

  return true;
};

const sendEmail = async ({ to, subject, html }) => {
  const sentWithResend = await sendWithResend({ to, subject, html });
  if (sentWithResend) return true;

  const transporter = createTransporter();
  if (!transporter) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('--- EMAIL NOT CONFIGURED ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(html);
      return true;
    }
    throw new Error('Email provider is not configured');
  }

  await transporter.sendMail({
    from: `"BPSMV Hub" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  });
  return true;
};

module.exports = { sendEmail };
