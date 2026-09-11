require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const { startCleanupJob } = require('./services/cleanupService');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// File Storage
// ==========================================

// Vercel provides the VERCEL environment variable.
// Files written in Vercel should use /tmp.
const isVercel = process.env.VERCEL === '1';

const uploadDir = isVercel
  ? '/tmp/uploads'
  : path.resolve(process.env.UPLOAD_DIR || './uploads');

const outputDir = isVercel
  ? '/tmp/output'
  : path.resolve(process.env.OUTPUT_DIR || './output');

// Create directories if they don't exist
[uploadDir, outputDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ==========================================
// Security & Middleware
// ==========================================

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging only during local development
if (!isVercel) {
  app.use(morgan('dev'));
}

// ==========================================
// Rate Limiting
// ==========================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

app.use('/api', limiter);

// ==========================================
// API Routes
// ==========================================

app.use('/api', apiRoutes);

// ==========================================
// Global Error Handler
// ==========================================

app.use(errorHandler);

// ==========================================
// Local Development Server
// ==========================================

// Vercel handles the server.
// app.listen() is only needed when running locally.
if (!isVercel) {
  const server = app.listen(PORT, () => {
    console.log('===========================================');
    console.log('PDF ↔ JPG Converter Backend Running!');
    console.log(`Port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Vercel: ${isVercel}`);
    console.log(`Uploads Dir: ${uploadDir}`);
    console.log(`Output Dir: ${outputDir}`);
    console.log('===========================================');

    // Start cleanup job only locally
    startCleanupJob();
  });
}

// Export Express app for Vercel
module.exports = app;