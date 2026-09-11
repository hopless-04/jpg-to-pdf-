# PDF ↔ JPG Converter

> A modern, fast, secure, and responsive web application for two-way conversion between PDF documents and JPG/PNG images with zero permanent file storage.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19-cyan.svg)
![TailwindCSS](https://img.shields.io/badge/tailwind-3.4-38bdf8.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## Overview

**PDF ↔ JPG Converter** enables users to:
1. **PDF → JPG**: Convert multi-page PDF documents into high-resolution JPG images with customizable DPI (72, 150, 300), image quality (Low, Medium, High), and page range selection (all pages or specific ranges like `1,3,5-8`). Download pages individually or as a single ZIP archive.
2. **JPG → PDF**: Combine multiple JPG, JPEG, or PNG images into a single professional PDF document. Features drag-and-drop page reordering, customizable page sizes (A4, Letter, Legal, Original), orientations (Portrait, Landscape, Auto), image fitting modes (Fit, Fill, Original), and margins.

All conversions are processed natively in a pure Node.js environment without external native binaries (such as Poppler, GraphicsMagick, or ImageMagick).

---

## Key Features

- **Fast & Reliable Engine**:
  - PDF rendering powered by `pdfjs-dist` and `@napi-rs/canvas` (Rust-based Skia engine).
  - PDF generation powered by `pdfkit` and `pdf-lib`.
  - Batch archive packaging powered by `archiver`.
- **Drag & Drop UI**:
  - Interactive upload dropzones with hover animations and file type validation.
  - Multi-image drag-and-drop reordering with thumbnail previews, file size indicators, and accessible arrow buttons.
- **Conversion Options**:
  - **PDF to JPG**: Quality (60%, 80%, 95%), DPI (72, 150, 300), and custom page ranges.
  - **JPG to PDF**: Page Size (A4, Letter, Legal, Original), Orientation (Auto, Portrait, Landscape), Image Fit (Fit to page, Fill page, Original size), and Margins (None, Small, Medium, Large).
- **Smooth Progress Feedback**:
  - Progress bar with real-time percentage and page-by-page progress status (`Converting page X of Y...`).
- **Privacy & Security**:
  - **Zero Permanent File Retention**: Uploaded source files are removed immediately upon conversion completion.
  - **Automated Cleanup**: Converted session files are automatically purged by a background cleanup worker after 30 minutes.
  - **File Signature Inspection**: Magic bytes validation ensures only authentic PDFs and JPG/PNG images are processed, protecting against disguised file execution.
  - **No Stack Trace Leaks**: User-friendly error messages for corrupted or password-protected files without exposing internal error traces.
  - **Rate Limiting & CORS**: Preconfigured rate limiting and safe path resolution preventing directory traversal.
- **Fully Responsive**:
  - Designed for Desktop, Tablet, and Mobile with responsive layouts and hamburger navigation.

---

## Tech Stack

### Frontend
- **React.js** (Vite)
- **Tailwind CSS**
- **Lucide React** (modern iconography)
- **Canvas Confetti** (celebration animations)

### Backend
- **Node.js** (v20+ / v24)
- **Express.js** (REST API)
- **pdfjs-dist** (PDF parsing and vector rasterization)
- **@napi-rs/canvas** (high-performance Canvas 2D backend)
- **pdfkit** (PDF generation)
- **pdf-lib** (PDF structure analysis and encryption verification)
- **archiver** (ZIP archive generation)
- **multer** (secure multipart file uploads)
- **express-rate-limit** & **morgan**

---

## Project Structure

```text
pdf-jpg-converter/
├── backend/
│   ├── controllers/
│   │   ├── pdfController.js       # PDF info, conversion, downloads
│   │   └── imageController.js     # Image to PDF conversion
│   ├── middleware/
│   │   ├── upload.js              # Multer upload limits & filters
│   │   ├── validation.js          # Magic byte file header validation
│   │   └── errorHandler.js        # Sanitized error handler
│   ├── routes/
│   │   └── api.js                 # API endpoints
│   ├── services/
│   │   ├── pdfToJpgService.js     # Rendering & ZIP packaging
│   │   ├── jpgToPdfService.js     # Image layout & PDF generation
│   │   └── cleanupService.js      # Automatic file purging
│   ├── utils/
│   │   ├── fileHelper.js          # File formatting & path safety
│   │   └── pageRange.js           # Page range token parser
│   ├── uploads/                   # Temporary upload directory
│   ├── output/                    # Temporary session output directory
│   ├── test-suite.js              # Automated verification test suite
│   ├── .env                       # Backend environment variables
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── favicon.svg            # Custom brand favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Responsive navigation bar
│   │   │   ├── Footer.jsx         # SaaS footer with privacy note
│   │   │   ├── FileUploader.jsx   # Drag & drop upload area
│   │   │   ├── ProgressBar.jsx    # Progress bar and status
│   │   │   ├── ImageCard.jsx      # Draggable reorderable image card
│   │   │   └── AlertModal.jsx     # Friendly error modal
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Hero, tools cards, features, FAQ
│   │   │   ├── PdfToJpg.jsx       # PDF to JPG converter page
│   │   │   ├── JpgToPdf.jsx       # JPG to PDF converter page
│   │   │   └── HowItWorks.jsx     # Workflow guide & tips
│   │   ├── services/
│   │   │   └── api.js             # Fetch client
│   │   ├── App.jsx                # Router and view manager
│   │   ├── index.css              # Tailwind directives
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js             # Vite config with backend proxy
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```

---

## Installation & Setup

### Prerequisites
- **Node.js** (v20 or higher recommended; verified on Node v24.19)
- **npm** (v10 or higher)

### 1. Clone or Open the Repository
```bash
cd c:/Users/ASUS/OneDrive/Desktop/python/pdf-jpg-converter
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## Environment Variables

The backend uses a `.env` file located in `backend/.env`. A template is provided in `backend/.env.example`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port for Express backend |
| `NODE_ENV` | `development` | Environment mode |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS frontend URL |
| `MAX_FILE_SIZE` | `52428800` | Maximum file size in bytes (50MB) |
| `MAX_FILES_COUNT` | `30` | Maximum images per batch upload |
| `UPLOAD_DIR` | `./uploads` | Temporary upload folder |
| `OUTPUT_DIR` | `./output` | Temporary output session folder |
| `CLEANUP_INTERVAL_MINUTES` | `15` | Interval for automated cleanup runner |
| `FILE_MAX_AGE_MINUTES` | `30` | Max age before files are purged |

---

## Running the Application Locally

### Option A: Development Mode

#### 1. Start the Backend (Terminal 1)
```bash
cd backend
npm run dev
# or: node server.js
```
The backend starts at `http://localhost:5000`.

#### 2. Start the Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
The frontend starts at `http://localhost:5173` with an automatic proxy to the backend.

Open your browser and navigate to:
```
http://localhost:5173
```

---

### Option B: Production Build

#### 1. Build the Frontend
```bash
cd frontend
npm run build
```
This generates an optimized production bundle in `frontend/dist`.

#### 2. Start Backend
```bash
cd backend
NODE_ENV=production npm start
```

---

## Testing

An end-to-end automated test suite is included in `backend/test-suite.js`. It runs comprehensive integration tests against a live backend server:

```bash
cd backend
node test-suite.js
```

### What the Test Suite Verifies:
1. `GET /api/health`: Health status endpoint.
2. Synthesizes a multi-page test PDF.
3. `POST /api/pdf-info`: Verifies page count and dimensions.
4. `POST /api/pdf-to-jpg`: Renders all pages, validates JPEG binary headers, creates and tests ZIP archive.
5. Custom page range (`1,3`): Verifies only requested pages are converted.
6. Synthesizes 3 distinct JPEG test images.
7. `POST /api/jpg-to-pdf`: Tests custom order `[3, 1, 2]`, options, and validates resulting PDF has 3 pages.
8. Security check: Text file renamed to `.pdf` is rejected with 400 and zero stack trace leak.
9. Security check: Invalid image content rejected cleanly.

---

## REST API Reference

### Health Check
- **`GET /api/health`**
  - Response: `{ status: 'ok', service: '...', uptime: 12 }`

### PDF Inspection
- **`POST /api/pdf-info`**
  - **Body**: `multipart/form-data` with `file: <PDF file>`
  - **Response**: `{ success: true, data: { pageCount: 3, pages: [...] } }`

### PDF to JPG Conversion
- **`POST /api/pdf-to-jpg`**
  - **Body**: `multipart/form-data`
    - `file`: PDF file
    - `quality`: `'low'` | `'medium'` | `'high'` (default `'high'`)
    - `dpi`: `72` | `150` | `300` (default `150`)
    - `pageRange`: `'all'` | `'1,3,5-8'` (default `'all'`)
  - **Response**:
    ```json
    {
      "success": true,
      "message": "Conversion completed successfully!",
      "data": {
        "sessionId": "...",
        "totalPages": 3,
        "convertedCount": 3,
        "pages": [
          { "pageNumber": 1, "filename": "doc_page_1.jpg", "downloadUrl": "/api/download/..." }
        ],
        "zipDownloadUrl": "/api/download-zip/..."
      }
    }
    ```

### JPG to PDF Conversion
- **`POST /api/jpg-to-pdf`**
  - **Body**: `multipart/form-data`
    - `files`: Image files (up to 30)
    - `pageSize`: `'a4'` | `'letter'` | `'legal'` | `'original'`
    - `orientation`: `'auto'` | `'portrait'` | `'landscape'`
    - `imageFit`: `'fit'` | `'fill'` | `'original'`
    - `margin`: `'none'` | `'small'` | `'medium'` | `'large'`
    - `pdfName`: Output file name
    - `order`: JSON stringified array of filenames
  - **Response**:
    ```json
    {
      "success": true,
      "message": "PDF generated successfully!",
      "data": {
        "sessionId": "...",
        "filename": "my_doc.pdf",
        "pageCount": 3,
        "downloadUrl": "/api/download/..."
      }
    }
    ```

### File Downloads
- **`GET /api/download/:sessionId/:filename`**: Secure download of individual image or PDF.
- **`GET /api/download-zip/:sessionId`**: Stream ZIP archive of all converted pages.

---

## License

MIT License. Free to use, modify, and distribute.
