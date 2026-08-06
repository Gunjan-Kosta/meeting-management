import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, departmentId, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        district: true,
        active: true,
        profileImage: true,
        department: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, 'Users fetched successfully', users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, departmentId, district } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return sendError(res, 'Email, password, first name, last name, and role are required.', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'User with this email already exists.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        departmentId: departmentId || null,
        district: district || null,
      },
      include: { department: true },
    });

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.passwordHash;

    return sendSuccess(res, 'User created successfully', userWithoutPassword, 201);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { active, role, departmentId, district } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        active: active !== undefined ? active : undefined,
        role: role || undefined,
        departmentId: departmentId !== undefined ? departmentId : undefined,
        district: district !== undefined ? district : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        department: true,
      },
    });

    return sendSuccess(res, 'User status updated successfully', user);
  } catch (error) {
    next(error);
  }
};
