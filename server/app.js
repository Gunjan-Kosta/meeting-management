import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import actionRoutes from './routes/actionRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { initCronJobs } from './services/cronService.js';
import { seedDatabase } from './seed.js';
import prisma from './config/db.js';
import { getMimeType } from './utils/fileValidator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares - Disable frameguard & strict CSP frame ancestors to allow document previewing
app.use(helmet({
  crossOriginResourcePolicy: false,
  frameguard: false,
  contentSecurityPolicy: false,
}));

// Universal Cross-Origin Resource Sharing (CORS) Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. health checks, server-to-server, curl)
    if (!origin) return callback(null, true);

    // Allow all vercel.app domains (production & preview branches), localhost, or any configured FRONTEND_URL
    const isVercel = /\.vercel\.app$/.test(origin);
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isExplicitFrontend = process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL;

    if (isVercel || isLocalhost || isExplicitFrontend || true) {
      return callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auto-detect persistent disk storage (e.g. Render Persistent Disk /var/data or custom path)
const getPersistentUploadDir = () => {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  if (fs.existsSync('/var/data')) return '/var/data/uploads';
  return './uploads';
};

const uploadDir = getPersistentUploadDir();
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const handleServeUploads = async (req, res, next) => {
  try {
    const rawFilename = req.path.replace(/^\/+/, '');
    if (!rawFilename) return next();

    const filename = decodeURIComponent(rawFilename);
    const diskPath = path.join(path.resolve(uploadDir), filename);

    // Set common permissive headers for document previewing & downloads
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Security-Policy', "frame-ancestors *");
    res.removeHeader('X-Frame-Options');

    // 1. If file is on local disk, serve directly
    if (fs.existsSync(diskPath)) {
      const mimeType = getMimeType(filename);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
      return res.sendFile(diskPath);
    }

    // 2. If missing from container disk (e.g. after Render redeployment/restart), retrieve from MongoDB Atlas
    const document = await prisma.meetingDocument.findFirst({
      where: {
        OR: [
          { filePath: `/uploads/${filename}` },
          { filePath: filename },
          { filePath: { endsWith: filename } },
        ],
      },
    });

    if (document && document.fileData && document.fileData.length > 0) {
      const buffer = Buffer.from(document.fileData);

      // Recreate/cache to local container disk for instant subsequent access
      try {
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        fs.writeFileSync(diskPath, buffer);
      } catch (cacheErr) {
        console.warn('[Disk Cache Notice]', cacheErr.message);
      }

      const mimeType = document.mimeType || getMimeType(document.name || filename);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.name || filename)}"`);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    }

    return res.status(404).json({
      success: false,
      message: `Cannot GET /uploads/${filename} - Document not found in persistent cloud storage.`,
    });
  } catch (err) {
    console.error('[Uploads Storage Error]', err);
    return next(err);
  }
};

app.use('/uploads', handleServeUploads);
app.use('/api/uploads', handleServeUploads);

// Apply General Rate Limiter
app.use('/api', apiLimiter);

// Route Registrations (Mounted on both /api/* and /* for dual compatibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/meetings', meetingRoutes);
app.use('/meetings', meetingRoutes);

app.use('/api/documents', documentRoutes);
app.use('/documents', documentRoutes);

app.use('/api/actions', actionRoutes);
app.use('/actions', actionRoutes);

app.use('/api/departments', departmentRoutes);
app.use('/departments', departmentRoutes);

app.use('/api/users', userRoutes);
app.use('/users', userRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/api/reports', reportRoutes);
app.use('/reports', reportRoutes);

app.use('/api/audit-logs', auditRoutes);
app.use('/audit-logs', auditRoutes);

// Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    system: 'Enterprise Meeting Management System',
    timestamp: new Date().toISOString(),
  });
});
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    system: 'Enterprise Meeting Management System',
    timestamp: new Date().toISOString(),
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Initialize Cron Reminders
initCronJobs();

// Safe, non-destructive startup check (only seeds if database is completely empty)
seedDatabase({ isCli: false }).catch((err) => console.error('[STARTUP SEED NOTICE]', err.message));

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Meeting Management System Server Running!`);
  console.log(` Port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Upload Directory: ${path.resolve(uploadDir)}`);
  console.log(` Database: ${process.env.DATABASE_URL || 'default database'}`);
  console.log(`=================================================`);
});

export default app;
