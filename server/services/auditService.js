import prisma from '../config/db.js';

export const recordAuditLog = async ({ userId = null, action, details, ipAddress = null, meetingId = null }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        meetingId,
        action,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};
