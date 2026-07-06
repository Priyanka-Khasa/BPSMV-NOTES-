const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { applyAcademicProgression, normalizeBranch, normalizeYearSemester, yearFromSemester } = require('../utils/academicProgression');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const clearAuthCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax'
  });
};

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  rollNumber: user.rollNumber,
  onboarded: user.onboarded,
  role: user.role,
  degree: user.degree,
  branch: user.branch,
  yearOfStudy: user.yearOfStudy,
  semester: user.semester,
  avatar: user.avatar,
  bio: user.bio,
  socialLinks: user.socialLinks,
  semesterCgpa: user.semesterCgpa
});

// Helper to sign JWT and set cookie. The session id is checked against the
// database on every protected request so only the newest login remains valid.
const setAuthCookie = (res, user, sessionId) => {
  const secret = process.env.JWT_SECRET || 'bpsmv_fallback_secret_2026';
  const token = jwt.sign(
    { id: user._id, onboarded: user.onboarded, role: user.role, sessionId },
    secret,
    { expiresIn: '7d' }
  );
  res.cookie('token', token, cookieOptions);
  return token;
};

const startSingleDeviceSession = async (res, user) => {
  const sessionId = crypto.randomUUID();
  const lastLoginAt = new Date();
  await User.findByIdAndUpdate(user._id, { activeSessionId: sessionId, lastLoginAt });
  user.activeSessionId = sessionId;
  user.lastLoginAt = lastLoginAt;
  setAuthCookie(res, user, sessionId);
  return sessionId;
};

const getClientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

// Google OAuth routes (only if credentials are valid)
if (passport.googleEnabled) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false }, async (error, user, info) => {
      const clientUrl = getClientUrl();
      if (error || !user) {
        console.error('Google callback error:', error || info || 'No user returned');
        return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
      }

      try {
        await applyAcademicProgression(user);
        await startSingleDeviceSession(res, user);
        return res.redirect(user.onboarded ? `${clientUrl}/dashboard` : `${clientUrl}/onboarding`);
      } catch (sessionError) {
        console.error('Google session error:', sessionError);
        return res.redirect(`${clientUrl}/login?error=session_failed`);
      }
    })(req, res, next);
  });
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
    const { name, email, password, rollNumber } = req.body;
    if (!name || !email || !password || !rollNumber) {
      return res.status(400).json({ message: 'Name, email, password and roll number are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!rollNumber.trim()) {
      return res.status(400).json({ message: 'Roll number is required' });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const existingRoll = await User.findOne({ rollNumber: rollNumber.trim().toUpperCase() });
    if (existingRoll) {
      return res.status(409).json({ message: 'Roll number already registered' });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password, rollNumber: rollNumber.trim().toUpperCase(), onboarded: false });
    await startSingleDeviceSession(res, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    console.error('Register error FULL:', error);
    res.status(500).json({
      message: 'Server error during registration',
      ...(process.env.NODE_ENV !== 'production' ? { details: error.message, stack: error.stack } : {})
    });
  }
});

// Email/Password Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +activeSessionId');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await applyAcademicProgression(user);
    await startSingleDeviceSession(res, user);
    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bpsmv_fallback_secret_2026');
    if (!decoded.sessionId) {
      clearAuthCookie(res);
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    const user = await User.findById(decoded.id).select('+activeSessionId');
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.activeSessionId !== decoded.sessionId) {
      clearAuthCookie(res);
      return res.status(401).json({ message: 'This account is active on another device. Please log in again on this device.' });
    }

    req.user = decoded;
    req.authUser = user;
    next();
  } catch (err) {
    clearAuthCookie(res);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get Current User Profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    await applyAcademicProgression(user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Profile (Onboarding + general update)
router.post('/onboard', verifyToken, async (req, res) => {
  try {
    const { degree, branch, yearOfStudy, semester, rollNumber } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!degree || !branch || !yearOfStudy || !semester) {
      return res.status(400).json({ message: 'Degree, branch, year and semester are required' });
    }

    const normalizedAcademic = normalizeYearSemester(yearOfStudy, semester);
    if (normalizedAcademic.error) return res.status(400).json({ message: normalizedAcademic.error });

    const updates = {
      degree,
      branch: normalizeBranch(branch),
      yearOfStudy: normalizedAcademic.yearOfStudy,
      semester: normalizedAcademic.semester,
      lastAcademicProgressionAt: new Date(),
      lastAcademicProgressionCycle: '',
      onboarded: true
    };

    // If user doesn't have a rollNumber (e.g., Google OAuth), require it
    if (!user.rollNumber) {
      if (!rollNumber || !rollNumber.trim()) {
        return res.status(400).json({ message: 'Roll number is required to complete onboarding' });
      }
      const normalizedRollNumber = rollNumber.trim().toUpperCase();
      const existingRoll = await User.findOne({
        rollNumber: normalizedRollNumber,
        _id: { $ne: user._id }
      });
      if (existingRoll) {
        return res.status(409).json({ message: 'Roll number already registered' });
      }
      updates.rollNumber = normalizedRollNumber;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    setAuthCookie(res, updatedUser, req.user.sessionId);
    res.json(publicUser(updatedUser));
  } catch (error) {
    console.error('Onboard error:', error);
    if (error.code === 11000 && error.keyPattern?.rollNumber) {
      return res.status(409).json({ message: 'Roll number already registered' });
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)[0]?.message || 'Invalid profile details';
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Update Profile (general)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, degree, branch, yearOfStudy, semester, bio, socialLinks, semesterCgpa } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only admins can update rollNumber
    const cgpaRows = Array.isArray(semesterCgpa)
      ? semesterCgpa
        .slice(0, 8)
        .map((row, index) => ({
          semester: index + 1,
          cgpa: row.cgpa === '' || row.cgpa === null || row.cgpa === undefined ? null : Number(row.cgpa),
          completedMonth: row.completedMonth || '',
          completedYear: row.completedYear === '' || row.completedYear === null || row.completedYear === undefined ? null : Number(row.completedYear)
        }))
        .filter((row) => row.cgpa === null || (row.cgpa >= 0 && row.cgpa <= 10))
      : undefined;

    const normalizedAcademic = normalizeYearSemester(yearOfStudy, semester);
    if (normalizedAcademic.error) return res.status(400).json({ message: normalizedAcademic.error });

    let updates = {
      name,
      degree,
      branch: normalizeBranch(branch),
      yearOfStudy: normalizedAcademic.yearOfStudy,
      semester: normalizedAcademic.semester,
      lastAcademicProgressionAt: new Date(),
      lastAcademicProgressionCycle: '',
      bio: bio || '',
      socialLinks: {
        github: socialLinks?.github || '',
        linkedin: socialLinks?.linkedin || '',
        instagram: socialLinks?.instagram || '',
        facebook: socialLinks?.facebook || '',
        leetcode: socialLinks?.leetcode || '',
        portfolio: socialLinks?.portfolio || '',
        hackerrank: socialLinks?.hackerrank || '',
        website: socialLinks?.website || ''
      }
    };

    if (cgpaRows) {
      updates.semesterCgpa = cgpaRows;
      const completedSemesters = cgpaRows.filter((row) => row.cgpa !== null && row.completedMonth);
      if (completedSemesters.length > 0) {
        const latestCompleted = Math.max(...completedSemesters.map((row) => row.semester));
        updates.semester = Math.min(latestCompleted + 1, 8);
        updates.yearOfStudy = yearFromSemester(updates.semester);
      }
    }
    if (req.body.rollNumber !== undefined && user.role === 'admin') {
      updates.rollNumber = req.body.rollNumber.trim().toUpperCase();
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-googleId');
    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Logout
router.post('/logout', verifyToken, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $unset: { activeSessionId: '' } });
  clearAuthCookie(res);
  res.json({ message: 'Logged out successfully' });
});

// Guest Login
router.post('/guest', (req, res) => {
  if (process.env.ENABLE_GUEST_LOGIN !== 'true') {
    return res.status(404).json({ message: 'Guest login is disabled' });
  }
  return guestLoginHandler(req, res);
});

const guestLoginHandler = async (req, res) => {
  try {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const email = `guest-${timestamp}-${randomStr}@bpsmv.local`;
    const now = new Date();
    const dateStr = now.toISOString().slice(0,10).replace(/-/g,'');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const rollNumber = `GST-${dateStr}-${random}`;
    const user = await User.create({
      name: 'Guest Student',
      email: email.toLowerCase(),
      rollNumber,
      password: randomStr + timestamp + Math.random().toString(36),
      role: 'student',
      onboarded: true
    });
    await startSingleDeviceSession(res, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Guest login failed', details: error.message });
  }
};

// Avatar upload
const { upload: localUpload } = require('../config/storage');

router.post('/avatar', verifyToken, localUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: fileUrl },
      { new: true }
    ).select('-googleId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

module.exports = { router, verifyToken };
