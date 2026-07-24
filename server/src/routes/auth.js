const express = require('express');
const router = express.Router();
const crypto = require('crypto');
require('../config/passport');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { applyAcademicProgression, normalizeBranch, normalizeYearSemester, yearFromSemester } = require('../utils/academicProgression');
const { subscriptionSummary } = require('../utils/subscription');
const { cleanEnvValue } = require('../utils/env');
const {
  SESSION_MAX_AGE,
  createSessionId,
  createAuthToken,
  isActiveSession
} = require('../utils/authSession');
const { sendEmail } = require('../utils/email');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait and try again.' }
});

const guestLoginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many guest login attempts. Please wait and try again.' }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many verification attempts. Please wait and try again.' }
});

const EMAIL_OTP_TTL_MS = 5 * 60 * 1000;
const pendingEmailVerifications = new Map();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.COOKIE_SAME_SITE || 'lax',
  maxAge: SESSION_MAX_AGE
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
  onboarded: isAcademicProfileComplete(user),
  role: user.role,
  isVerified: Boolean(user.isVerified),
  degree: user.degree,
  branch: user.branch,
  yearOfStudy: user.yearOfStudy,
  semester: user.semester,
  avatar: user.avatar,
  bio: user.bio,
  socialLinks: user.socialLinks,
  semesterCgpa: user.semesterCgpa,
  subscription: subscriptionSummary(user)
});

const isAcademicProfileComplete = (user) => Boolean(
  user?.onboarded &&
  user?.rollNumber &&
  user?.degree &&
  user?.branch &&
  user?.yearOfStudy &&
  user?.semester
);

// Helper to sign JWT and set cookie. The session id is checked against the
// database on every protected request so only the newest login remains valid.
const setAuthCookie = (res, user, sessionId) => {
  const token = createAuthToken(user, sessionId);
  res.cookie('token', token, cookieOptions);
  return token;
};

const startSingleDeviceSession = async (res, user) => {
  const sessionId = createSessionId();
  const lastLoginAt = new Date();
  await User.findByIdAndUpdate(user._id, { activeSessionId: sessionId, lastLoginAt });
  user.activeSessionId = sessionId;
  user.lastLoginAt = lastLoginAt;
  setAuthCookie(res, user, sessionId);
  return sessionId;
};

const getClientUrl = () => cleanEnvValue(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const createOtpCode = () => String(Math.floor(100000 + Math.random() * 900000));

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const sendVerificationEmail = async ({ to, code }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e6dcff; border-radius: 12px; background: #f8fbff;">
      <h2 style="margin-bottom: 12px; color: #6638e6;">Verify your email</h2>
      <p style="font-size: 15px; color: #343c53;">Use the code below to complete your BPSMV Resource Hub registration.</p>
      <div style="margin: 20px 0; padding: 16px; border-radius: 10px; background: #ffffff; font-size: 28px; letter-spacing: 0.3em; font-weight: 700; text-align: center; color: #07050f;">${code}</div>
      <p style="font-size: 13px; color: #4c556e;">This code expires in 5 minutes.</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: 'Verify your BPSMV Resource Hub email',
    html,
    logLabel: 'OTP EMAIL'
  });
};

const getPendingVerification = (email) => {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const pending = pendingEmailVerifications.get(normalizedEmail);
  if (!pending) return null;
  if (Date.now() > pending.expiresAt) {
    pendingEmailVerifications.delete(normalizedEmail);
    return null;
  }
  return pending;
};

const setPendingVerification = (email, otp, verified = false) => {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const entry = {
    otpHash: hashOtp(otp),
    createdAt: Date.now(),
    expiresAt: Date.now() + EMAIL_OTP_TTL_MS,
    verified
  };
  pendingEmailVerifications.set(normalizedEmail, entry);
  return entry;
};

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
        if (!isAcademicProfileComplete(user) && user.onboarded) {
          user.onboarded = false;
          await user.save({ validateBeforeSave: false });
        }
        await startSingleDeviceSession(res, user);
        return res.redirect(isAcademicProfileComplete(user) ? `${clientUrl}/subscribe` : `${clientUrl}/onboarding`);
      } catch (sessionError) {
        console.error('Google session error:', sessionError);
        return res.redirect(`${clientUrl}/login?error=session_failed`);
      }
    })(req, res, next);
  });
} else {
  router.get('/google', (req, res) => {
    res.status(503).json({
      message: 'Google OAuth is not configured. Please use email/password login.',
      reason: passport.googleConfigProblem || 'Google credentials are missing or invalid'
    });
  });
  router.get('/google/callback', (req, res) => {
    res.status(503).json({
      message: 'Google OAuth is not configured.',
      reason: passport.googleConfigProblem || 'Google credentials are missing or invalid'
    });
  });
}

router.post('/request-otp', otpLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const otp = createOtpCode();
    setPendingVerification(email, otp);
    await sendVerificationEmail({ to: email, code: otp });
    res.json({ message: 'Verification code sent. Check your inbox.' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Unable to send verification code' });
  }
});

router.post('/verify-otp', otpLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const pending = getPendingVerification(email);
    if (!pending) {
      return res.status(400).json({ message: 'Verification code expired or not requested' });
    }

    const isMatch = pending.otpHash === hashOtp(otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    pendingEmailVerifications.set(email, { ...pending, verified: true, verifiedAt: Date.now(), expiresAt: Date.now() + EMAIL_OTP_TTL_MS });
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Unable to verify email' });
  }
});

// Email/Password Register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, rollNumber, verificationCode } = req.body;
    if (!name || !email || !password || !rollNumber) {
      return res.status(400).json({ message: 'Name, email, password and roll number are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!rollNumber.trim()) {
      return res.status(400).json({ message: 'Roll number is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const existingRoll = await User.findOne({ rollNumber: rollNumber.trim().toUpperCase() });
    if (existingRoll) {
      return res.status(409).json({ message: 'Roll number already registered' });
    }

    const pending = getPendingVerification(normalizedEmail);
    const isVerifiedEmail = Boolean(pending?.verified || verificationCode);
    if (!isVerifiedEmail) {
      return res.status(403).json({ message: 'Please verify your email before creating an account.' });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      rollNumber: rollNumber.trim().toUpperCase(),
      onboarded: false,
      isVerified: true
    });
    pendingEmailVerifications.delete(normalizedEmail);
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
router.post('/login', authLimiter, async (req, res) => {
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

    if (!isActiveSession(user, decoded)) {
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
    const responseUser = user.toObject();
    responseUser.onboarded = isAcademicProfileComplete(user);
    responseUser.subscription = subscriptionSummary(user);
    res.json(responseUser);
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
router.post('/guest', guestLoginLimiter, (req, res) => {
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
const { upload: localUpload, getUploadedFileUrl } = require('../config/storage');

router.post('/avatar', verifyToken, localUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = getUploadedFileUrl(req, req.file);
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

module.exports = { router, verifyToken, publicUser, isAcademicProfileComplete };
