/**
 * API service for PDF ↔ JPG Converter
 */

// Backend URL
// Vercel Environment Variable:
// VITE_API_URL=https://jpg-to-pdf-a5fy.vercel.app
//
// IMPORTANT:
// Do NOT add /api here.
// This file adds /api automatically.

const BACKEND_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000'
).replace(/\/+$/, '');

const API_BASE = `${BACKEND_URL}/api`;


/**
 * Safely parse JSON response
 */
async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return await response.json();
  }

  const text = await response.text();

  throw new Error(
    `Server returned an invalid response (${response.status}).`
  );
}


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

  const data = await parseResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || 'Failed to inspect PDF document.'
    );
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
    pageRange = 'all',
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

  const data = await parseResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || 'Failed to convert PDF.'
    );
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
    order = [],
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

  const data = await parseResponse(response);

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || 'Failed to generate PDF.'
    );
  }

  return data.data;
}


/**
 * Trigger browser file download
 *
 * Backend returns URLs such as:
 * /api/download/...
 *
 * This converts relative URLs into:
 * https://jpg-to-pdf-a5fy.vercel.app/api/download/...
 */
export function triggerDownload(url, filename) {
  let downloadUrl;

  if (url.startsWith('http://') || url.startsWith('https://')) {
    downloadUrl = url;
  } else {
    downloadUrl = `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  const link = document.createElement('a');

  link.href = downloadUrl;

  if (filename) {
    link.download = filename;
  }

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}