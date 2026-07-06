const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of subject per degree, branch, and code
subjectSchema.index({ code: 1, degree: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
