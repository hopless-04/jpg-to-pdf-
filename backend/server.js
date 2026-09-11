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

/// File storage
// Vercel serverless functions can only write temporary files to /tmp
const isProduction = process.env.NODE_ENV === 'production';

const uploadDir = isProduction
  ? '/tmp/uploads'
  : path.resolve(process.env.UPLOAD_DIR || './uploads');

const outputDir = isProduction
  ? '/tmp/output'
  : path.resolve(process.env.OUTPUT_DIR || './output');

// Ensure directories exist
[uploadDir, outputDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Security & Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging - only in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // 150 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

app.use('/api', limiter);

// Mount API routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server ONLY when running locally
if (!isProduction) {
  const server = app.listen(PORT, () => {
    console.log('===========================================');
    console.log('PDF ↔ JPG Converter Backend Running!');
    console.log(`Port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Uploads Dir: ${uploadDir}`);
    console.log(`Output Dir: ${outputDir}`);
    console.log('===========================================');

    startCleanupJob();
  });
}

module.exports = app;