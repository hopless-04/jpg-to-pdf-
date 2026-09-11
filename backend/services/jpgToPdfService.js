const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const sizeOf = require('image-size');
const { formatBytes, sanitizeFilename } = require('../utils/fileHelper');

const PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008]
};

const MARGIN_MAP = {
  none: 0,
  small: 18,
  medium: 36,
  large: 54
};

/**
 * Convert multiple images into a combined PDF document
 */
function convertImagesToPdf({
  files,
  sessionId,
  pageSize = 'a4',
  orientation = 'auto',
  imageFit = 'fit',
  margin = 'none',
  pdfName = 'converted_images.pdf'
}) {
  return new Promise((resolve, reject) => {
    try {
      const outputBase = path.resolve(process.env.OUTPUT_DIR || './output');
      const sessionDir = path.join(outputBase, sessionId);
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      const safePdfName = sanitizeFilename(pdfName.endsWith('.pdf') ? pdfName : `${pdfName}.pdf`);
      const outputPath = path.join(sessionDir, safePdfName);
      const outputStream = fs.createWriteStream(outputPath);

      const marginPoints = MARGIN_MAP[margin] !== undefined ? MARGIN_MAP[margin] : 0;

      const doc = new PDFDocument({
        autoFirstPage: false,
        margin: 0
      });

      doc.pipe(outputStream);

      outputStream.on('error', err => {
        reject(new Error('Failed to write PDF: ' + err.message));
      });

      outputStream.on('finish', () => {
        const stats = fs.statSync(outputPath);
        resolve({
          sessionId,
          filename: safePdfName,
          pageCount: files.length,
          fileSize: stats.size,
          fileSizeFormatted: formatBytes(stats.size),
          downloadUrl: `/api/download/${sessionId}/${encodeURIComponent(safePdfName)}`
        });
      });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imgPath = file.path;

        // Obtain dimensions using image-size
        let imgDimensions;
        try {
          imgDimensions = sizeOf(imgPath);
        } catch (e) {
          // If image-size fails, try reading directly or fallback
          imgDimensions = { width: 800, height: 600 };
        }

        const imgWidth = imgDimensions.width || 800;
        const imgHeight = imgDimensions.height || 600;
        const imgAspect = imgWidth / imgHeight;

        let pageWidth, pageHeight;

        if (pageSize === 'original') {
          pageWidth = imgWidth + (marginPoints * 2);
          pageHeight = imgHeight + (marginPoints * 2);
        } else {
          const standardSize = PAGE_SIZES[pageSize.toLowerCase()] || PAGE_SIZES.a4;
          let [w, h] = standardSize;

          let targetOrientation = orientation.toLowerCase();
          if (targetOrientation === 'auto') {
            targetOrientation = imgAspect > 1 ? 'landscape' : 'portrait';
          }

          if (targetOrientation === 'landscape') {
            pageWidth = Math.max(w, h);
            pageHeight = Math.min(w, h);
          } else {
            pageWidth = Math.min(w, h);
            pageHeight = Math.max(w, h);
          }
        }

        doc.addPage({
          size: [pageWidth, pageHeight],
          margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        const availableWidth = Math.max(10, pageWidth - (marginPoints * 2));
        const availableHeight = Math.max(10, pageHeight - (marginPoints * 2));

        if (imageFit === 'fill') {
          // Fill the entire available area (cover)
          const scaleW = availableWidth / imgWidth;
          const scaleH = availableHeight / imgHeight;
          const scale = Math.max(scaleW, scaleH);

          const renderW = imgWidth * scale;
          const renderH = imgHeight * scale;
          const posX = marginPoints + (availableWidth - renderW) / 2;
          const posY = marginPoints + (availableHeight - renderH) / 2;

          // Clip to printable area
          doc.save();
          doc.rect(marginPoints, marginPoints, availableWidth, availableHeight).clip();
          doc.image(imgPath, posX, posY, {
            width: renderW,
            height: renderH
          });
          doc.restore();

        } else if (imageFit === 'original') {
          // Centered at original 1:1 scale
          const renderW = imgWidth;
          const renderH = imgHeight;
          const posX = (pageWidth - renderW) / 2;
          const posY = (pageHeight - renderH) / 2;

          doc.image(imgPath, posX, posY, {
            width: renderW,
            height: renderH
          });

        } else {
          // 'fit' (contain) - default
          const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
          const renderW = imgWidth * scale;
          const renderH = imgHeight * scale;
          const posX = marginPoints + (availableWidth - renderW) / 2;
          const posY = marginPoints + (availableHeight - renderH) / 2;

          doc.image(imgPath, posX, posY, {
            width: renderW,
            height: renderH
          });
        }
      }

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  convertImagesToPdf,
  PAGE_SIZES,
  MARGIN_MAP
};
