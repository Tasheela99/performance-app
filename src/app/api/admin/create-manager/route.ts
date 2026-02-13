import { hashPassword, isStrongPassword, isValidEmail } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';
import { Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const body = await request.json();
    const { name, email, password, department, position } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const manager = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'manager' as Role,
        department: department || null,
        position: position || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Manager created successfully',
        manager: {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          role: manager.role,
          department: manager.department,
          position: manager.position,
          createdAt: manager.createdAt,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Manager creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const managers = await prisma.user.findMany({
      where: { role: 'manager' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      message: 'Managers retrieved successfully',
      managers,
      count: managers.length,
    });

  } catch (error) {
    console.error('Get managers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}