const mongoose = require('mongoose');

const jobUpdateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Internship', 'Job', 'Hiring Challenge', 'Scholarship', 'Career News'],
    default: 'Internship'
  },
  mode: {
    type: String,
    enum: ['Remote', 'On-site', 'Hybrid', 'Online'],
    default: 'Remote'
  },
  location: {
    type: String,
    default: 'India'
  },
  stipend: {
    type: String,
    default: 'Not disclosed'
  },
  eligibility: {
    type: String,
    default: 'BTech students'
  },
  deadline: {
    type: Date,
    default: null
  },
  applyUrl: {
    type: String,
    required: true,
    trim: true
  },
  sourceName: {
    type: String,
    default: 'Shared by BPSMV Hub'
  },
  summary: {
    type: String,
    required: true,
    trim: true,
    maxlength: 600
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  posterName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

jobUpdateSchema.index({ isApproved: 1, isPinned: -1, createdAt: -1 });
jobUpdateSchema.index({ title: 'text', company: 'text', summary: 'text', tags: 'text' });

module.exports = mongoose.model('JobUpdate', jobUpdateSchema);
