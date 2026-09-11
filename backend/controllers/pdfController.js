const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { getPdfInfo, convertPdfToJpg } = require('../services/pdfToJpgService');
const { safeResolve } = require('../utils/fileHelper');

/**
 * Controller for inspecting PDF info (page count, etc.)
 */
async function getPdfInfoController(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file provided.' });
    }

    const info = await getPdfInfo(req.file.path);
    
    // Clean up inspected temp file
    try { fs.unlinkSync(req.file.path); } catch (_) {}

    res.json({
      success: true,
      data: info
    });
  } catch (err) {
    // Make sure temp file is cleaned up on error
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    next(err);
  }
}

/**
 * Controller for converting PDF to JPG images
 */
async function convertPdfToJpgController(req, res, next) {
  const uploadedPath = req.file ? req.file.path : null;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a PDF file to convert.' });
    }

    const sessionId = crypto.randomUUID();
    const { quality, dpi, pageRange } = req.body;

    const result = await convertPdfToJpg({
      filePath: uploadedPath,
      originalFilename: req.file.originalname,
      sessionId,
      quality: quality || 'high',
      dpi: dpi ? parseInt(dpi, 10) : 150,
      pageRange: pageRange || 'all'
    });

    // Remove uploaded temporary PDF now that conversion is complete
    if (uploadedPath && fs.existsSync(uploadedPath)) {
      try { fs.unlinkSync(uploadedPath); } catch (_) {}
    }

    res.json({
      success: true,
      message: 'Conversion completed successfully!',
      data: result
    });
  } catch (err) {
    if (uploadedPath && fs.existsSync(uploadedPath)) {
      try { fs.unlinkSync(uploadedPath); } catch (_) {}
    }
    next(err);
  }
}

/**
 * Controller for downloading individual converted file
 */
function downloadFileController(req, res, next) {
  try {
    const { sessionId, filename } = req.params;
    const outputBase = path.resolve(process.env.OUTPUT_DIR || './output');
    const safeSessionDir = safeResolve(outputBase, sessionId);
    const safeFilePath = safeResolve(safeSessionDir, filename);

    if (!fs.existsSync(safeFilePath)) {
      return res.status(404).json({ success: false, error: 'File not found or has expired.' });
    }

    res.download(safeFilePath, filename, (err) => {
      if (err && !res.headersSent) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Controller for downloading ZIP of all converted files
 */
function downloadZipController(req, res, next) {
  try {
    const { sessionId } = req.params;
    const outputBase = path.resolve(process.env.OUTPUT_DIR || './output');
    const safeSessionDir = safeResolve(outputBase, sessionId);

    if (!fs.existsSync(safeSessionDir)) {
      return res.status(404).json({ success: false, error: 'Session not found or has expired.' });
    }

    // Find the zip file in session directory
    const files = fs.readdirSync(safeSessionDir);
    const zipFile = files.find(f => f.endsWith('.zip'));

    if (!zipFile) {
      return res.status(404).json({ success: false, error: 'ZIP archive not found.' });
    }

    const zipPath = path.join(safeSessionDir, zipFile);
    res.download(zipPath, zipFile, (err) => {
      if (err && !res.headersSent) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPdfInfoController,
  convertPdfToJpgController,
  downloadFileController,
  downloadZipController
};
