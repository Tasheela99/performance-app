import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Default password for all users
  const defaultPassword = 'Admin@123456';
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);

  // 1. Create Admin User
  console.log('📝 Creating admin user...');
  const adminEmail = 'tasheelajay1999@gmail.com';
  
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'admin',
        department: 'Management',
        position: 'System Administrator',
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
        acceptedTerms: true,
        acceptedTermsAt: new Date(),
      },
    });
    console.log(`✅ Created admin: ${admin.email}`);
  } else {
    console.log(`✅ Admin already exists: ${admin.email}`);
  }

  // 2. Create Managers
  console.log('📝 Creating managers...');
  const managersData = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      department: 'Human Resources',
      position: 'HR Manager',
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      department: 'Engineering',
      position: 'Engineering Manager',
    },
    {
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@company.com',
      department: 'Sales',
      position: 'Sales Manager',
    },
  ];

  const managers = [];
  for (const managerData of managersData) {
    let manager = await prisma.user.findUnique({
      where: { email: managerData.email },
    });

    if (!manager) {
      manager = await prisma.user.create({
        data: {
          ...managerData,
          passwordHash: hashedPassword,
          role: 'manager',
          isVerified: true,
          acceptedTerms: true,
          acceptedTermsAt: new Date(),
        },
      });
      console.log(`✅ Created manager: ${manager.email}`);
    } else {
      console.log(`✅ Manager already exists: ${manager.email}`);
    }
    managers.push(manager);
  }

  // 3. Create Employees
  console.log('📝 Creating employees...');
  const employeesData = [
    {
      name: 'John Smith',
      email: 'john.smith@company.com',
      department: 'Engineering',
      position: 'Senior Software Engineer',
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa.anderson@company.com',
      department: 'Engineering',
      position: 'Software Engineer',
    },
    {
      name: 'David Brown',
      email: 'david.brown@company.com',
      department: 'Human Resources',
      position: 'HR Specialist',
    },
    {
      name: 'Jennifer Taylor',
      email: 'jennifer.taylor@company.com',
      department: 'Sales',
      position: 'Sales Representative',
    },
    {
      name: 'Robert Wilson',
      email: 'robert.wilson@company.com',
      department: 'Sales',
      position: 'Senior Sales Representative',
    },
    {
      name: 'Maria Garcia',
      email: 'maria.garcia@company.com',
      department: 'Engineering',
      position: 'Junior Software Engineer',
    },
    {
      name: 'James Martinez',
      email: 'james.martinez@company.com',
      department: 'Human Resources',
      position: 'Recruitment Specialist',
    },
  ];

  const employees = [];
  for (const employeeData of employeesData) {
    let employee = await prisma.user.findUnique({
      where: { email: employeeData.email },
    });

    if (!employee) {
      employee = await prisma.user.create({
        data: {
          ...employeeData,
          passwordHash: hashedPassword,
          role: 'employee',
          isVerified: true,
          acceptedTerms: true,
          acceptedTermsAt: new Date(),
        },
      });
      console.log(`✅ Created employee: ${employee.email}`);
    } else {
      console.log(`✅ Employee already exists: ${employee.email}`);
    }
    employees.push(employee);
  }

  // 4. Create Appraisal Templates
  console.log('📝 Creating appraisal templates...');
  
  // Template 1: Q1 2026 Performance Review
  const existingTemplate1 = await prisma.appraisalTemplate.findFirst({
    where: { title: 'Q1 2026 Performance Review' },
  });

  let template1;
  if (!existingTemplate1) {
    template1 = await prisma.appraisalTemplate.create({
      data: {
        title: 'Q1 2026 Performance Review',
        description: 'First quarter performance evaluation focusing on deliverables and competencies',
        period: 'Q1 2026',
        deadline: new Date('2026-03-31'),
        createdById: admin.id,
        status: 'published',
        goals: {
          create: [
            // Task Goals
            {
              title: 'Project Delivery & Quality',
              description: 'Successfully delivered assigned projects on time with high quality standards',
              category: 'Delivery',
              section: 'tasks',
              weightage: 20,
              goalOrder: 1,
            },
            {
              title: 'Technical Excellence',
              description: 'Demonstrated technical expertise and problem-solving abilities',
              category: 'Technical Skills',
              section: 'tasks',
              weightage: 15,
              goalOrder: 2,
            },
            {
              title: 'Innovation & Improvement',
              description: 'Proposed and implemented process improvements or innovative solutions',
              category: 'Innovation',
              section: 'tasks',
              weightage: 15,
              goalOrder: 3,
            },
            // Competency Goals
            {
              title: 'Communication Skills',
              description: 'Effectively communicated with team members and stakeholders',
              category: 'Communication',
              section: 'competencies',
              weightage: 10,
              goalOrder: 4,
            },
            {
              title: 'Teamwork & Collaboration',
              description: 'Worked collaboratively with team members to achieve common goals',
              category: 'Teamwork',
              section: 'competencies',
              weightage: 15,
              goalOrder: 5,
            },
            {
              title: 'Leadership & Initiative',
              description: 'Demonstrated leadership qualities and took initiative when needed',
              category: 'Leadership',
              section: 'competencies',
              weightage: 15,
              goalOrder: 6,
            },
            {
              title: 'Adaptability & Learning',
              description: 'Adapted to changes and demonstrated continuous learning mindset',
              category: 'Adaptability',
              section: 'competencies',
              weightage: 10,
              goalOrder: 7,
            },
          ],
        },
      },
    });
    console.log(`✅ Created template: ${template1.title}`);
  } else {
    template1 = existingTemplate1;
    console.log(`✅ Template already exists: ${template1.title}`);
  }

  // Template 2: Annual Review 2025
  const existingTemplate2 = await prisma.appraisalTemplate.findFirst({
    where: { title: 'Annual Performance Review 2025' },
  });

  let template2;
  if (!existingTemplate2) {
    template2 = await prisma.appraisalTemplate.create({
      data: {
        title: 'Annual Performance Review 2025',
        description: 'Comprehensive annual performance evaluation for year 2025',
        period: 'Year 2025',
        deadline: new Date('2026-02-28'),
        createdById: managers[0].id,
        status: 'published',
        goals: {
          create: [
            {
              title: 'Annual Goals Achievement',
              description: 'Achievement of annual objectives and KPIs',
              category: 'Goal Achievement',
              section: 'tasks',
              weightage: 25,
              goalOrder: 1,
            },
            {
              title: 'Customer Satisfaction',
              description: 'Contributed to customer satisfaction and retention',
              category: 'Customer Focus',
              section: 'tasks',
              weightage: 20,
              goalOrder: 2,
            },
            {
              title: 'Strategic Thinking',
              description: 'Demonstrated strategic thinking and planning abilities',
              category: 'Strategy',
              section: 'competencies',
              weightage: 15,
              goalOrder: 3,
            },
            {
              title: 'Professional Development',
              description: 'Pursued professional development and skill enhancement',
              category: 'Development',
              section: 'competencies',
              weightage: 20,
              goalOrder: 4,
            },
            {
              title: 'Mentoring & Knowledge Sharing',
              description: 'Mentored junior team members and shared knowledge',
              category: 'Mentorship',
              section: 'competencies',
              weightage: 20,
              goalOrder: 5,
            },
          ],
        },
      },
    });
    console.log(`✅ Created template: ${template2.title}`);
  } else {
    template2 = existingTemplate2;
    console.log(`✅ Template already exists: ${template2.title}`);
  }

  // Template 3: Mid-Year Review 2026
  const existingTemplate3 = await prisma.appraisalTemplate.findFirst({
    where: { title: 'Mid-Year Review 2026' },
  });

  let template3;
  if (!existingTemplate3) {
    template3 = await prisma.appraisalTemplate.create({
      data: {
        title: 'Mid-Year Review 2026',
        description: 'Mid-year check-in and performance assessment',
        period: 'H1 2026',
        deadline: new Date('2026-07-15'),
        createdById: managers[1].id,
        status: 'draft',
        goals: {
          create: [
            {
              title: 'Half-Year Objectives',
              description: 'Progress on first half objectives and deliverables',
              category: 'Objectives',
              section: 'tasks',
              weightage: 30,
              goalOrder: 1,
            },
            {
              title: 'Quality of Work',
              description: 'Maintained high quality standards in all work',
              category: 'Quality',
              section: 'tasks',
              weightage: 20,
              goalOrder: 2,
            },
            {
              title: 'Problem Solving',
              description: 'Effectively solved complex problems and challenges',
              category: 'Problem Solving',
              section: 'competencies',
              weightage: 25,
              goalOrder: 3,
            },
            {
              title: 'Time Management',
              description: 'Managed time effectively and met deadlines',
              category: 'Time Management',
              section: 'competencies',
              weightage: 25,
              goalOrder: 4,
            },
          ],
        },
      },
    });
    console.log(`✅ Created template: ${template3.title}`);
  } else {
    template3 = existingTemplate3;
    console.log(`✅ Template already exists: ${template3.title}`);
  }

  // 5. Assign Templates to Employees
  console.log('📝 Assigning templates to employees...');
  
  // Assign Q1 2026 template to all employees
  for (const employee of employees) {
    const existingAssignment = await prisma.templateAssignment.findUnique({
      where: {
        templateId_employeeId: {
          templateId: template1.id,
          employeeId: employee.id,
        },
      },
    });

    if (!existingAssignment) {
      await prisma.templateAssignment.create({
        data: {
          templateId: template1.id,
          employeeId: employee.id,
        },
      });
      console.log(`✅ Assigned Q1 2026 template to ${employee.name}`);
    }
  }

  // Assign Annual 2025 template to senior employees
  const seniorEmployees = employees.filter(e => 
    e.position && (e.position.includes('Senior') || e.position.includes('Specialist'))
  );
  
  for (const employee of seniorEmployees) {
    const existingAssignment = await prisma.templateAssignment.findUnique({
      where: {
        templateId_employeeId: {
          templateId: template2.id,
          employeeId: employee.id,
        },
      },
    });

    if (!existingAssignment) {
      await prisma.templateAssignment.create({
        data: {
          templateId: template2.id,
          employeeId: employee.id,
        },
      });
      console.log(`✅ Assigned Annual 2025 template to ${employee.name}`);
    }
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Admin users: 1`);
  console.log(`   - Managers: ${managers.length}`);
  console.log(`   - Employees: ${employees.length}`);
  console.log(`   - Appraisal templates: 3`);
  console.log(`\n🔑 Default credentials for all users:`);
  console.log(`   Password: ${defaultPassword}`);
  console.log(`\n👥 Sample logins:`);
  console.log(`   Admin: ${adminEmail}`);
  console.log(`   Manager: ${managers[0].email}`);
  console.log(`   Employee: ${employees[0].email}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });