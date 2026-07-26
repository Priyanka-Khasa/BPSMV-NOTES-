const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');
const Resource = require('../models/Resource');
const Subject = require('../models/Subject');
const User = require('../models/User');
const { verifyToken } = require('./auth');
const { upload, uploadDir, getUploadedFileUrl } = require('../config/storage');
const { seedSubjects } = require('../../seedSubjects');
const { applyAcademicProgression, normalizeBranch } = require('../utils/academicProgression');
const { makeSafeContainsRegex } = require('../utils/regex');
const { asBoolean, asInteger, asString } = require('../utils/request');
const { uploadLimiter } = require('../utils/rateLimiters');

const getStoredFilename = (fileUrl) => {
  if (!fileUrl) return null;
  return path.basename(fileUrl.split('?')[0]);
};

const sanitizeResource = (resource) => {
  if (!resource) return resource;
  const obj = resource.toObject ? resource.toObject() : { ...resource };
  if (obj.fileUrl) {
    obj.secureFileUrl = `/resources/${obj._id}/file`;
    delete obj.fileUrl;
  }
  return obj;
};

// Helper: check ownership or admin
const getResourceOwnerId = (resource) => {
  if (!resource?.uploadedBy) return null;
  if (typeof resource.uploadedBy === 'string') return resource.uploadedBy;
  if (resource.uploadedBy?.toString) return resource.uploadedBy.toString();
  return null;
};

const canDeleteResource = (user, resource) => {
  return user.role === 'admin' || getResourceOwnerId(resource) === user.id;
};

const canViewResource = (user, resource) => {
  return Boolean(resource.isApproved || user.role === 'admin' || getResourceOwnerId(resource) === user.id);
};

const canApproveResource = (user) => {
  return user.role === 'admin';
};

const findSubjects = (filter) => Subject.find(filter).sort({ semester: 1, name: 1 });

const isCloudinaryUrl = (fileUrl) => {
  try {
    const url = new URL(fileUrl);
    return url.protocol === 'https:' && url.hostname.endsWith('cloudinary.com');
  } catch {
    return false;
  }
};

const normalizeResourceLinkUrl = (value) => {
  const rawUrl = asString(value, 2000);
  if (!rawUrl) return '';

  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
      return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
};

// Get all resources with search & filter
router.get('/all', verifyToken, async (req, res) => {
  try {
    const degree = asString(req.query.degree, 80);
    const branch = asString(req.query.branch, 120);
    const subjectId = asString(req.query.subjectId, 40);
    const resourceType = asString(req.query.resourceType, 40);
    const search = asString(req.query.search, 100);
    const page = asInteger(req.query.page, { min: 1, max: 10000 }) || 1;
    const limit = asInteger(req.query.limit, { min: 1, max: 50 }) || 20;
    const filter = {};
    if (req.query.isApproved !== undefined && req.user.role === 'admin') {
      const approved = asBoolean(req.query.isApproved);
      filter.isApproved = approved === null ? true : approved;
    } else {
      filter.isApproved = true;
    }
    if (degree) filter.degree = degree;
    if (branch) filter.branch = branch;
    const semester = asInteger(req.query.semester, { min: 1, max: 10 });
    const year = asInteger(req.query.year, { min: 2000, max: 2100 });
    if (semester !== null) filter.semester = semester;
    if (year !== null) filter.year = year;
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) filter.subjectId = subjectId;
    if (resourceType) filter.resourceType = resourceType;
    const safeSearch = makeSafeContainsRegex(search);
    if (safeSearch) {
      filter.$or = [
        { title: safeSearch },
        { subjectName: safeSearch }
      ];
    }

    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('uploadedBy', 'name email');

    const total = await Resource.countDocuments(filter);
    res.json({
      resources: resources.map(sanitizeResource),
      total,
      page,
      pages: Math.ceil(total / limit)
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
    const degree = asString(req.query.degree, 80);
    const branch = asString(req.query.branch, 120);
    const showAll = asString(req.query.showAll, 10);
    const filter = {};
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await applyAcademicProgression(user);

    if (user.role === 'student') {
      if (user.degree) filter.degree = user.degree;
      if (user.branch) filter.branch = normalizeBranch(user.branch);
      if (user.semester) filter.semester = user.semester;
      if (user.yearOfStudy) filter.year = user.yearOfStudy;
    } else if (user.role === 'admin') {
      if (showAll !== 'true') {
        if (user.degree) filter.degree = user.degree;
        if (user.branch) filter.branch = normalizeBranch(user.branch);
      }
    }

    if (degree) filter.degree = degree;
    if (branch) filter.branch = normalizeBranch(branch);
    const semester = asInteger(req.query.semester, { min: 1, max: 10 });
    const year = asInteger(req.query.year, { min: 1, max: 4 });
    if (semester !== null) filter.semester = semester;
    if (year !== null) filter.year = year;

    let subjects = await findSubjects(filter);
    if (!subjects.length && filter.year) {
      const legacyFilter = { ...filter };
      delete legacyFilter.year;
      subjects = await findSubjects(legacyFilter);
    }

    if (!subjects.length && filter.degree && filter.branch && filter.semester) {
      await seedSubjects();
      subjects = await findSubjects(filter);
      if (!subjects.length && filter.year) {
        const legacyFilter = { ...filter };
        delete legacyFilter.year;
        subjects = await findSubjects(legacyFilter);
      }
    }
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
    const subjectId = asString(req.params.subjectId, 40);
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }
    const type = asString(req.query.type, 40);
    const filter = { subjectId, isApproved: true };
    if (type) filter.resourceType = type;
    const resources = await Resource.find(filter).sort({ createdAt: -1 }).populate('uploadedBy', 'name email');
    res.json(resources.map(sanitizeResource));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources' });
  }
});

// Resource files are streamed only after authentication and subscription checks.
router.get('/:id/file', verifyToken, async (req, res) => {
  try {
    const resourceId = asString(req.params.id, 40);
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource || !resource.fileUrl) return res.status(404).json({ message: 'File not found' });
    if (!canViewResource(req.user, resource)) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (isCloudinaryUrl(resource.fileUrl)) {
      const upstream = await fetch(resource.fileUrl);
      if (!upstream.ok || !upstream.body) {
        return res.status(404).json({ message: 'File not found' });
      }
      res.setHeader('Content-Type', upstream.headers.get('content-type') || (resource.fileType === 'pdf' ? 'application/pdf' : 'application/octet-stream'));
      res.setHeader('Content-Disposition', `inline; filename="${getStoredFilename(resource.fileUrl) || 'resource'}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return Readable.fromWeb(upstream.body).pipe(res);
    }

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
    const resourceId = asString(req.params.id, 40);
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    const resource = await Resource.findById(resourceId).populate('uploadedBy', 'name email');
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    if (!canViewResource(req.user, resource)) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(sanitizeResource(resource));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resource' });
  }
});

// Add a new resource (file upload)
router.post('/add', verifyToken, uploadLimiter, upload.single('file'), async (req, res) => {
  try {
    const title = asString(req.body.title, 180);
    const resourceType = asString(req.body.resourceType, 40);
    const subjectId = asString(req.body.subjectId, 40);
    const year = asInteger(req.body.year, { min: 2000, max: 2100 });
    const semester = asInteger(req.body.semester, { min: 1, max: 10 });
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
      year: year || undefined,
      semester: semester || subject.semester,
      subjectId: subject._id,
      subjectName: subject.name,
      degree: subject.degree,
      branch: subject.branch,
      uploadedBy: user._id,
      uploaderName: user.name
    };

    if (isLink) {
      const linkUrl = normalizeResourceLinkUrl(req.body.linkUrl);
      if (!linkUrl) {
        return res.status(400).json({ message: 'Link URL must start with http:// or https://' });
      }
      resourceData.linkUrl = linkUrl;
      resourceData.fileType = 'link';
    } else {
      resourceData.fileUrl = getUploadedFileUrl(req, req.file);
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
    const resourceId = asString(req.params.id, 40);
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }
    const resource = await Resource.findById(resourceId);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });

    if (!canDeleteResource(req.user, resource)) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }

    await Resource.findByIdAndDelete(resourceId);
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting resource' });
  }
});

// Approve a resource (Admin only)
router.patch('/:id/approve', verifyToken, async (req, res) => {
  try {
    if (!canApproveResource(req.user)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const resourceId = asString(req.params.id, 40);
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }

    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      { isApproved: true },
      { new: true }
    );

    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(sanitizeResource(resource));
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ message: 'Error approving resource' });
  }
});

// Reject a resource (Admin only)
router.patch('/:id/reject', verifyToken, async (req, res) => {
  try {
    if (!canApproveResource(req.user)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const resourceId = asString(req.params.id, 40);
    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      return res.status(400).json({ message: 'Invalid resource ID' });
    }

    const resource = await Resource.findByIdAndUpdate(
      resourceId,
      { isApproved: false },
      { new: true }
    );

    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(sanitizeResource(resource));
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ message: 'Error rejecting resource' });
  }
});

module.exports = router;
module.exports.canDeleteResource = canDeleteResource;
module.exports.canViewResource = canViewResource;
module.exports.canApproveResource = canApproveResource;
module.exports.normalizeResourceLinkUrl = normalizeResourceLinkUrl;
