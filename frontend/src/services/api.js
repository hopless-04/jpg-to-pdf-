/**
 * API service for PDF ↔ JPG Converter
 */

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
/**
 * Get PDF metadata and page count
 */
export async function fetchPdfInfo(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/pdf-info`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to inspect PDF document.');
  }

  return data.data;
}

/**
 * Convert PDF to JPG
 */
export async function convertPdfToJpg(file, options = {}) {
  const { quality = 'high', dpi = 150, pageRange = 'all' } = options;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', quality);
  formData.append('dpi', dpi);
  formData.append('pageRange', pageRange);

  const response = await fetch(`${API_BASE}/pdf-to-jpg`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to convert PDF.');
  }

  return data.data;
}

/**
 * Convert JPG/PNG images to PDF
 */
export async function convertJpgToPdf(files, options = {}) {
  const {
    pageSize = 'a4',
    orientation = 'auto',
    imageFit = 'fit',
    margin = 'none',
    pdfName = 'converted_images.pdf',
    order = []
  } = options;

  const formData = new FormData();
  files.forEach(f => {
    formData.append('files', f);
  });

  formData.append('pageSize', pageSize);
  formData.append('orientation', orientation);
  formData.append('imageFit', imageFit);
  formData.append('margin', margin);
  formData.append('pdfName', pdfName);
  formData.append('order', JSON.stringify(order));

  const response = await fetch(`${API_BASE}/jpg-to-pdf`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate PDF.');
  }

  return data.data;
}

/**
 * Trigger browser file download
 */
export function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  if (filename) {
    link.download = filename;
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
