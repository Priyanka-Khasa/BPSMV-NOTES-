const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of subject per degree, branch, and code
subjectSchema.index({ code: 1, degree: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
