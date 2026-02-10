import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const adminEmail = 'admin@performance-management.com';
  const adminPassword = 'Admin@123456'; // Strong default password
  
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${adminEmail}`);
    return;
  }

  // Hash the default admin password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'admin',
      department: 'Management',
      position: 'System Administrator',
    },
  });

  console.log(`✅ Created admin user: ${adminUser.email}`);
  console.log('📝 Default admin credentials:');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log('🚨 Please change the admin password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🌱 Seed completed');
  });