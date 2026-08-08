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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares - Disable frameguard & strict CSP frame ancestors to allow document previewing
app.use(helmet({
  crossOriginResourcePolicy: false,
  frameguard: false,
  contentSecurityPolicy: false,
}));

// Production CORS Security Configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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

app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  res.removeHeader('X-Frame-Options');
  next();
}, express.static(path.resolve(uploadDir)));

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
  console.log(` Database: ${process.env.DATABASE_URL || 'default dev.db'}`);
  console.log(`=================================================`);
});

export default app;
