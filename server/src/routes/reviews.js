const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Review = require('../models/Review');
const { verifyToken } = require('./auth');

// Rate limiter for public review submission
const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many reviews submitted from this IP. Please try again later.' }
});

// POST /api/reviews - Create a review (Public)
router.post('/', reviewLimiter, async (req, res) => {
  try {
    const { fullName, rating, review, profileImage, reviewerKey } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    if (!review || !review.trim()) {
      return res.status(400).json({ message: 'Review text is required' });
    }
    if (reviewerKey) {
      const existingReview = await Review.findOne({ reviewerKey: reviewerKey.trim() }).select('_id');
      if (existingReview) {
        return res.status(409).json({ message: 'You have already submitted a review.' });
      }
    }

    const newReview = await Review.create({
      fullName: fullName.trim(),
      rating: parseInt(rating),
      review: review.trim(),
      profileImage: profileImage || null,
      reviewerKey: reviewerKey ? reviewerKey.trim() : undefined,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(newReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You have already submitted a review.' });
    }
    console.error('Review creation error:', error);
    res.status(500).json({ message: 'Error creating review' });
  }
});

// GET /api/reviews/approved - Fetch approved reviews (Public, paginated)
router.get('/approved', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const [reviews, total] = await Promise.all([
      Review.find({ isApproved: true })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Review.countDocuments({ isApproved: true })
    ]);

    res.json({
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching approved reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// GET /api/reviews/all - Fetch all reviews (Admin only)
router.get('/all', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const filter = {};
    if (req.query.isApproved !== undefined) {
      filter.isApproved = req.query.isApproved === 'true';
    }

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('+ipAddress +userAgent'),
      Review.countDocuments(filter)
    ]);

    res.json({
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// PUT /api/reviews/:id/approve - Approve a review (Admin only)
router.put('/:id/approve', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ message: 'Error approving review' });
  }
});

// DELETE /api/reviews/:id - Delete a review (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Error deleting review' });
  }
});

module.exports = router;
