const crypto = require('crypto');
const fs = require('fs');
const { convertImagesToPdf } = require('../services/jpgToPdfService');

/**
 * Controller for converting multiple images into a PDF
 */
async function convertJpgToPdfController(req, res, next) {
  const uploadedFiles = req.files || [];
  try {
    if (uploadedFiles.length === 0) {
      return res.status(400).json({ success: false, error: 'Please upload at least one image file.' });
    }

    const sessionId = crypto.randomUUID();
    const { pageSize, orientation, imageFit, margin, pdfName, order } = req.body;

    // Handle user-specified file order if provided
    let orderedFiles = [...uploadedFiles];
    if (order) {
      try {
        const orderArray = typeof order === 'string' ? JSON.parse(order) : order;
        if (Array.isArray(orderArray) && orderArray.length === uploadedFiles.length) {
          // orderArray contains original filenames or file indices
          const fileMap = new Map();
          uploadedFiles.forEach(f => fileMap.set(f.originalname, f));

          const reordered = [];
          for (const item of orderArray) {
            const match = fileMap.get(item) || (typeof item === 'number' ? uploadedFiles[item] : null);
            if (match && !reordered.includes(match)) {
              reordered.push(match);
            }
          }
          if (reordered.length === uploadedFiles.length) {
            orderedFiles = reordered;
          }
        }
      } catch (e) {
        console.warn('Could not parse image order:', e.message);
      }
    }

    const result = await convertImagesToPdf({
      files: orderedFiles,
      sessionId,
      pageSize: pageSize || 'a4',
      orientation: orientation || 'auto',
      imageFit: imageFit || 'fit',
      margin: margin || 'none',
      pdfName: pdfName || 'converted_images.pdf'
    });

    // Cleanup uploaded images immediately after conversion
    uploadedFiles.forEach(f => {
      if (f.path && fs.existsSync(f.path)) {
        try { fs.unlinkSync(f.path); } catch (_) {}
      }
    });

    res.json({
      success: true,
      message: 'PDF generated successfully!',
      data: result
    });
  } catch (err) {
    // Cleanup on error
    uploadedFiles.forEach(f => {
      if (f.path && fs.existsSync(f.path)) {
        try { fs.unlinkSync(f.path); } catch (_) {}
      }
    });
    next(err);
  }
}

module.exports = {
  convertJpgToPdfController
};
