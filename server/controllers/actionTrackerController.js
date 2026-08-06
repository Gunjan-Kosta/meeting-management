import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { recordAuditLog } from '../services/auditService.js';

export const createActionItem = async (req, res, next) => {
  try {
    const { meetingId, title, description, assignedDepartmentId, assignedUserId, targetDate, remarks } = req.body;

    if (!meetingId || !title || !assignedDepartmentId || !targetDate) {
      return sendError(res, 'Meeting ID, Title, Assigned Department, and Target Date are required.', 400);
    }

    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) {
      return sendError(res, 'Meeting not found.', 404);
    }

    const actionItem = await prisma.meetingActionTracker.create({
      data: {
        meetingId,
        title,
        description: description || '',
        assignedDepartmentId,
        assignedUserId: assignedUserId || null,
        targetDate: new Date(targetDate),
        remarks: remarks || '',
        status: 'PENDING',
      },
      include: {
        assignedDepartment: true,
        assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await recordAuditLog({
      userId: req.user.id,
      action: 'ACTION_ITEM_CREATED',
      details: `Created action item "${actionItem.title}" for meeting ${meeting.meetingCode}`,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 'Action item created successfully', actionItem, 201);
  } catch (error) {
    next(error);
  }
};

export const getActionItems = async (req, res, next) => {
  try {
    const { meetingId, departmentId, userId, status, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (meetingId) where.meetingId = meetingId;
    if (departmentId) where.assignedDepartmentId = departmentId;
    if (userId) where.assignedUserId = userId;
    if (status) where.status = status;

    const [total, actions] = await Promise.all([
      prisma.meetingActionTracker.count({ where }),
      prisma.meetingActionTracker.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { targetDate: 'asc' },
        include: {
          meeting: { select: { id: true, meetingCode: true, title: true, district: true } },
          assignedDepartment: true,
          assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
    ]);

    return sendSuccess(res, 'Action items fetched successfully', {
      actionItems: actions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateActionItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, assignedDepartmentId, assignedUserId, targetDate, remarks, status } = req.body;

    const existingAction = await prisma.meetingActionTracker.findUnique({
      where: { id },
      include: { meeting: true },
    });

    if (!existingAction) {
      return sendError(res, 'Action item not found.', 404);
    }

    if (existingAction.status === 'COMPLETED') {
      return sendError(res, 'Completed action items cannot be edited.', 400);
    }

    const updated = await prisma.meetingActionTracker.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingAction.title,
        description: description !== undefined ? description : existingAction.description,
        assignedDepartmentId: assignedDepartmentId || existingAction.assignedDepartmentId,
        assignedUserId: assignedUserId !== undefined ? assignedUserId : existingAction.assignedUserId,
        targetDate: targetDate ? new Date(targetDate) : existingAction.targetDate,
        remarks: remarks !== undefined ? remarks : existingAction.remarks,
        status: status || existingAction.status,
      },
      include: {
        assignedDepartment: true,
        assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    const isCompletedNow = updated.status === 'COMPLETED' && existingAction.status !== 'COMPLETED';

    await recordAuditLog({
      userId: req.user.id,
      action: isCompletedNow ? 'ACTION_ITEM_COMPLETED' : 'ACTION_ITEM_UPDATED',
      details: `${isCompletedNow ? 'Completed' : 'Updated'} action item "${updated.title}" for meeting ${existingAction.meeting.meetingCode}`,
      ipAddress: req.ip,
    });

    return sendSuccess(res, `Action item ${isCompletedNow ? 'marked as completed' : 'updated'} successfully`, updated);
  } catch (error) {
    next(error);
  }
};
