const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const { verifyToken } = require('./auth'); // Import auth middleware

const { upload } = require('../config/cloudinary'); // Import upload middleware

// Get subjects based on user's degree and branch
router.get('/subjects', async (req, res) => {
  try {
    const { degree, branch } = req.query;
    const searchDegree = degree || 'B.Tech';
    const searchBranch = branch || 'CSE';
    const subjects = await Subject.find({ degree: searchDegree, branch: searchBranch }).sort({ semester: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// Get resources for a specific subject
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const resources = await Resource.find({
      subjectId: req.params.subjectId,
      isApproved: true
    });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

// Add a new resource with physical file upload
router.post('/add', upload.single('file'), async (req, res) => {
  const { title, resourceType, year, subjectId } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a file' });
  }

  try {
    const newResource = await Resource.create({
      title,
      fileUrl: req.file.path,
      resourceType,
      year: year ? parseInt(year) : undefined,
      subjectId,
      uploadedBy: null,
      isApproved: true
    });
    res.status(201).json(newResource);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Error creating resource' });
  }
});

module.exports = router;
