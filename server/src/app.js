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

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BPSMV Resource Hub API is running' });
});

// Import and use other routes here
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);
app.use('/api/resources', require('./routes/resources'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
