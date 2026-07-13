const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('./cloudinary');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (process.env.NODE_ENV === 'production' && !hasCloudinaryConfig) {
  throw new Error('Cloudinary credentials are required for production uploads');
}

// Local disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'file-' + uniqueSuffix + ext);
  }
});

const createCloudinaryStorage = ({ folder, allowedFormats, resourceType = 'auto' }) => new CloudinaryStorage({
  cloudinary,
  params: {
    folder,
    allowed_formats: allowedFormats,
    resource_type: resourceType
  }
});

const documentStorage = hasCloudinaryConfig
  ? createCloudinaryStorage({
      folder: 'bpsmv-resource-hub/resources',
      allowedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
      resourceType: 'auto'
    })
  : storage;

const audioStorage = hasCloudinaryConfig
  ? createCloudinaryStorage({
      folder: 'bpsmv-resource-hub/audio',
      allowedFormats: ['webm', 'mp4', 'mpeg', 'mp3', 'wav', 'ogg'],
      resourceType: 'auto'
    })
  : storage;

const feedbackStorage = hasCloudinaryConfig
  ? createCloudinaryStorage({
      folder: 'bpsmv-resource-hub/feedback',
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      resourceType: 'image'
    })
  : storage;

// File filter: only allow PDFs and images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files are allowed'), false);
  }
};

const upload = multer({
  storage: documentStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max
});

// Audio upload filter
const audioFileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
  if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'), false);
  }
};

const audioUpload = multer({
  storage: audioStorage,
  fileFilter: audioFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max
});

// Feedback upload filter: images only, 5MB max
const feedbackFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed for screenshots'), false);
  }
};

const feedbackUpload = multer({
  storage: feedbackStorage,
  fileFilter: feedbackFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

const getUploadedFileUrl = (req, file) => {
  if (!file) return '';
  if (file.secure_url) return file.secure_url;
  if (file.path && /^https?:\/\//i.test(file.path)) return file.path;
  const filename = file.filename || path.basename(file.path || '');
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/uploads/${filename}`;
};

module.exports = { upload, uploadDir, audioUpload, feedbackUpload, getUploadedFileUrl, hasCloudinaryConfig };
