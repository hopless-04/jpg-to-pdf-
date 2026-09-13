const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const canvasModule = require('@napi-rs/canvas');
const { parsePageRange } = require('../utils/pageRange');
const { formatBytes, sanitizeFilename } = require('../utils/fileHelper');

// Polyfill canvas classes needed by pdfjs-dist
globalThis.DOMMatrix = canvasModule.DOMMatrix;
globalThis.ImageData = canvasModule.ImageData;
globalThis.Path2D = canvasModule.Path2D;

let pdfjsLib = null;

async function getPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  }

  return pdfjsLib;
}

const QUALITY_MAP = {
  low: 60,
  medium: 80,
  high: 95
};

const DPI_MAP = {
  72: 72,
  150: 150,
  300: 300
};

/**
 * Inspect PDF to get metadata, page count, and verify password protection
 */
async function getPdfInfo(filePath) {
  const fileBytes = fs.readFileSync(filePath);

  try {
    const pdfDoc = await PDFDocument.load(fileBytes, {
      ignoreEncryption: false
    });

    const pageCount = pdfDoc.getPageCount();
    const pagesInfo = [];

    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      pagesInfo.push({
        pageNumber: i + 1,
        width: Math.round(width),
        height: Math.round(height)
      });
    }

    return {
      success: true,
      pageCount,
      pages: pagesInfo,
      fileSize: fileBytes.length,
      fileSizeFormatted: formatBytes(fileBytes.length)
    };

  } catch (err) {
    if (
      err.message &&
      (
        err.message.includes('encrypt') ||
        err.name === 'EncryptedPDFError'
      )
    ) {
      const customErr = new Error(
        'Unable to process this PDF. The file is password-protected. Please remove the password and try again.'
      );

      customErr.statusCode = 400;
      throw customErr;
    }

    const customErr = new Error(
      'Unable to process this PDF. The file may be corrupted or not a valid PDF.'
    );

    customErr.statusCode = 400;
    throw customErr;
  }
}

/**
 * Convert PDF to JPG images based on user options
 */
async function convertPdfToJpg({
  filePath,
  originalFilename,
  sessionId,
  quality = 'high',
  dpi = 150,
  pageRange = 'all'
}) {
  const pdfJs = await getPdfJs();

  const fileBytes = new Uint8Array(
    fs.readFileSync(filePath)
  );

  // 1. Verify and get page count
  let doc;

  try {
    const loadingTask = pdfJs.getDocument({
      data: fileBytes,
      useSystemFonts: true,
      disableFontFace: true
    });

    doc = await loadingTask.promise;

  } catch (err) {
    if (
      err.name === 'PasswordException' ||
      (
        err.message &&
        err.message.toLowerCase().includes('password')
      )
    ) {
      const customErr = new Error(
        'Unable to process this PDF. The file is password-protected. Please remove the password and try again.'
      );

      customErr.statusCode = 400;
      throw customErr;
    }

    const customErr = new Error(
      'Unable to parse PDF document. The file may be corrupted.'
    );

    customErr.statusCode = 400;
    throw customErr;
  }

  const totalPages = doc.numPages;

  const targetPages = parsePageRange(
    pageRange,
    totalPages
  );

  // Get writable output directory
// Vercel serverless functions can ONLY write to /tmp
const isVercel = process.env.VERCEL === '1';

const outputBase = isVercel
  ? '/tmp/output'
  : path.resolve(process.env.OUTPUT_DIR || './output');

console.log('VERCEL:', process.env.VERCEL);
console.log('OUTPUT DIR:', outputBase);

// Make sure the output directory exists
if (!fs.existsSync(outputBase)) {
  fs.mkdirSync(outputBase, { recursive: true });
}

  const sessionDir = path.join(
    outputBase,
    sessionId
  );

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, {
      recursive: true
    });
  }

  // Calculate resolution & scale factor
  // PDF default is 72 points/inch
  const targetDpi = DPI_MAP[dpi] || 150;
  const scale = targetDpi / 72;
  const targetQuality =
    QUALITY_MAP[quality] || 80;

  const baseName = sanitizeFilename(
    path.parse(originalFilename).name
  );

  const convertedPages = [];

  for (let i = 0; i < targetPages.length; i++) {
    const pageNum = targetPages[i];

    const page = await doc.getPage(pageNum);

    const viewport = page.getViewport({
      scale
    });

    const canvas = canvasModule.createCanvas(
      Math.round(viewport.width),
      Math.round(viewport.height)
    );

    const ctx = canvas.getContext('2d');

    // Solid white background for JPG
    ctx.fillStyle = '#FFFFFF';

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;

    const jpgBuffer = canvas.toBuffer(
      'image/jpeg',
      targetQuality
    );

    const filename =
      `${baseName}_page_${pageNum}.jpg`;

    const outputPath = path.join(
      sessionDir,
      filename
    );

    fs.writeFileSync(
      outputPath,
      jpgBuffer
    );

    convertedPages.push({
      pageNumber: pageNum,
      filename,
      width: canvas.width,
      height: canvas.height,
      fileSize: jpgBuffer.length,
      fileSizeFormatted:
        formatBytes(jpgBuffer.length),
      downloadUrl:
        `/api/download/${sessionId}/${encodeURIComponent(filename)}`
    });
  }

  // Generate ZIP of all pages
  const zipFilename =
    `${baseName}_all_pages.zip`;

  const zipPath = path.join(
    sessionDir,
    zipFilename
  );

  await createZipArchive(
    sessionDir,
    convertedPages.map(
      p => p.filename
    ),
    zipPath
  );

  return {
    sessionId,
    originalFilename,
    totalPages,
    convertedCount: convertedPages.length,
    pages: convertedPages,
    zipDownloadUrl:
      `/api/download-zip/${sessionId}`
  };
}

/**
 * Creates a zip archive of the converted files
 */
async function createZipArchive(
  sessionDir,
  filenames,
  zipOutputPath
) {
  return new Promise(async (resolve, reject) => {
    try {
      // archiver is an ES Module, so use dynamic import()
      const archiverModule = await import('archiver');

      const archiver =
        archiverModule.default || archiverModule;

      const output =
        fs.createWriteStream(zipOutputPath);

      output.on('close', () => {
        resolve(zipOutputPath);
      });

      output.on('error', (err) => {
        reject(err);
      });

      const archive = archiver('zip', {
        zlib: { level: 6 }
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      for (const file of filenames) {
        const filePath =
          path.join(sessionDir, file);

        if (fs.existsSync(filePath)) {
          archive.file(filePath, {
            name: file
          });
        }
      }

      await archive.finalize();

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  getPdfInfo,
  convertPdfToJpg,
  createZipArchive
};