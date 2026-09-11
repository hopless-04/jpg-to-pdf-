const fs = require('fs');
const { validateFileHeader } = require('../utils/fileHelper');

/**
 * Validates uploaded PDF file header
 */
function validatePdfHeaderMiddleware(req, res, next) {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No PDF file was uploaded.' });
  }

  const result = validateFileHeader(req.file.path);
  if (!result.isValid || result.type !== 'pdf') {
    // Delete the invalid file
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    return res.status(400).json({
      success: false,
      error: 'Invalid file format. The uploaded file is not a valid PDF document.'
    });
  }

  next();
}

/**
 * Validates uploaded images headers
 */
function validateImagesHeaderMiddleware(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'No image files were uploaded.' });
  }

  for (const file of req.files) {
    const result = validateFileHeader(file.path);
    if (!result.isValid || result.type !== 'image') {
      // Clean up all uploaded files
      req.files.forEach(f => {
        try { fs.unlinkSync(f.path); } catch (_) {}
      });
      return res.status(400).json({
        success: false,
        error: `File "${file.originalname}" is not a valid JPG or PNG image.`
      });
    }
  }

  next();
}

module.exports = {
  validatePdfHeaderMiddleware,
  validateImagesHeaderMiddleware
};
