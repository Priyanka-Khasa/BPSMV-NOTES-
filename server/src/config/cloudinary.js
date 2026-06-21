const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup storage engine for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bpsmv-resource-hub', // Folder name in Cloudinary
    allowed_formats: ['pdf', 'jpg', 'png', 'jpeg'], // Allow PDFs and Images
    // resource_type: 'auto' is needed for PDFs and non-image files
    resource_type: 'auto' 
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
