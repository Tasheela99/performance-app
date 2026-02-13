import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const user = authResult.user!;

  try {
    let employees;

    if (user.role === 'admin') {
      employees = await prisma.user.findMany({
        where: {
          role: {
            in: ['manager', 'employee']
          }
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
        orderBy: [
          { role: 'asc' },
          { name: 'asc' }
        ],
      });
    } else if (user.role === 'manager') {
      employees = await prisma.user.findMany({
        where: {
          role: 'employee'
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
        orderBy: { name: 'asc' },
      });
    } else {
      return NextResponse.json(
        { error: 'Access denied. Only administrators and managers can view employees for assignment.' },
        { status: 403 }
      );
    }

    const formattedEmployees = employees.map(employee => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department || 'Unassigned',
      position: employee.position || 'Not specified',
      createdAt: employee.createdAt.toISOString(),
    }));

    return NextResponse.json({
      employees: formattedEmployees,
      count: formattedEmployees.length,
    });

  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}