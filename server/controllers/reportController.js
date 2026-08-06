import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getComplianceReport } from '../services/reportService.js';

export const getReports = async (req, res, next) => {
  try {
    const { reportType, year, district, quarter } = req.query;

    const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();

    if (reportType === 'MEETING_TYPE') {
      const result = await prisma.meeting.groupBy({
        by: ['meetingType', 'status'],
        where: {
          ...(district ? { district } : {}),
          meetingDate: {
            gte: new Date(`${currentYear}-01-01`),
            lte: new Date(`${currentYear}-12-31T23:59:59`),
          },
        },
        _count: { id: true },
      });
      return sendSuccess(res, 'Meeting Type Report generated', result);
    }

    if (reportType === 'DISTRICT') {
      const result = await prisma.meeting.groupBy({
        by: ['district', 'status'],
        where: {
          meetingDate: {
            gte: new Date(`${currentYear}-01-01`),
            lte: new Date(`${currentYear}-12-31T23:59:59`),
          },
        },
        _count: { id: true },
      });
      return sendSuccess(res, 'District Report generated', result);
    }

    if (reportType === 'MONTHLY') {
      const meetings = await prisma.meeting.findMany({
        where: {
          ...(district ? { district } : {}),
          meetingDate: {
            gte: new Date(`${currentYear}-01-01`),
            lte: new Date(`${currentYear}-12-31T23:59:59`),
          },
        },
        select: { meetingDate: true, status: true, meetingType: true },
      });

      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const report = monthNames.map((monthName, idx) => {
        const monthMeetings = meetings.filter((m) => new Date(m.meetingDate).getMonth() === idx);
        return {
          month: monthName,
          total: monthMeetings.length,
          draft: monthMeetings.filter((m) => m.status === 'DRAFT').length,
          submitted: monthMeetings.filter((m) => m.status === 'SUBMITTED').length,
          closed: monthMeetings.filter((m) => m.status === 'CLOSED').length,
        };
      });

      return sendSuccess(res, 'Monthly Report generated', report);
    }

    if (reportType === 'QUARTERLY') {
      const meetings = await prisma.meeting.findMany({
        where: {
          ...(district ? { district } : {}),
          meetingDate: {
            gte: new Date(`${currentYear}-01-01`),
            lte: new Date(`${currentYear}-12-31T23:59:59`),
          },
        },
        select: { meetingDate: true, status: true },
      });

      const quarters = [
        { quarter: 'Q1 (Jan - Mar)', months: [0, 1, 2] },
        { quarter: 'Q2 (Apr - Jun)', months: [3, 4, 5] },
        { quarter: 'Q3 (Jul - Sep)', months: [6, 7, 8] },
        { quarter: 'Q4 (Oct - Dec)', months: [9, 10, 11] },
      ];

      const report = quarters.map((q) => {
        const qMeetings = meetings.filter((m) => q.months.includes(new Date(m.meetingDate).getMonth()));
        return {
          quarter: q.quarter,
          total: qMeetings.length,
          draft: qMeetings.filter((m) => m.status === 'DRAFT').length,
          submitted: qMeetings.filter((m) => m.status === 'SUBMITTED').length,
          closed: qMeetings.filter((m) => m.status === 'CLOSED').length,
        };
      });

      return sendSuccess(res, 'Quarterly Report generated', report);
    }

    if (reportType === 'COMPLIANCE') {
      const complianceData = await getComplianceReport();
      return sendSuccess(res, 'Compliance Report generated', complianceData);
    }

    return sendError(res, 'Invalid reportType. Options: MEETING_TYPE, DISTRICT, MONTHLY, QUARTERLY, COMPLIANCE.', 400);
  } catch (error) {
    next(error);
  }
};
