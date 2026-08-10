import prisma from '../config/db.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, actions, userId, meetingId, startDate, endDate, search, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    // Action filtering (single or comma-separated list)
    if (actions) {
      const actionList = Array.isArray(actions) ? actions : actions.split(',').map((a) => a.trim()).filter(Boolean);
      if (actionList.length > 0) {
        where.action = { in: actionList };
      }
    } else if (action) {
      if (action.includes(',')) {
        where.action = { in: action.split(',').map((a) => a.trim()).filter(Boolean) };
      } else {
        where.action = action;
      }
    }

    if (userId) where.userId = userId;
    if (meetingId) where.meetingId = meetingId;

    // Search filter across details, action, and ipAddress
    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { details: { contains: q, mode: 'insensitive' } },
        { action: { contains: q, mode: 'insensitive' } },
        { ipAddress: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Date range filter using indexed createdAt
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return sendSuccess(res, 'Audit logs fetched successfully', {
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
