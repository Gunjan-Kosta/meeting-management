import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { users: true, actionItems: true } },
      },
    });

    return sendSuccess(res, 'Departments fetched successfully', departments);
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return sendError(res, 'Department name and unique code are required.', 400);
    }

    const department = await prisma.department.create({
      data: {
        name,
        code: code.toUpperCase(),
        description: description || '',
      },
    });

    return sendSuccess(res, 'Department created successfully', department, 201);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        code: code ? code.toUpperCase() : undefined,
        description,
      },
    });

    return sendSuccess(res, 'Department updated successfully', department);
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.department.delete({ where: { id } });

    return sendSuccess(res, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
};
