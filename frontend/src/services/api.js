/**
 * API service for PDF ↔ JPG Converter
 */

// Backend URL from Vercel environment variable
// Example:
// VITE_API_URL=https://jpg-to-pdf-a5fy.vercel.app
const API_BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')}/api`;


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
  const {
    quality = 'high',
    dpi = 150,
    pageRange = 'all'
  } = options;

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

  files.forEach((file) => {
    formData.append('files', file);
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
 *
 * Backend usually returns URLs like:
 * /api/download/...
 *
 * This converts them into the full Vercel backend URL.
 */
export function triggerDownload(url, filename) {
  const downloadUrl = url.startsWith('http')
    ? url
    : `${(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')}${url}`;

  const link = document.createElement('a');

  link.href = downloadUrl;

  if (filename) {
    link.download = filename;
  }

  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}