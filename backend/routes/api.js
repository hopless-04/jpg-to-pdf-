const express = require('express');
const router = express.Router();
const { uploadPdf, uploadImages } = require('../middleware/upload');
const { validatePdfHeaderMiddleware, validateImagesHeaderMiddleware } = require('../middleware/validation');
const {
  getPdfInfoController,
  convertPdfToJpgController,
  downloadFileController,
  downloadZipController
} = require('../controllers/pdfController');
const { convertJpgToPdfController } = require('../controllers/imageController');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PDF ↔ JPG Converter API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// PDF info / metadata inspection
router.post('/pdf-info', uploadPdf.single('file'), validatePdfHeaderMiddleware, getPdfInfoController);

// PDF to JPG conversion
router.post('/pdf-to-jpg', uploadPdf.single('file'), validatePdfHeaderMiddleware, convertPdfToJpgController);

// JPG/PNG to PDF conversion
router.post('/jpg-to-pdf', uploadImages.array('files', 30), validateImagesHeaderMiddleware, convertJpgToPdfController);

// Download specific file
router.get('/download/:sessionId/:filename', downloadFileController);

// Download all generated files as ZIP
router.get('/download-zip/:sessionId', downloadZipController);

module.exports = router;
