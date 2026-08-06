import prisma from '../config/db.js';

export const generateMeetingCode = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `MEET-${currentYear}-`;

  // Find latest meeting code starting with prefix
  const latestMeeting = await prisma.meeting.findFirst({
    where: {
      meetingCode: {
        startsWith: prefix,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      meetingCode: true,
    },
  });

  if (!latestMeeting) {
    return `${prefix}0001`;
  }

  const parts = latestMeeting.meetingCode.split('-');
  const sequenceStr = parts[parts.length - 1];
  const nextNum = parseInt(sequenceStr, 10) + 1;
  const paddedNum = nextNum.toString().padStart(4, '0');

  return `${prefix}${paddedNum}`;
};
