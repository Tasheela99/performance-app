import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const SEED_SECRET = process.env.SEED_SECRET || 'change-this-secret';
    
    if (authHeader !== `Bearer ${SEED_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'Database already seeded', admin: existingAdmin.email },
        { status: 200 }
      );
    }

    const adminPassword = await hashPassword('Admin@123');
    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@performance.com',
        passwordHash: adminPassword,
        role: 'admin',
        department: 'IT',
        position: 'System Admin',
        isVerified: true,
      },
    });

    const managerPassword = await hashPassword('Manager@123');
    const manager = await prisma.user.create({
      data: {
        name: 'John Manager',
        email: 'manager@performance.com',
        passwordHash: managerPassword,
        role: 'manager',
        department: 'HR',
        position: 'HR Manager',
        isVerified: true,
      },
    });

    const employeePassword = await hashPassword('Employee@123');
    const employee = await prisma.user.create({
      data: {
        name: 'Jane Employee',
        email: 'employee@performance.com',
        passwordHash: employeePassword,
        role: 'employee',
        department: 'IT',
        position: 'Software Developer',
        isVerified: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Database seeded successfully',
        users: {
          admin: admin.email,
          manager: manager.email,
          employee: employee.email,
        },
        credentials: {
          admin: 'admin@performance.com / Admin@123',
          manager: 'manager@performance.com / Manager@123',
          employee: 'employee@performance.com / Employee@123',
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
