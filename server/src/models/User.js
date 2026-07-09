const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    required: function() { return this.onboarded === true; },
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  },
  avatar: {
    type: String
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  socialLinks: {
    github: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' },
    facebook: { type: String, trim: true, default: '' },
    leetcode: { type: String, trim: true, default: '' },
    portfolio: { type: String, trim: true, default: '' },
    hackerrank: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' }
  },
  semesterCgpa: [{
    semester: {
      type: Number,
      min: 1,
      max: 8,
      required: true
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
    completedMonth: {
      type: String,
      trim: true,
      default: ''
    },
    completedYear: {
      type: Number,
      min: 2000,
      max: 2100,
      default: null
    }
  }],
  degree: {
    type: String,
    enum: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'BBA', 'MBA', 'B.Sc', 'M.Sc', 'B.A', 'M.A', 'Other'],
  },
  branch: {
    type: String,
    trim: true
  },
  yearOfStudy: {
    type: Number,
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    min: 1,
    max: 8
  },
  lastAcademicProgressionAt: {
    type: Date
  },
  lastAcademicProgressionCycle: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  onboarded: {
    type: Boolean,
    default: false
  },
  activeSessionId: {
    type: String,
    select: false
  },
  lastLoginAt: {
    type: Date
  },
  subscription: {
    status: {
      type: String,
      enum: ['inactive', 'active', 'cancelled'],
      default: 'inactive'
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly', null],
      default: null
    },
    startsAt: Date,
    expiresAt: Date,
    lastPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
