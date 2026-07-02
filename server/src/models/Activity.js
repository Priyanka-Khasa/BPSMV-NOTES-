const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['pdf_opened', 'pdf_completed', 'internship_applied'],
    required: true,
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    default: null
  },
  jobUpdateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobUpdate',
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subjectName: {
    type: String,
    trim: true,
    default: ''
  },
  company: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, type: 1, resourceId: 1 });
activitySchema.index({ userId: 1, type: 1, jobUpdateId: 1 });

module.exports = mongoose.model('Activity', activitySchema);
