import prisma from '../config/db.js';

export const getMeetingTypeReport = async (filters = {}) => {
  const where = {};
  if (filters.district) where.district = filters.district;
  if (filters.year) {
    const startYear = new Date(`${filters.year}-01-01`);
    const endYear = new Date(`${filters.year}-12-31T23:59:59`);
    where.meetingDate = { gte: startYear, lte: endYear };
  }

  const result = await prisma.meeting.groupBy({
    by: ['meetingType', 'status'],
    where,
    _count: { id: true },
  });

  return result;
};

export const getDistrictReport = async (filters = {}) => {
  const result = await prisma.meeting.groupBy({
    by: ['district', 'status'],
    _count: { id: true },
  });
  return result;
};

export const getComplianceReport = async () => {
  const departments = await prisma.department.findMany({
    include: {
      actionItems: true,
    },
  });

  return departments.map((dept) => {
    const total = dept.actionItems.length;
    const completed = dept.actionItems.filter((a) => a.status === 'COMPLETED').length;
    const inProgress = dept.actionItems.filter((a) => a.status === 'IN_PROGRESS').length;
    const pending = dept.actionItems.filter((a) => a.status === 'PENDING').length;
    const complianceRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '100.0';

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      departmentCode: dept.code,
      totalActions: total,
      completedActions: completed,
      inProgressActions: inProgress,
      pendingActions: pending,
      complianceRatePercentage: Number(complianceRate),
    };
  });
};
