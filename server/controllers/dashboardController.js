import prisma from '../config/db.js';
import { sendSuccess } from '../utils/responseHandler.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const { district } = req.query;

    const meetingWhere = {};
    if (district) meetingWhere.district = district;

    const [
      totalMeetings,
      draftMeetings,
      submittedMeetings,
      closedMeetings,
      totalActions,
      pendingActions,
      inProgressActions,
      completedActions,
      departmentCount,
      typeDistribution,
      recentAuditLogs,
      upcomingDeadlines,
    ] = await Promise.all([
      prisma.meeting.count({ where: meetingWhere }),
      prisma.meeting.count({ where: { ...meetingWhere, status: 'DRAFT' } }),
      prisma.meeting.count({ where: { ...meetingWhere, status: 'SUBMITTED' } }),
      prisma.meeting.count({ where: { ...meetingWhere, status: 'CLOSED' } }),

      prisma.meetingActionTracker.count({
        where: district ? { meeting: { district } } : {},
      }),
      prisma.meetingActionTracker.count({
        where: { status: 'PENDING', ...(district ? { meeting: { district } } : {}) },
      }),
      prisma.meetingActionTracker.count({
        where: { status: 'IN_PROGRESS', ...(district ? { meeting: { district } } : {}) },
      }),
      prisma.meetingActionTracker.count({
        where: { status: 'COMPLETED', ...(district ? { meeting: { district } } : {}) },
      }),

      prisma.department.count(),

      prisma.meeting.groupBy({
        by: ['meetingType'],
        where: meetingWhere,
        _count: { id: true },
      }),

      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
      }),

      prisma.meetingActionTracker.findMany({
        take: 5,
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          ...(district ? { meeting: { district } } : {}),
        },
        orderBy: { targetDate: 'asc' },
        include: {
          meeting: { select: { id: true, meetingCode: true, title: true, district: true } },
          assignedDepartment: true,
          assignedUser: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
    ]);

    // Compute monthly meetings for current year
    const currentYear = new Date().getFullYear();
    const meetingsThisYear = await prisma.meeting.findMany({
      where: {
        ...meetingWhere,
        meetingDate: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31T23:59:59`),
        },
      },
      select: { meetingDate: true },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthNames.map((name, index) => {
      const count = meetingsThisYear.filter((m) => new Date(m.meetingDate).getMonth() === index).length;
      return { month: name, count };
    });

    // Department-wise meeting action counts
    const departments = await prisma.department.findMany({
      include: {
        _count: { select: { actionItems: true } },
      },
    });

    const departmentMeetings = departments.map((d) => ({
      department: d.name,
      code: d.code,
      actionCount: d._count.actionItems,
    }));

    return sendSuccess(res, 'Dashboard statistics fetched successfully', {
      cards: {
        totalMeetings,
        pendingMeetings: draftMeetings + submittedMeetings,
        completedMeetings: closedMeetings,
        pendingActionItems: pendingActions + inProgressActions,
        completedActionItems: completedActions,
        departmentCount,
      },
      charts: {
        meetingTypeDistribution: typeDistribution.map((item) => ({
          type: item.meetingType,
          count: item._count.id,
        })),
        monthlyMeetings: monthlyData,
        departmentWiseMeetings: departmentMeetings,
      },
      recentActivities: recentAuditLogs,
      upcomingDeadlines,
    });
  } catch (error) {
    next(error);
  }
};
