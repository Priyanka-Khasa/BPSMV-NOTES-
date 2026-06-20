const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Resource = require('../models/Resource');
const { verifyToken } = require('./auth'); // Import auth middleware

// Get subjects based on user's degree and branch (Auth bypassed for testing)
router.get('/subjects', async (req, res) => {
  try {
    const { degree, branch } = req.query;
    // Fallback to query params since req.user is bypassed
    const searchDegree = degree || 'B.Tech';
    const searchBranch = branch || 'CSE';

    const subjects = await Subject.find({ degree: searchDegree, branch: searchBranch }).sort({ semester: 1 });
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// Get resources for a specific subject (Auth bypassed for testing)
router.get('/subject/:subjectId', async (req, res) => {
  try {
    const resources = await Resource.find({ 
      subjectId: req.params.subjectId,
      isApproved: true 
    }).populate('uploadedBy', 'name');
    
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

// Add a new resource (Auth bypassed for testing)
router.post('/add', async (req, res) => {
  const { title, fileUrl, resourceType, year, subjectId } = req.body;
  
  try {
    const newResource = await Resource.create({
      title,
      fileUrl,
      resourceType,
      year,
      subjectId,
      uploadedBy: null, // Hardcoded for testing without auth
      isApproved: true
    });
    
    res.status(201).json(newResource);
  } catch (error) {
    res.status(500).json({ message: 'Error creating resource' });
  }
});

module.exports = router;
