const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    default: null
  },
  linkUrl: {
    type: String,
    default: null
  },
  resourceType: {
    type: String,
    enum: ['Note', 'Question Paper', 'Link', 'Syllabus'],
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'image', 'link', 'other'],
    default: 'other'
  },
  year: {
    type: Number,
    min: 2000,
    max: 2100
  },
  semester: {
    type: Number,
    min: 1,
    max: 10
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  subjectName: {
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
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploaderName: {
    type: String,
    required: true
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

resourceSchema.index({ degree: 1, branch: 1, semester: 1, isApproved: 1, createdAt: -1 });
resourceSchema.index({ subjectId: 1, isApproved: 1, resourceType: 1, createdAt: -1 });

module.exports = mongoose.model('Resource', resourceSchema);
