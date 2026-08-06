import cron from 'node-cron';
import prisma from '../config/db.js';
import { sendEmail } from '../config/mail.js';

export const initCronJobs = () => {
  // Schedule task: runs every morning at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running daily check for upcoming action item deadlines...');
    try {
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(now.getDate() + 3);

      const pendingActions = await prisma.meetingActionTracker.findMany({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          targetDate: {
            gte: now,
            lte: threeDaysFromNow,
          },
        },
        include: {
          assignedDepartment: true,
          assignedUser: true,
          meeting: true,
        },
      });

      for (const action of pendingActions) {
        if (action.assignedUser && action.assignedUser.email) {
          await sendEmail({
            to: action.assignedUser.email,
            subject: `[REMINDER] Meeting Action Item Due Soon: ${action.title}`,
            text: `Dear ${action.assignedUser.firstName},\n\nAction item "${action.title}" for meeting "${action.meeting.title}" is due on ${action.targetDate.toLocaleDateString()}.\nStatus: ${action.status}\n\nPlease log into the Meeting Management System to update progress.`,
          });
        }
      }
    } catch (error) {
      console.error('[CRON ERROR]', error);
    }
  });

  console.log('[CRON] Reminders scheduler initialized.');
};
