const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { seedSubjects } = require('../seedSubjects');
const { router: paymentRouter, webhook: paymentWebhook } = require('./routes/payments');
const { verifyToken } = require('./routes/auth');
const { requireActiveSubscription } = require('./utils/subscription');
const { cleanEnvValue } = require('./utils/env');
const { mongoSanitize } = require('./utils/request');

// Initialize express app
const app = express();

const passport = require('./config/passport');

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'bpsmv_fallback_secret_2026') {
    throw new Error('JWT_SECRET must be set to a strong unique value in production');
  }
  if (!process.env.CLIENT_URL && !process.env.CLIENT_URLS) {
    throw new Error('CLIENT_URL or CLIENT_URLS must be set in production');
  }
  if (!process.env.ADMIN_EMAIL) {
    throw new Error('ADMIN_EMAIL must be set in production');
  }
  const optionalIntegrations = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET'
  ];
  const missingIntegrations = optionalIntegrations.filter((key) => !process.env[key]);
  if (missingIntegrations.length) {
    console.warn(
      `Payment access is locked until these environment variables are configured: ${missingIntegrations.join(', ')}`
    );
  }
}

// Middleware
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => cleanEnvValue(origin))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.post('/api/payments/webhook', express.raw({ type: 'application/json', limit: '256kb' }), paymentWebhook);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize);
app.use(cookieParser());
app.use(passport.initialize());

console.log('[Auth] Passport initialized');
console.log(`[Auth] Google OAuth enabled: ${passport.googleEnabled}`);
if (!passport.googleEnabled) {
  console.warn(`[Auth] Google OAuth disabled reason: ${passport.googleConfigProblem || 'unknown'}`);
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BPSMV Resource Hub API is running' });
});

// Import and use other routes here
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);
app.use('/api/payments', paymentRouter);

// Existing upload URLs remain usable, but are no longer public.
app.get('/uploads/:filename', verifyToken, requireActiveSubscription, (req, res) => {
  const filename = path.basename(req.params.filename);
  if (filename !== req.params.filename) {
    return res.status(400).json({ message: 'Invalid filename' });
  }
  return res.sendFile(filename, {
    root: path.join(__dirname, '../uploads'),
    dotfiles: 'deny',
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  }, (error) => {
    if (error && !res.headersSent) {
      res.status(error.statusCode || 404).json({ message: 'File not found' });
    }
  });
});

app.use('/api', (req, res, next) => {
  const publicRequest =
    (req.method === 'GET' && req.path === '/resources/public/stats') ||
    (req.method === 'GET' && req.path.startsWith('/activity/public/')) ||
    (req.method === 'GET' && req.path === '/reviews/approved') ||
    (req.method === 'POST' && req.path === '/feedback');
  if (publicRequest) return next();
  return verifyToken(req, res, () => requireActiveSubscription(req, res, next));
});
app.use('/api/resources', require('./routes/resources'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/job-updates', require('./routes/jobUpdates'));
app.use('/api/activity', require('./routes/activity'));

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  try {
    await seedSubjects();
  } catch (error) {
    console.error(`Subject seed check failed: ${error.message}`);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
