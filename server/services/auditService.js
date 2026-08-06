import prisma from '../config/db.js';

export const recordAuditLog = async ({ userId = null, action, details, ipAddress = null }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};
