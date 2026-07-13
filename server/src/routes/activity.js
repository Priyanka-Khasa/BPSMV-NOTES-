const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const Resource = require('../models/Resource');
const JobUpdate = require('../models/JobUpdate');
const User = require('../models/User');
const { verifyToken } = require('./auth');

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const buildSummary = async (userId) => {
  const since = startOfDay(new Date());
  since.setDate(since.getDate() - 364);

  const [daily, recent, totalPdfOpened, totalPdfCompleted, totalInternshipApplied] = await Promise.all([
    Activity.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Kolkata'
            }
          },
          count: { $sum: 1 },
          items: {
            $push: {
              type: '$type',
              title: '$title',
              subjectName: '$subjectName',
              company: '$company',
              createdAt: '$createdAt'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Activity.find({ userId }).sort({ createdAt: -1 }).limit(20),
    Activity.countDocuments({ userId, type: 'pdf_opened' }),
    Activity.countDocuments({ userId, type: 'pdf_completed' }),
    Activity.countDocuments({ userId, type: 'internship_applied' })
  ]);

  return {
    totals: {
      pdfOpened: totalPdfOpened,
      pdfCompleted: totalPdfCompleted,
      internshipsApplied: totalInternshipApplied
    },
    daily: daily.map((day) => ({
      date: day._id,
      count: day.count,
      items: day.items
    })),
    recent
  };
};

router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json(await buildSummary(req.user.id));
  } catch (error) {
    console.error('Activity summary error:', error);
    res.status(500).json({ message: 'Error loading activity' });
  }
});

router.get('/public/:identifier', verifyToken, async (req, res) => {
  try {
    const identifier = String(req.params.identifier || '').trim();
    if (!identifier || identifier === 'undefined' || identifier === 'null') {
      return res.status(400).json({ message: 'Invalid profile link' });
    }

    const query = mongoose.Types.ObjectId.isValid(identifier)
      ? { _id: identifier }
      : { rollNumber: identifier.toUpperCase() };

    const user = await User.findOne(query).select('name avatar bio degree branch yearOfStudy semester socialLinks semesterCgpa role');
    if (!user) return res.status(404).json({ message: 'Profile not found' });

    const activity = await buildSummary(user._id);
    res.json({ profile: user, activity });
  } catch (error) {
    console.error('Public profile error:', error);
    res.status(500).json({ message: 'Error loading profile' });
  }
});

router.post('/pdf-open/:resourceId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.resourceId)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }

    const resource = await Resource.findById(req.params.resourceId).select('title subjectName fileType resourceType');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.fileType !== 'pdf') return res.json({ recorded: false });

    const today = startOfDay(new Date());
    const existing = await Activity.findOne({
      userId: req.user.id,
      type: 'pdf_opened',
      resourceId: resource._id,
      createdAt: { $gte: today }
    });

    if (!existing) {
      await Activity.create({
        userId: req.user.id,
        type: 'pdf_opened',
        resourceId: resource._id,
        title: resource.title,
        subjectName: resource.subjectName
      });
    }

    res.json({ recorded: true });
  } catch (error) {
    console.error('PDF open activity error:', error);
    res.status(500).json({ message: 'Error recording activity' });
  }
});

router.post('/pdf-complete/:resourceId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.resourceId)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }

    const resource = await Resource.findById(req.params.resourceId).select('title subjectName fileType');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (resource.fileType !== 'pdf') return res.status(400).json({ message: 'Only PDFs can be marked completed' });

    const existing = await Activity.findOne({
      userId: req.user.id,
      type: 'pdf_completed',
      resourceId: resource._id
    });

    if (!existing) {
      await Activity.create({
        userId: req.user.id,
        type: 'pdf_completed',
        resourceId: resource._id,
        title: resource.title,
        subjectName: resource.subjectName
      });
    }

    res.json({ completed: true });
  } catch (error) {
    console.error('PDF complete activity error:', error);
    res.status(500).json({ message: 'Error recording completion' });
  }
});

router.post('/job-apply/:jobUpdateId', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.jobUpdateId)) {
      return res.status(400).json({ message: 'Invalid job update ID' });
    }

    const job = await JobUpdate.findById(req.params.jobUpdateId).select('title company category');
    if (!job) return res.status(404).json({ message: 'Job update not found' });

    const existing = await Activity.findOne({
      userId: req.user.id,
      type: 'internship_applied',
      jobUpdateId: job._id
    });

    if (!existing) {
      await Activity.create({
        userId: req.user.id,
        type: 'internship_applied',
        jobUpdateId: job._id,
        title: job.title,
        company: job.company
      });
    }

    res.json({ recorded: true });
  } catch (error) {
    console.error('Job apply activity error:', error);
    res.status(500).json({ message: 'Error recording application' });
  }
});

module.exports = router;
