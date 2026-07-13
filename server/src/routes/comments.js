const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Subject = require('../models/Subject');
const User = require('../models/User');
const { verifyToken } = require('./auth');
const { audioUpload, getUploadedFileUrl } = require('../config/storage');
const { asString } = require('../utils/request');
const { commentLimiter, uploadLimiter } = require('../utils/rateLimiters');

// Get comments for a subject
router.get('/:subjectId', verifyToken, async (req, res) => {
  try {
    const subjectId = asString(req.params.subjectId, 40);
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    const comments = await Comment.find({ subjectId, isDeleted: { $ne: true } })
      .sort({ createdAt: 1 })
      .populate('userId', 'name email');
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

// Add a text comment
router.post('/:subjectId', verifyToken, commentLimiter, async (req, res) => {
  try {
    const subjectId = asString(req.params.subjectId, 40);
    const text = asString(req.body.text, 2000);
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const comment = await Comment.create({
      text,
      type: 'text',
      userId: user._id,
      userName: user.name,
      subjectId: subject._id,
      subjectName: subject.name
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Add a voice comment
router.post('/:subjectId/voice', verifyToken, uploadLimiter, audioUpload.single('audio'), async (req, res) => {
  try {
    const subjectId = asString(req.params.subjectId, 40);
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const comment = await Comment.create({
      text: 'Voice message',
      type: 'voice',
      audioUrl: getUploadedFileUrl(req, req.file),
      userId: user._id,
      userName: user.name,
      subjectId: subject._id,
      subjectName: subject.name
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding voice comment:', error);
    res.status(500).json({ message: 'Error adding voice comment' });
  }
});

// Delete a comment
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    const commentId = asString(req.params.commentId, 40);
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const canDelete = req.user.role === 'admin' || comment.userId.toString() === req.user.id;
    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.isDeleted = true;
    await comment.save();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

module.exports = router;
