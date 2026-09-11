/**
 * Parse page range string (e.g., "1,3,5-8", "all", "1-4") into an array of 1-based page numbers.
 * @param {string|undefined} rangeStr 
 * @param {number} totalPages 
 * @returns {number[]} Array of 1-based page numbers, deduplicated and sorted.
 */
function parsePageRange(rangeStr, totalPages) {
  if (!rangeStr || rangeStr.trim() === '' || rangeStr.trim().toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set();
  const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map(s => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        throw new Error(`Invalid page range token: "${part}". Format should be e.g. "1-5".`);
      }

      for (let p = start; p <= Math.min(end, totalPages); p++) {
        pages.add(p);
      }
    } else {
      const p = parseInt(part, 10);
      if (isNaN(p) || p < 1) {
        throw new Error(`Invalid page number: "${part}".`);
      }
      if (p <= totalPages) {
        pages.add(p);
      }
    }
  }

  const result = Array.from(pages).sort((a, b) => a - b);
  if (result.length === 0) {
    throw new Error(`Selected page range yielded no valid pages (document has ${totalPages} pages).`);
  }

  return result;
}

module.exports = {
  parsePageRange,
};
