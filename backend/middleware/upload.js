const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ==========================================
// Upload Directory
// ==========================================

// Vercel serverless functions must use /tmp
const isVercel = process.env.VERCEL === '1';

const uploadDir = isVercel
  ? '/tmp/uploads'
  : path.resolve(process.env.UPLOAD_DIR || './uploads');

// Create upload directory
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ==========================================
// Multer Storage
// ==========================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const uniqueName = `${Date.now()}-${crypto.randomUUID()}${ext}`;

    cb(null, uniqueName);
  }
});

// ==========================================
// Upload Limits
// ==========================================

const maxFileSize =
  parseInt(process.env.MAX_FILE_SIZE, 10) ||
  50 * 1024 * 1024;

const maxFilesCount =
  parseInt(process.env.MAX_FILES_COUNT, 10) ||
  30;

// ==========================================
// PDF Filter
// ==========================================

const pdfFilter = (req, file, cb) => {
  const allowedExts = ['.pdf'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedExts.includes(ext) ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only PDF documents (.pdf) are allowed.'
      )
    );
  }
};

// ==========================================
// Image Filter
// ==========================================

const imageFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png'];

  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedExts.includes(ext) ||
    allowedMimes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type (${file.originalname}). Only JPG, JPEG, and PNG images are supported.`
      )
    );
  }
};

// ==========================================
// Multer Upload Configurations
// ==========================================

const uploadPdf = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
    files: 1
  },
  fileFilter: pdfFilter
});

const uploadImages = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
    files: maxFilesCount
  },
  fileFilter: imageFilter
});

// ==========================================
// Export
// ==========================================

module.exports = {
  uploadPdf,
  uploadImages,
  maxFileSize,
  maxFilesCount,
  uploadDir
};