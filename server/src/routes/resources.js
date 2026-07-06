const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const Subject = require('../models/Subject');
const User = require('../models/User');
const { verifyToken } = require('./auth');
const { upload, uploadDir } = require('../config/storage');

// Helper to build public file URL from multer file
const buildFileUrl = (req, filename) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

const getStoredFilename = (fileUrl) => {
  if (!fileUrl) return null;
  return path.basename(fileUrl.split('?')[0]);
};

const sanitizeResource = (resource) => {
  if (!resource) return resource;
  const obj = resource.toObject ? resource.toObject() : { ...resource };
  if (obj.fileUrl) {
    obj.secureFileUrl = `/resources/${obj._id}/file`;
  }
  return obj;
};

// Helper: check ownership or admin
const canDelete = (user, resource) => {
  return user.role === 'admin' || resource.uploadedBy.toString() === user.id;
};

// Get all resources with search & filter
router.get('/all', verifyToken, async (req, res) => {
  try {
    const { degree, branch, semester, year, subjectId, resourceType, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.query.isApproved !== undefined) {
      filter.isApproved = req.query.isApproved === 'true' || req.query.isApproved === true;
    } else {
      filter.isApproved = true;
    }
    if (degree) filter.degree = degree;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);
    if (year) filter.year = parseInt(year);
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) filter.subjectId = subjectId;
    if (resourceType) filter.resourceType = resourceType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subjectName: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('uploadedBy', 'name email');

    const total = await Resource.countDocuments(filter);
    res.json({
      resources: resources.map(sanitizeResource),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

// Public stats route
router.get('/public/stats', async (req, res) => {
  try {
    const [
      totalResources,
      totalSubjects,
      totalStudents,
      totalNotes,
      totalPYQs,
      branches,
      courses
    ] = await Promise.all([
      Resource.countDocuments({ isApproved: true }),
      Subject.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Resource.countDocuments({ resourceType: 'Note', isApproved: true }),
      Resource.countDocuments({ resourceType: 'Question Paper', isApproved: true }),
      Subject.distinct('branch'),
      Subject.aggregate([
        { $group: { _id: { degree: '$degree', branch: '$branch' } } },
        { $count: 'total' }
      ])
    ]);

    res.json({
      totalResources,
      totalSubjects,
      totalStudents,
      totalNotes,
      totalPYQs,
      totalBranches: branches.length,
      totalCourses: courses[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Get subjects based on query (protected)
router.get('/subjects', verifyToken, async (req, res) => {
  try {
    const { degree, branch, semester, showAll } = req.query;
    const filter = {};
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'student') {
      if (user.degree) filter.degree = user.degree;
      if (user.branch) filter.branch = user.branch;
    } else if (user.role === 'admin') {
      if (showAll !== 'true') {
        if (user.degree) filter.degree = user.degree;
        if (user.branch) filter.branch = user.branch;
      }
    }

    if (degree) filter.degree = degree;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);

    const subjects = await Subject.find(filter).sort({ semester: 1, name: 1 });
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

// Get unique degrees, branches for filter dropdowns
router.get('/filter-options', verifyToken, async (req, res) => {
  try {
    const [degrees, branches] = await Promise.all([
      Subject.distinct('degree'),
      Subject.distinct('branch')
    ]);
    res.json({ degrees, branches });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching filter options' });
  }
});

// Get resources for a specific subject
router.get('/subject/:subjectId', verifyToken, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { subjectId: req.params.subjectId, isApproved: true };
    if (type) filter.resourceType = type;
    const resources = await Resource.find(filter).sort({ createdAt: -1 }).populate('uploadedBy', 'name email');
    res.json(resources.map(sanitizeResource));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

// Authenticated file stream kept for in-app previews. Public /uploads links are
// also available so students can open and download resources normally.
router.get('/:id/file', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.fileUrl) return res.status(404).json({ message: 'File not found' });

    const filename = getStoredFilename(resource.fileUrl);
    const filePath = filename ? path.join(uploadDir, filename) : null;
    const resolvedUploads = path.resolve(uploadDir);
    const resolvedFile = filePath ? path.resolve(filePath) : null;

    if (!resolvedFile || !resolvedFile.startsWith(resolvedUploads) || !fs.existsSync(resolvedFile)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader('Content-Type', resource.fileType === 'pdf' ? 'application/pdf' : 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    fs.createReadStream(resolvedFile).pipe(res);
  } catch (error) {
    console.error('Error streaming resource file:', error);
    res.status(500).json({ message: 'Error loading resource file' });
  }
});

// Get single resource
router.get('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(sanitizeResource(resource));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resource' });
  }
});

// Add a new resource (file upload)
router.post('/add', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { title, resourceType, year, semester, subjectId } = req.body;
    if (!title || !resourceType || !subjectId) {
      return res.status(400).json({ message: 'Title, resource type, and subject are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const isLink = resourceType === 'Link';
    if (!isLink && !req.file) {
      return res.status(400).json({ message: 'Please upload a file or select Link type' });
    }

    const resourceData = {
      title,
      resourceType,
      year: year ? parseInt(year) : undefined,
      semester: semester ? parseInt(semester) : subject.semester,
      subjectId: subject._id,
      subjectName: subject.name,
      degree: subject.degree,
      branch: subject.branch,
      uploadedBy: user._id,
      uploaderName: user.name
    };

    if (isLink) {
      if (!req.body.linkUrl) return res.status(400).json({ message: 'Link URL is required for Link type' });
      resourceData.linkUrl = req.body.linkUrl;
      resourceData.fileType = 'link';
    } else {
      resourceData.fileUrl = buildFileUrl(req, req.file.filename);
      resourceData.fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';
    }

    const newResource = await Resource.create(resourceData);
    res.status(201).json(sanitizeResource(newResource));
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Error creating resource' });
  }
});

// Delete a resource
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (!canDelete(req.user, resource)) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting resource' });
  }
});

module.exports = router;
