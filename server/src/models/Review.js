const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  profileImage: {
    type: String,
    default: null
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  ipAddress: {
    type: String,
    select: false
  },
  userAgent: {
    type: String,
    select: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
