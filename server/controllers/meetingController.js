import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { generateMeetingCode } from '../utils/meetingCodeGenerator.js';
import { recordAuditLog } from '../services/auditService.js';

export const createMeeting = async (req, res, next) => {
  try {
    const { title, description, meetingType, meetingDate, venue, district, participants } = req.body;

    if (!title || !meetingType || !meetingDate || !venue || !district) {
      return sendError(res, 'Title, Meeting Type, Meeting Date, Venue, and District are required.', 400);
    }

    const meetingCode = await generateMeetingCode();

    const meeting = await prisma.meeting.create({
      data: {
        meetingCode,
        title,
        description: description || '',
        meetingType,
        meetingDate: new Date(meetingDate),
        venue,
        district,
        status: 'DRAFT',
        creatorId: req.user.id,
        participants: participants && Array.isArray(participants) ? {
          create: participants.map(p => ({
            name: p.name,
            designation: p.designation || '',
            department: p.department || '',
            email: p.email || null,
            phone: p.phone || null,
            isPresent: p.isPresent !== undefined ? p.isPresent : true,
          })),
        } : undefined,
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        participants: true,
      },
    });

    await recordAuditLog({
      userId: req.user.id,
      action: 'MEETING_CREATED',
      details: `Created meeting ${meeting.meetingCode}: "${meeting.title}" in DRAFT status`,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 'Meeting created successfully as DRAFT', meeting, 201);
  } catch (error) {
    next(error);
  }
};

export const getMeetings = async (req, res, next) => {
  try {
    const {
      search,
      meetingCode,
      title,
      meetingType,
      district,
      status,
      year,
      month,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (search) {
      where.OR = [
        { meetingCode: { contains: search } },
        { title: { contains: search } },
        { venue: { contains: search } },
        { district: { contains: search } },
      ];
    }

    if (meetingCode) where.meetingCode = { contains: meetingCode };
    if (title) where.title = { contains: title };
    if (meetingType) where.meetingType = meetingType;
    if (district) where.district = district;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.meetingDate = {};
      if (startDate) where.meetingDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.meetingDate.lte = end;
      }
    } else if (year || month) {
      where.meetingDate = {};
      const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();
      if (month) {
        const monthNum = parseInt(month, 10) - 1;
        where.meetingDate.gte = new Date(currentYear, monthNum, 1);
        where.meetingDate.lte = new Date(currentYear, monthNum + 1, 0, 23, 59, 59);
      } else {
        where.meetingDate.gte = new Date(currentYear, 0, 1);
        where.meetingDate.lte = new Date(currentYear, 11, 31, 23, 59, 59);
      }
    }

    // Role-based restrictions: District users can see meetings created by them or for their district
    if (req.user.role === 'DISTRICT_USER' && req.user.district) {
      where.district = req.user.district;
    }

    const [total, meetings] = await Promise.all([
      prisma.meeting.count({ where }),
      prisma.meeting.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: {
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: {
            select: { documents: true, actionItems: true, participants: true },
          },
        },
      }),
    ]);

    return sendSuccess(res, 'Meetings fetched successfully', {
      meetings,
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

export const getMeetingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        documents: {
          include: {
            uploadedBy: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        participants: true,
        actionItems: {
          include: {
            assignedDepartment: true,
            assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!meeting) {
      return sendError(res, 'Meeting record not found.', 404);
    }

    return sendSuccess(res, 'Meeting details fetched successfully', meeting);
  } catch (error) {
    next(error);
  }
};

export const updateMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, meetingType, meetingDate, venue, district, participants } = req.body;

    const existingMeeting = await prisma.meeting.findUnique({ where: { id } });

    if (!existingMeeting) {
      return sendError(res, 'Meeting record not found.', 404);
    }

    // Role check: District Users cannot edit SUBMITTED or CLOSED meetings
    if (req.user.role === 'DISTRICT_USER' && existingMeeting.status !== 'DRAFT') {
      return sendError(res, 'District Users cannot edit meetings once submitted or closed.', 403);
    }

    const updatedData = {
      title: title !== undefined ? title : existingMeeting.title,
      description: description !== undefined ? description : existingMeeting.description,
      meetingType: meetingType !== undefined ? meetingType : existingMeeting.meetingType,
      meetingDate: meetingDate ? new Date(meetingDate) : existingMeeting.meetingDate,
      venue: venue !== undefined ? venue : existingMeeting.venue,
      district: district !== undefined ? district : existingMeeting.district,
    };

    const meeting = await prisma.meeting.update({
      where: { id },
      data: updatedData,
      include: { creator: true, participants: true },
    });

    await recordAuditLog({
      userId: req.user.id,
      action: 'MEETING_UPDATED',
      details: `Updated meeting details for ${meeting.meetingCode}`,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 'Meeting updated successfully', meeting);
  } catch (error) {
    next(error);
  }
};

export const submitMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingMeeting = await prisma.meeting.findUnique({
      where: { id },
      include: { documents: true },
    });

    if (!existingMeeting) {
      return sendError(res, 'Meeting record not found.', 404);
    }

    if (existingMeeting.status !== 'DRAFT') {
      return sendError(res, 'Only DRAFT meetings can be submitted.', 400);
    }

    const hasMoM = existingMeeting.documents.some((doc) => doc.fileType === 'MOM');
    if (!hasMoM) {
      return sendError(
        res,
        'Cannot submit meeting. Minutes of Meeting (MoM) document must be uploaded before submitting.',
        400
      );
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: { status: 'SUBMITTED' },
    });

    await recordAuditLog({
      userId: req.user.id,
      action: 'MEETING_SUBMITTED',
      details: `Submitted meeting ${meeting.meetingCode}`,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 'Meeting submitted successfully', meeting);
  } catch (error) {
    next(error);
  }
};

export const closeMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingMeeting = await prisma.meeting.findUnique({ where: { id } });

    if (!existingMeeting) {
      return sendError(res, 'Meeting record not found.', 404);
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: { status: 'CLOSED' },
    });

    await recordAuditLog({
      userId: req.user.id,
      action: 'MEETING_CLOSED',
      details: `Closed meeting ${meeting.meetingCode}`,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 'Meeting closed successfully', meeting);
  } catch (error) {
    next(error);
  }
};

export const reopenMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingMeeting = await prisma.meeting.findUnique({ where: { id } });
    if (!existingMeeting) {
      return sendError(res, 'Meeting record not found.', 404);
    }

    if (existingMeeting.status === 'DRAFT') {
      return sendError(res, 'Meeting is already in DRAFT status.', 400);
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: { status: 'DRAFT' },
    });

    await recordAuditLog({
      userId: req.user.id,
      action: 'MEETING_REOPENED',
      details: `Reopened meeting ${meeting.meetingCode} to DRAFT status`,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 'Meeting reopened to DRAFT status successfully', meeting);
  } catch (error) {
    next(error);
  }
};

export const deleteMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingMeeting = await prisma.meeting.findUnique({ where: { id } });
    if (!existingMeeting) {
      return sendError(res, 'Meeting record not found.', 404);
    }

    await prisma.meeting.delete({ where: { id } });

    await recordAuditLog({
      userId: req.user.id,
      action: 'MEETING_DELETED',
      details: `Deleted meeting ${existingMeeting.meetingCode}`,
      ipAddress: req.ip,
    });

    return sendSuccess(res, 'Meeting deleted successfully');
  } catch (error) {
    next(error);
  }
};
