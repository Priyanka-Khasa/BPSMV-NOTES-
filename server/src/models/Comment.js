const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: function() { return this.type !== 'voice'; },
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  audioUrl: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  subjectName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
