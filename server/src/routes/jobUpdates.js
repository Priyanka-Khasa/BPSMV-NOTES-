const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const JobUpdate = require('../models/JobUpdate');
const User = require('../models/User');
const { verifyToken } = require('./auth');

const canDelete = (user, update) => {
  return user.role === 'admin' || update.postedBy.toString() === user.id;
};

router.get('/', verifyToken, async (req, res) => {
  try {
    const { category, mode, search, page = 1, limit = 30 } = req.query;
    const filter = { isApproved: true };

    if (category && category !== 'All') filter.category = category;
    if (mode && mode !== 'All') filter.mode = mode;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const parsedPage = Math.max(parseInt(page, 10), 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10), 1), 50);

    const [updates, total] = await Promise.all([
      JobUpdate.find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .populate('postedBy', 'name email role'),
      JobUpdate.countDocuments(filter)
    ]);

    res.json({
      updates,
      total,
      page: parsedPage,
      pages: Math.ceil(total / parsedLimit)
    });
  } catch (error) {
    console.error('Error fetching job updates:', error);
    res.status(500).json({ message: 'Error fetching job updates' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      title,
      company,
      category,
      mode,
      location,
      stipend,
      eligibility,
      deadline,
      applyUrl,
      sourceName,
      summary,
      tags
    } = req.body;

    if (!title || !company || !applyUrl || !summary) {
      return res.status(400).json({ message: 'Title, company, apply link, and summary are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const tagList = Array.isArray(tags)
      ? tags
      : String(tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

    const update = await JobUpdate.create({
      title,
      company,
      category,
      mode,
      location,
      stipend,
      eligibility,
      deadline: deadline ? new Date(deadline) : null,
      applyUrl,
      sourceName,
      summary,
      tags: tagList.slice(0, 8),
      postedBy: user._id,
      posterName: user.name,
      isPinned: user.role === 'admin' && req.body.isPinned === true
    });

    const populatedUpdate = await JobUpdate.findById(update._id).populate('postedBy', 'name email role');
    res.status(201).json(populatedUpdate);
  } catch (error) {
    console.error('Error creating job update:', error);
    res.status(500).json({ message: 'Error creating job update' });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid update ID' });
    }

    const [update, user] = await Promise.all([
      JobUpdate.findById(req.params.id),
      User.findById(req.user.id)
    ]);
    if (!update) return res.status(404).json({ message: 'Job update not found' });
    if (!user) return res.status(401).json({ message: 'User not found' });

    if (!canDelete(user, update)) {
      return res.status(403).json({ message: 'Not authorized to delete this update' });
    }

    await JobUpdate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job update deleted successfully' });
  } catch (error) {
    console.error('Error deleting job update:', error);
    res.status(500).json({ message: 'Error deleting job update' });
  }
});

module.exports = router;
