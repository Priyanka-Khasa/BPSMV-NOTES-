const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

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
}

// Middleware
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Serve uploaded files normally so students can open and download PDFs.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BPSMV Resource Hub API is running' });
});

// Import and use other routes here
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);
app.use('/api/resources', require('./routes/resources'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/job-updates', require('./routes/jobUpdates'));
app.use('/api/activity', require('./routes/activity'));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Uploads served at http://localhost:${PORT}/uploads`);
  });
});
