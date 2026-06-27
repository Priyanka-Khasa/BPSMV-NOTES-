const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Subject = require('../models/Subject');
const User = require('../models/User');
const { verifyToken } = require('./auth');
const { audioUpload } = require('../config/storage');

const buildFileUrl = (req, filename) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

// Get comments for a subject
router.get('/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
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
router.post('/:subjectId', verifyToken, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { text } = req.body;
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const comment = await Comment.create({
      text: text.trim(),
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
router.post('/:subjectId/voice', verifyToken, audioUpload.single('audio'), async (req, res) => {
  try {
    const { subjectId } = req.params;
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
      text: '🎤 Voice message',
      type: 'voice',
      audioUrl: buildFileUrl(req, req.file.filename),
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
    const { commentId } = req.params;
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
