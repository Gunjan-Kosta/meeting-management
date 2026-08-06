import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';
import prisma from './config/db.js';

export async function seedDatabase() {
  console.log('Ensuring database schema and seeding initial data...');

  try {
    // 1. Ensure SQLite database tables exist on disk
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    } catch (dbErr) {
      console.warn('Prisma db push warning:', dbErr.message);
    }

    // 2. Create Departments
    const deptRoad = await prisma.department.upsert({
      where: { code: 'PWD-ROAD' },
      update: {},
      create: {
        name: 'Public Works Department (Roads)',
        code: 'PWD-ROAD',
        description: 'Infrastructure and road construction department',
      },
    });

    const deptTransport = await prisma.department.upsert({
      where: { code: 'TRANS-DEPT' },
      update: {},
      create: {
        name: 'Transport Department',
        code: 'TRANS-DEPT',
        description: 'Traffic regulations, public transit and safety',
      },
    });

    const deptPolice = await prisma.department.upsert({
      where: { code: 'POLICE-TRAFFIC' },
      update: {},
      create: {
        name: 'Traffic Police Department',
        code: 'POLICE-TRAFFIC',
        description: 'Enforcement and traffic law management',
      },
    });

    // Default Passwords
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@123', salt);

    // 1. State Administrator
    const admin = await prisma.user.upsert({
      where: { email: 'admin@gov.in' },
      update: {
        passwordHash,
        active: true,
      },
      create: {
        email: 'admin@gov.in',
        passwordHash,
        firstName: 'State',
        lastName: 'Administrator',
        role: 'STATE_ADMIN',
        district: 'State HQ',
        departmentId: deptRoad.id,
      },
    });

    // 2. District User
    const districtUser = await prisma.user.upsert({
      where: { email: 'district.user@gov.in' },
      update: {
        passwordHash,
        active: true,
      },
      create: {
        email: 'district.user@gov.in',
        passwordHash,
        firstName: 'District',
        lastName: 'Officer',
        role: 'DISTRICT_USER',
        district: 'Bhopal',
        departmentId: deptTransport.id,
      },
    });

    // 3. Viewer
    const viewer = await prisma.user.upsert({
      where: { email: 'viewer@gov.in' },
      update: {
        passwordHash,
        active: true,
      },
      create: {
        email: 'viewer@gov.in',
        passwordHash,
        firstName: 'Public',
        lastName: 'Auditor',
        role: 'VIEWER',
        district: 'Bhopal',
      },
    });

    console.log('Default Accounts Ready:');
    console.log('- State Admin: admin@gov.in / Admin@123');
    console.log('- District User: district.user@gov.in / Admin@123');
    console.log('- Viewer: viewer@gov.in / Admin@123');

    // Create Sample Meeting
    const sampleMeeting = await prisma.meeting.upsert({
      where: { meetingCode: 'MEET-2026-0001' },
      update: {},
      create: {
        meetingCode: 'MEET-2026-0001',
        title: 'State Road Safety Council Review Meeting',
        description: 'Quarterly review of accident-prone blackspots and traffic signals upgrade.',
        meetingType: 'RAJYA_SADAK_SURAKSHA',
        meetingDate: new Date('2026-08-15T10:00:00Z'),
        venue: 'State Secretariat Conference Hall A',
        district: 'Bhopal',
        status: 'SUBMITTED',
        creatorId: districtUser.id,
        participants: {
          create: [
            { name: 'Dr. Rajesh Sharma', designation: 'Chief Engineer', department: 'PWD', email: 'rajesh@gov.in' },
            { name: 'Vikram Singh', designation: 'DCP Traffic', department: 'Police', email: 'vikram@gov.in' },
          ],
        },
        actionItems: {
          create: [
            {
              title: 'Identify top 10 accident blackspots in Bhopal district',
              description: 'Inspect state highway stretches and submit safety barrier proposal.',
              assignedDepartmentId: deptRoad.id,
              targetDate: new Date('2026-08-30T17:00:00Z'),
              status: 'IN_PROGRESS',
              remarks: 'Survey 60% complete.',
            },
            {
              title: 'Deploy speed radars near high school zones',
              description: 'Procure and install automatic speed monitoring cameras.',
              assignedDepartmentId: deptPolice.id,
              targetDate: new Date('2026-09-10T17:00:00Z'),
              status: 'PENDING',
            },
          ],
        },
      },
    });

    console.log('Sample Meeting Ready:', sampleMeeting.meetingCode);
  } catch (err) {
    console.error('Database seeding error:', err.message);
  }
}

// Auto-run if executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().finally(async () => {
    await prisma.$disconnect();
  });
}
