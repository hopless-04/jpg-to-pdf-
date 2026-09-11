const multer = require('multer');
const { formatBytes } = require('../utils/fileHelper');
const { maxFileSize } = require('./upload');

function errorHandler(err, req, res, next) {
  console.error('[Error Handler]:', err.message || err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: `File exceeds maximum allowed size of ${formatBytes(maxFileSize)}.`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files uploaded in a single request.'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: `Unexpected upload field: ${err.field}.`
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  }

  // Generic errors (never leak stack trace)
  const statusCode = err.statusCode || 500;
  const userMessage = err.userMessage || err.message || 'An unexpected error occurred during processing. Please try again.';

  res.status(statusCode).json({
    success: false,
    error: userMessage
  });
}

module.exports = errorHandler;
