const fs = require('fs');
const path = require('path');

/**
 * Format bytes to human readable string (KB, MB, etc.)
 */
function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Sanitize a filename to avoid path traversal and illegal filesystem characters
 */
function sanitizeFilename(filename) {
  if (!filename) return 'unnamed';
  return path.basename(filename)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_');
}

/**
 * Verify file header / magic numbers to ensure genuine file type
 */
function validateFileHeader(filePath) {
  try {
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    // PDF magic number: %PDF- (hex: 25 50 44 46 2D)
    if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
      return { isValid: true, type: 'pdf', mime: 'application/pdf' };
    }

    // JPEG magic numbers: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return { isValid: true, type: 'image', mime: 'image/jpeg' };
    }

    // PNG magic numbers: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4E &&
      buffer[3] === 0x47
    ) {
      return { isValid: true, type: 'image', mime: 'image/png' };
    }

    return { isValid: false, type: 'unknown', error: 'File header does not match valid PDF or JPEG/PNG format' };
  } catch (err) {
    return { isValid: false, type: 'unknown', error: 'Could not inspect file header: ' + err.message };
  }
}

/**
 * Ensures safe relative path within allowed directory to prevent path traversal
 */
function safeResolve(baseDir, relativePath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedPath = path.resolve(baseDir, relativePath);
  if (!resolvedPath.startsWith(resolvedBase)) {
    throw new Error('Access denied: Path traversal detected');
  }
  return resolvedPath;
}

module.exports = {
  formatBytes,
  sanitizeFilename,
  validateFileHeader,
  safeResolve,
};
