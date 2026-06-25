const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign JWT and set cookie
const setAuthCookie = (res, user) => {
  const secret = process.env.JWT_SECRET || 'bpsmv_fallback_secret_2026';
  const token = jwt.sign(
    { id: user._id, onboarded: user.onboarded, role: user.role },
    secret,
    { expiresIn: '7d' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  return token;
};

// Google OAuth routes (only if credentials are valid)
if (passport.googleEnabled) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login-failed' }),
    (req, res) => {
      setAuthCookie(res, req.user);
      if (req.user.onboarded) {
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
      } else {
        res.redirect(`${process.env.CLIENT_URL}/onboarding`);
      }
    }
  );
} else {
  router.get('/google', (req, res) => {
    res.status(503).json({ message: 'Google OAuth is not configured. Please use email/password login.' });
  });
  router.get('/google/callback', (req, res) => {
    res.status(503).json({ message: 'Google OAuth is not configured.' });
  });
}

// Email/Password Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password, onboarded: false });
    setAuthCookie(res, user);
    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email, onboarded: user.onboarded } });
  } catch (error) {
    console.error('Register error FULL:', error);
    res.status(500).json({ message: 'Server error during registration', details: error.message, stack: error.stack });
  }
});

// Email/Password Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    setAuthCookie(res, user);
    res.json({ user: { _id: user._id, name: user.name, email: user.email, onboarded: user.onboarded, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bpsmv_fallback_secret_2026');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get Current User Profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile (Onboarding + general update)
router.post('/onboard', verifyToken, async (req, res) => {
  try {
    const { degree, branch, yearOfStudy, semester } = req.body;
    const updates = { degree, branch, yearOfStudy, semester, onboarded: true };
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    setAuthCookie(res, user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Update Profile (general)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, degree, branch, yearOfStudy, semester } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, degree, branch, yearOfStudy, semester },
      { new: true, runValidators: true }
    ).select('-googleId');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Guest Login
router.post('/guest', async (req, res) => {
  try {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const email = `guest-${timestamp}-${randomStr}@bpsmv.local`;
    const user = await User.create({
      name: 'Guest Student',
      email: email.toLowerCase(),
      password: randomStr + timestamp + Math.random().toString(36),
      role: 'student',
      onboarded: true
    });
    setAuthCookie(res, user);
    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email, onboarded: true, role: 'student' } });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Guest login failed', details: error.message });
  }
});

module.exports = { router, verifyToken };
