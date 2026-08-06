import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { sendError } from '../utils/responseHandler.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        departmentId: true,
        district: true,
        active: true,
        profileImage: true,
      },
    });

    if (!user || !user.active) {
      return sendError(res, 'Invalid token or user account disabled.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please login again.', 401);
    }
    return sendError(res, 'Invalid authentication token.', 401);
  }
};
