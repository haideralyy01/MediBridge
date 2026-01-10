// Test Prisma database operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to PostgreSQL database');
    return true;
  } catch (error) {
    console.error('❌ Prisma connection error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔄 Testing Prisma connection...\n');
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  console.log('\n📊 Fetching database stats...\n');

  // Count records in each table
  const [
    usersCount,
    doctorsCount,
    healthRecordsCount,
    medicinesCount,
    testRecordsCount,
    analyticsCount,
    auditLogsCount,
    verificationLogsCount,
    doctorVisitsCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.doctor.count(),
    prisma.healthRecord.count(),
    prisma.medicine.count(),
    prisma.testRecord.count(),
    prisma.analytics.count(),
    prisma.auditLog.count(),
    prisma.verificationLog.count(),
    prisma.doctorVisit.count()
  ]);

  console.log('📈 Table Record Counts:');
  console.log('─'.repeat(30));
  console.log(`   Users:            ${usersCount}`);
  console.log(`   Doctors:          ${doctorsCount}`);
  console.log(`   Health Records:   ${healthRecordsCount}`);
  console.log(`   Medicines:        ${medicinesCount}`);
  console.log(`   Test Records:     ${testRecordsCount}`);
  console.log(`   Analytics:        ${analyticsCount}`);
  console.log(`   Audit Logs:       ${auditLogsCount}`);
  console.log(`   Verification Logs: ${verificationLogsCount}`);
  console.log(`   Doctor Visits:    ${doctorVisitsCount}`);
  console.log('─'.repeat(30));

  // Fetch sample user with relations
  console.log('\n👤 Sample User with Relations:');
  const sampleUser = await prisma.user.findFirst({
    include: {
      doctor: true,
      healthRecords: { take: 2 },
      medicines: { take: 2 },
      testRecordsAsUser: { take: 2 }
    }
  });

  if (sampleUser) {
    console.log(`   Email: ${sampleUser.email}`);
    console.log(`   Name: ${sampleUser.name}`);
    console.log(`   Role: ${sampleUser.role}`);
    console.log(`   Is Doctor: ${!!sampleUser.doctor}`);
    console.log(`   Health Records: ${sampleUser.healthRecords.length}`);
    console.log(`   Medicines: ${sampleUser.medicines.length}`);
    console.log(`   Test Records: ${sampleUser.testRecordsAsUser.length}`);
  } else {
    console.log('   No users found in database');
  }

  console.log('\n✅ Prisma test completed successfully!');
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
