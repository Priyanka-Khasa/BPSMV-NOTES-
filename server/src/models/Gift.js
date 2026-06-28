const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  degree: {
    type: String,
    required: true,
    trim: true
  },
  branch: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  requestType: {
    type: String,
    enum: ['Request', 'Donate'],
    required: true
  },
  itemType: {
    type: String,
    enum: ['Book', 'Notes', 'Question Paper', 'Stationery', 'Lab Manual', 'Other'],
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  itemDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    trim: true,
    match: [/[\d\s+\-()]{7,20}/, 'Invalid phone number']
  },
  status: {
    type: String,
    enum: ['Pending', 'Fulfilled', 'Closed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gift', giftSchema);
