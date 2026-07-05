const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\d\s+\-()]{7,20}$/, 'Invalid phone number']
  },
  issueType: {
    type: String,
    enum: ['Bug', 'Genuine Issue', 'Feature Request', 'Content Issue', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  screenshotUrl: {
    type: String,
    default: null
  },
  additionalComments: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  isResolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
