const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    enum: ['Note', 'Question Paper'],
    required: true
  },
  year: {
    type: Number, // Applicable mainly for 'Question Paper'
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: true // Set to false if we want admin approval before it's public
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
