const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Initialize express app
const app = express();

const passport = require('./config/passport');

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Serve non-PDF uploaded files statically. Resource PDFs are served only through
// protected resource routes so direct sharing of /uploads/*.pdf does not work.
app.use('/uploads', (req, res, next) => {
  if (req.path.toLowerCase().endsWith('.pdf')) {
    return res.status(403).json({ message: 'Direct PDF access is blocked' });
  }
  return next();
}, express.static(path.join(__dirname, '../uploads')));

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
