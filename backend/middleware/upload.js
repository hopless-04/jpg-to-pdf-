const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 50 * 1024 * 1024; // 50MB
const maxFilesCount = parseInt(process.env.MAX_FILES_COUNT, 10) || 30;

// Filter for PDF uploads
const pdfFilter = (req, file, cb) => {
  const allowedExts = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF documents (.pdf) are allowed.'));
  }
};

// Filter for Image uploads (JPG, JPEG, PNG)
const imageFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png'];
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type (${file.originalname}). Only JPG, JPEG, and PNG images are supported.`));
  }
};

const uploadPdf = multer({
  storage,
  limits: { fileSize: maxFileSize, files: 1 },
  fileFilter: pdfFilter
});

const uploadImages = multer({
  storage,
  limits: { fileSize: maxFileSize, files: maxFilesCount },
  fileFilter: imageFilter
});

module.exports = {
  uploadPdf,
  uploadImages,
  maxFileSize,
  maxFilesCount
};
