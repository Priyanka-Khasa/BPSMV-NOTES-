const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Initialize express app
const app = express();

// Connect to database
connectDB();

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

// Serve uploaded files statically
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
app.use('/api/gifts', require('./routes/gifts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Uploads served at http://localhost:${PORT}/uploads`);
});
