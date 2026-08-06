import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { recordAuditLog } from '../services/auditService.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide both email and password.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true },
    });

    if (!user || !user.active) {
      return sendError(res, 'Invalid credentials or inactive account.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials.', 401);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await recordAuditLog({
      userId: user.id,
      action: 'USER_LOGIN',
      details: `User ${user.email} logged in successfully`,
      ipAddress: req.ip,
    });

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.passwordHash;

    return sendSuccess(res, 'Login successful', {
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { department: true },
    });

    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.passwordHash;

    return sendSuccess(res, 'User profile fetched successfully', userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, district } = req.body;
    let profileImage = req.user.profileImage;

    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        district: district || req.user.district,
        profileImage,
      },
      include: { department: true },
    });

    const userWithoutPassword = { ...updatedUser };
    delete userWithoutPassword.passwordHash;

    return sendSuccess(res, 'Profile updated successfully', userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current and new password are required.', 400);
    }

    if (newPassword.length < 6) {
      return sendError(res, 'New password must be at least 6 characters long.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash },
    });

    await recordAuditLog({
      userId: req.user.id,
      action: 'USER_PASSWORD_CHANGE',
      details: `User ${req.user.email} changed password`,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await recordAuditLog({
        userId: req.user.id,
        action: 'USER_LOGOUT',
        details: `User ${req.user.email} logged out`,
        ipAddress: req.ip,
      });
    }
    return sendSuccess(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};
