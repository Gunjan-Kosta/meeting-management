import bcrypt from 'bcryptjs';
import prisma from './config/db.js';

export async function seedDatabase(options = {}) {
  const { isCli = false } = options;
  console.log('[DB SEED] Checking database initialization status...');

  try {
    // 1. If called on startup and database already contains users, skip completely
    const userCount = await prisma.user.count();
    if (!isCli && userCount > 0) {
      console.log(`[DB SEED] Database already initialized (${userCount} user(s) found). Skipping seed to preserve existing data.`);
      return;
    }

    console.log('[DB SEED] Ensuring required default records exist (safe & idempotent)...');

    // 2. Default Departments (find-or-create: never overwrites existing records)
    const deptRoad = await prisma.department.upsert({
      where: { code: 'PWD-ROAD' },
      update: {}, // Never overwrite existing department data
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

    // 3. Default Passwords (only for newly created seed accounts)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Admin@123', salt);

    // 4. State Administrator (idempotent: never overwrites custom user password)
    const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@gov.in' } });
    let admin = existingAdmin;
    if (!existingAdmin) {
      admin = await prisma.user.create({
        data: {
          email: 'admin@gov.in',
          passwordHash,
          firstName: 'State',
          lastName: 'Administrator',
          role: 'STATE_ADMIN',
          district: 'State HQ',
          departmentId: deptRoad.id,
          active: true,
        },
      });
      console.log('[DB SEED] Created default State Admin: admin@gov.in / Admin@123');
    } else {
      console.log('[DB SEED] Existing State Admin found. Preserving credentials and profile.');
    }

    // 5. District User (idempotent: never overwrites custom user password)
    const existingDistrictUser = await prisma.user.findUnique({ where: { email: 'district.user@gov.in' } });
    let districtUser = existingDistrictUser;
    if (!existingDistrictUser) {
      districtUser = await prisma.user.create({
        data: {
          email: 'district.user@gov.in',
          passwordHash,
          firstName: 'District',
          lastName: 'Officer',
          role: 'DISTRICT_USER',
          district: 'Bhopal',
          departmentId: deptTransport.id,
          active: true,
        },
      });
      console.log('[DB SEED] Created default District User: district.user@gov.in / Admin@123');
    } else {
      console.log('[DB SEED] Existing District User found. Preserving credentials and profile.');
    }

    // 6. Viewer (idempotent: never overwrites custom user password)
    const existingViewer = await prisma.user.findUnique({ where: { email: 'viewer@gov.in' } });
    if (!existingViewer) {
      await prisma.user.create({
        data: {
          email: 'viewer@gov.in',
          passwordHash,
          firstName: 'Public',
          lastName: 'Auditor',
          role: 'VIEWER',
          district: 'Bhopal',
          active: true,
        },
      });
      console.log('[DB SEED] Created default Viewer: viewer@gov.in / Admin@123');
    } else {
      console.log('[DB SEED] Existing Viewer found. Preserving credentials and profile.');
    }

    // 7. Sample Initial Meeting (only created if MEET-2026-0001 does not exist)
    const existingMeeting = await prisma.meeting.findUnique({
      where: { meetingCode: 'MEET-2026-0001' },
    });

    if (!existingMeeting && districtUser) {
      const sampleMeeting = await prisma.meeting.create({
        data: {
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
      console.log('[DB SEED] Sample meeting created:', sampleMeeting.meetingCode);
    } else if (existingMeeting) {
      console.log('[DB SEED] Meeting MEET-2026-0001 already exists. Preserving current meeting state.');
    }

    console.log('[DB SEED] Safe seed verification finished successfully.');
  } catch (err) {
    console.error('[DB SEED ERROR] Non-fatal seed error:', err.message);
  }
}

// Auto-run when executed directly via CLI: node seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase({ isCli: true }).finally(async () => {
    await prisma.$disconnect();
  });
}
