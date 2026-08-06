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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows cross-origin file resource fetching
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

// Ensure upload folder exists and serve static uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Apply General Rate Limiter
app.use('/api', apiLimiter);

// Route Registrations
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/actions', actionRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);

// Healthcheck Endpoint
app.get('/api/health', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Meeting Management System Server Running!`);
  console.log(` Port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=================================================`);
});

export default app;
