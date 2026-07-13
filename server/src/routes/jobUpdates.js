const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const JobUpdate = require('../models/JobUpdate');
const User = require('../models/User');
const { verifyToken } = require('./auth');
const { makeSafeContainsRegex } = require('../utils/regex');
const { asBoolean, asInteger, asString } = require('../utils/request');

const canDelete = (user, update) => {
  return user.role === 'admin' || update.postedBy.toString() === user.id;
};

router.get('/', verifyToken, async (req, res) => {
  try {
    const category = asString(req.query.category, 60);
    const mode = asString(req.query.mode, 60);
    const search = asString(req.query.search, 100);
    const page = asInteger(req.query.page, { min: 1, max: 10000 }) || 1;
    const limit = asInteger(req.query.limit, { min: 1, max: 50 }) || 30;
    const filter = { isApproved: true };

    if (category && category !== 'All') filter.category = category;
    if (mode && mode !== 'All') filter.mode = mode;
    const safeSearch = makeSafeContainsRegex(search);
    if (safeSearch) {
      filter.$or = [
        { title: safeSearch },
        { company: safeSearch },
        { summary: safeSearch },
        { tags: safeSearch }
      ];
    }

    const [updates, total] = await Promise.all([
      JobUpdate.find(filter)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('postedBy', 'name email role'),
      JobUpdate.countDocuments(filter)
    ]);

    res.json({
      updates,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching job updates:', error);
    res.status(500).json({ message: 'Error fetching job updates' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const title = asString(req.body.title, 180);
    const company = asString(req.body.company, 120);
    const category = asString(req.body.category, 60);
    const mode = asString(req.body.mode, 60);
    const location = asString(req.body.location, 120);
    const stipend = asString(req.body.stipend, 120);
    const eligibility = asString(req.body.eligibility, 500);
    const deadline = asString(req.body.deadline, 40);
    const applyUrl = asString(req.body.applyUrl, 2000);
    const sourceName = asString(req.body.sourceName, 120);
    const summary = asString(req.body.summary, 1500);

    if (!title || !company || !applyUrl || !summary) {
      return res.status(400).json({ message: 'Title, company, apply link, and summary are required' });
    }
    if (!/^https?:\/\//i.test(applyUrl)) {
      return res.status(400).json({ message: 'Apply link must start with http:// or https://' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const tagList = Array.isArray(req.body.tags)
      ? req.body.tags.map((tag) => asString(tag, 40)).filter(Boolean)
      : asString(req.body.tags, 300)
        .split(',')
        .map((tag) => asString(tag, 40))
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
      isPinned: user.role === 'admin' && asBoolean(req.body.isPinned) === true
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
    const updateId = asString(req.params.id, 40);
    if (!mongoose.Types.ObjectId.isValid(updateId)) {
      return res.status(400).json({ message: 'Invalid update ID' });
    }

    const [update, user] = await Promise.all([
      JobUpdate.findById(updateId),
      User.findById(req.user.id)
    ]);
    if (!update) return res.status(404).json({ message: 'Job update not found' });
    if (!user) return res.status(401).json({ message: 'User not found' });

    if (!canDelete(user, update)) {
      return res.status(403).json({ message: 'Not authorized to delete this update' });
    }

    await JobUpdate.findByIdAndDelete(updateId);
    res.json({ message: 'Job update deleted successfully' });
  } catch (error) {
    console.error('Error deleting job update:', error);
    res.status(500).json({ message: 'Error deleting job update' });
  }
});

module.exports = router;
