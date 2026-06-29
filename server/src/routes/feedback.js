const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Feedback = require('../models/Feedback');
const { feedbackUpload } = require('../config/storage');

// Configure nodemailer transporter
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('SMTP credentials not configured. Emails will be logged to console only.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

// Helper: build public file URL from multer file
const buildFileUrl = (req, filename) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

// POST /api/feedback - Submit Gift form data with a required screenshot
router.post('/', feedbackUpload.single('screenshot'), async (req, res) => {
  try {
    const { fullName, email, phone, issueType, description, additionalComments } = req.body;

    if (!fullName || !email || !issueType || !description) {
      return res.status(400).json({ message: 'Full name, email, issue type, and description are required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Screenshot is required' });
    }

    const screenshotUrl = buildFileUrl(req, req.file.filename);

    const feedback = await Feedback.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      issueType,
      description: description.trim(),
      screenshotUrl,
      additionalComments: additionalComments ? additionalComments.trim() : undefined
    });

    // Send emails
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || 'priyankakhasa937@gmail.com';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #c17a5c; margin-bottom: 20px;">New Gift Submission</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-weight: bold; width: 120px;">Name</td><td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${fullName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Email</td><td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${email}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${phone || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Issue Type</td><td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${issueType}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Description</td><td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${description}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #f0f0f0; font-weight: bold;">Additional Comments</td><td style="padding: 8px; border-bottom: 1px solid #f0f0f0;">${additionalComments || 'N/A'}</td></tr>
        </table>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">Submitted on ${new Date().toLocaleString()}</p>
      </div>
    `;

    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #c17a5c; margin-bottom: 20px;">Thank you for your submission!</h2>
        <p>Hi ${fullName},</p>
        <p>We have received your ${issueType.toLowerCase()} message and our team will review it shortly.</p>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">If you need further assistance, please contact us at ${adminEmail}.</p>
      </div>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"BPSMV Hub" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          subject: `New Gift Submission: ${issueType} from ${fullName}`,
          html: emailHtml,
          attachments: [{
            filename: req.file.originalname,
            path: req.file.path
          }]
        });

        await transporter.sendMail({
          from: `"BPSMV Hub" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Thank you for your Gift submission',
          html: confirmationHtml
        });
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
      }
    } else {
      console.log('--- GIFT EMAIL (Admin) ---');
      console.log(`To: ${adminEmail}`);
      console.log(`Subject: New Gift Submission: ${issueType} from ${fullName}`);
      console.log(emailHtml);
      console.log('--- CONFIRMATION EMAIL ---');
      console.log(`To: ${email}`);
      console.log(confirmationHtml);
    }

    res.status(201).json({ message: 'Gift submitted successfully', feedback });
  } catch (error) {
    console.error('Gift submission error:', error);
    res.status(500).json({ message: 'Error submitting Gift form' });
  }
});

module.exports = router;
