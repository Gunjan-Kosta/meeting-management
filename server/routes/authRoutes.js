import express from 'express';
import { login, getProfile, updateProfile, changePassword, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/login', authLimiter, login);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, upload.single('profileImage'), updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.post('/logout', authenticateToken, logout);

export default router;
