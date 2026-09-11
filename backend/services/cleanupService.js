const fs = require('fs');
const path = require('path');

const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
const outputDir = path.resolve(process.env.OUTPUT_DIR || './output');
const maxAgeMinutes = parseInt(process.env.FILE_MAX_AGE_MINUTES, 10) || 30;
const intervalMinutes = parseInt(process.env.CLEANUP_INTERVAL_MINUTES, 10) || 15;

function cleanDirectory(directoryPath, maxAgeMs) {
  if (!fs.existsSync(directoryPath)) return;
  const now = Date.now();

  try {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name);
      try {
        const stats = fs.statSync(fullPath);
        const ageMs = now - stats.mtimeMs;

        if (ageMs > maxAgeMs) {
          if (entry.isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
            console.log(`[Cleanup] Removed stale session directory: ${entry.name}`);
          } else {
            fs.unlinkSync(fullPath);
            console.log(`[Cleanup] Removed stale file: ${entry.name}`);
          }
        }
      } catch (e) {
        console.warn(`[Cleanup] Warning: could not check or delete ${fullPath}:`, e.message);
      }
    }
  } catch (err) {
    console.error(`[Cleanup] Error scanning ${directoryPath}:`, err.message);
  }
}

function runCleanup() {
  const maxAgeMs = maxAgeMinutes * 60 * 1000;
  cleanDirectory(uploadDir, maxAgeMs);
  cleanDirectory(outputDir, maxAgeMs);
}

function startCleanupJob() {
  // Run once on startup
  runCleanup();
  // Schedule recurring check
  const intervalMs = intervalMinutes * 60 * 1000;
  setInterval(runCleanup, intervalMs);
  console.log(`[Cleanup] Scheduled file cleanup every ${intervalMinutes} minutes (retention: ${maxAgeMinutes} mins)`);
}

function cleanSessionFiles(sessionId) {
  if (!sessionId || sessionId.length < 8) return;
  try {
    const sessionDir = path.join(outputDir, sessionId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn(`[Cleanup] Failed to remove session ${sessionId}:`, err.message);
  }
}

module.exports = {
  startCleanupJob,
  runCleanup,
  cleanSessionFiles
};
