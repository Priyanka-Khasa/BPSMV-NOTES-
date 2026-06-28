const express = require('express');
const router = express.Router();
const Gift = require('../models/Gift');
const { verifyToken } = require('./auth');

// POST /api/gifts - Create a gift request or donation (Public)
router.post('/', async (req, res) => {
  try {
    const { fullName, rollNumber, degree, branch, semester, requestType, itemType, itemName, itemDescription, contactEmail, contactPhone } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    if (!rollNumber || !rollNumber.trim()) {
      return res.status(400).json({ message: 'Roll number is required' });
    }
    if (!degree) {
      return res.status(400).json({ message: 'Degree is required' });
    }
    if (!branch) {
      return res.status(400).json({ message: 'Branch is required' });
    }
    if (!semester || semester < 1 || semester > 10) {
      return res.status(400).json({ message: 'Valid semester (1-10) is required' });
    }
    if (!requestType || !['Request', 'Donate'].includes(requestType)) {
      return res.status(400).json({ message: 'Request type must be Request or Donate' });
    }
    if (!itemType || !['Book', 'Notes', 'Question Paper', 'Stationery', 'Lab Manual', 'Other'].includes(itemType)) {
      return res.status(400).json({ message: 'Valid item type is required' });
    }
    if (!itemName || !itemName.trim()) {
      return res.status(400).json({ message: 'Item name is required' });
    }
    if (!itemDescription || !itemDescription.trim()) {
      return res.status(400).json({ message: 'Item description is required' });
    }
    if (!contactEmail || !contactEmail.trim()) {
      return res.status(400).json({ message: 'Contact email is required' });
    }

    const newGift = await Gift.create({
      fullName: fullName.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      degree: degree.trim(),
      branch: branch.trim(),
      semester: parseInt(semester),
      requestType,
      itemType,
      itemName: itemName.trim(),
      itemDescription: itemDescription.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: contactPhone ? contactPhone.trim() : undefined
    });

    res.status(201).json(newGift);
  } catch (error) {
    console.error('Gift creation error:', error);
    res.status(500).json({ message: 'Error creating gift request' });
  }
});

// GET /api/gifts - Fetch all gifts (Public, paginated with filters)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const filter = {};

    if (req.query.requestType && ['Request', 'Donate'].includes(req.query.requestType)) {
      filter.requestType = req.query.requestType;
    }
    if (req.query.status && ['Pending', 'Fulfilled', 'Closed'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.degree) {
      filter.degree = req.query.degree;
    }
    if (req.query.branch) {
      filter.branch = req.query.branch;
    }
    if (req.query.semester) {
      filter.semester = parseInt(req.query.semester);
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { itemName: searchRegex },
        { itemDescription: searchRegex },
        { fullName: searchRegex }
      ];
    }

    const [gifts, total] = await Promise.all([
      Gift.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Gift.countDocuments(filter)
    ]);

    res.json({
      gifts,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching gifts:', error);
    res.status(500).json({ message: 'Error fetching gifts' });
  }
});

// GET /api/gifts/filter-options - Get unique filter values
router.get('/filter-options', async (req, res) => {
  try {
    const [degrees, branches] = await Promise.all([
      Gift.distinct('degree'),
      Gift.distinct('branch')
    ]);
    res.json({ degrees, branches });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching filter options' });
  }
});

// GET /api/gifts/:id - Get single gift by ID
router.get('/:id', async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.id);
    if (!gift) return res.status(404).json({ message: 'Gift request not found' });
    res.json(gift);
  } catch (error) {
    console.error('Error fetching gift:', error);
    res.status(500).json({ message: 'Error fetching gift request' });
  }
});

// PUT /api/gifts/:id/status - Update status (Admin only)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status } = req.body;
    if (!status || !['Pending', 'Fulfilled', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const gift = await Gift.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!gift) return res.status(404).json({ message: 'Gift request not found' });
    res.json(gift);
  } catch (error) {
    console.error('Error updating gift status:', error);
    res.status(500).json({ message: 'Error updating gift status' });
  }
});

// DELETE /api/gifts/:id - Delete a gift (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const gift = await Gift.findByIdAndDelete(req.params.id);
    if (!gift) return res.status(404).json({ message: 'Gift request not found' });
    res.json({ message: 'Gift request deleted successfully' });
  } catch (error) {
    console.error('Error deleting gift:', error);
    res.status(500).json({ message: 'Error deleting gift request' });
  }
});

module.exports = router;
