import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = authResult.user!.id;
    const userRole = authResult.user!.role;

    let templates;

    if (userRole === 'admin' || userRole === 'manager') {
      templates = await prisma.appraisalTemplate.findMany({
        include: {
          createdBy: {
            select: { id: true, name: true, role: true }
          },
          goals: true,
          assignments: {
            include: {
              employee: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          _count: {
            select: { submissions: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      templates = await prisma.appraisalTemplate.findMany({
        where: {
          AND: [
            {
              assignments: {
                some: { employeeId: userId }
              }
            },
            {
              status: 'published'
            }
          ]
        },
        include: {
          createdBy: {
            select: { id: true, name: true, role: true }
          },
          goals: true,
          assignments: {
            include: {
              employee: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          _count: {
            select: { submissions: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const formattedTemplates = templates.map(template => ({
      id: template.id,
      title: template.title,
      description: template.description,
      period: template.period,
      deadline: template.deadline.toISOString(),
      createdBy: template.createdBy.id,
      createdByName: template.createdBy.name,
      createdByRole: template.createdBy.role,
      assignedTo: template.assignments.map(a => a.employeeId),
      goals: template.goals.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description || '',
        category: goal.category,
        section: goal.section,
        weightage: goal.weightage,
      })),
      status: template.status,
      createdAt: template.createdAt.toISOString(),
      submissionCount: template._count.submissions,
      assignments: template.assignments.map(a => ({
        employeeId: a.employeeId,
        employeeName: a.employee.name,
        employeeEmail: a.employee.email,
      })),
    }));

    return NextResponse.json({
      templates: formattedTemplates,
    });

  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const user = authResult.user!;

  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json(
      { error: 'Only administrators and managers can create templates' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { title, description, period, deadline, assignedTo, goals } = body;

    if (!title || !period || !deadline || !goals || goals.length === 0) {
      return NextResponse.json(
        { error: 'Title, period, deadline, and at least one goal are required' },
        { status: 400 }
      );
    }

    const totalWeightage = goals.reduce((sum: number, goal: any) => sum + (goal.weightage || 0), 0);
    if (totalWeightage !== 100) {
      return NextResponse.json(
        { error: 'Goal weightages must sum to 100%' },
        { status: 400 }
      );
    }

    const taskGoals = goals.filter((goal: any) => goal.section === 'tasks');
    const competencyGoals = goals.filter((goal: any) => goal.section === 'competencies');
    
    if (taskGoals.length === 0 && competencyGoals.length === 0) {
      return NextResponse.json(
        { error: 'At least one goal must be assigned to either tasks or competencies section' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const template = await tx.appraisalTemplate.create({
        data: {
          title,
          description: description || '',
          period,
          deadline: new Date(deadline),
          createdById: user.id,
          status: 'draft',
        },
      });

      const goalPromises = goals.map((goal: any, index: number) =>
        tx.goal.create({
          data: {
            templateId: template.id,
            title: goal.title,
            description: goal.description || '',
            category: goal.category,
            section: goal.section || 'tasks',
            weightage: goal.weightage,
            goalOrder: index + 1,
          },
        })
      );
      const createdGoals = await Promise.all(goalPromises);

      if (assignedTo && assignedTo.length > 0) {
        const assignmentPromises = assignedTo.map((employeeId: string) =>
          tx.templateAssignment.create({
            data: {
              templateId: template.id,
              employeeId,
            },
          })
        );
        await Promise.all(assignmentPromises);
      }

      return { template, goals: createdGoals };
    });

    return NextResponse.json(
      {
        message: 'Template created successfully',
        template: {
          id: result.template.id,
          title: result.template.title,
          description: result.template.description,
          period: result.template.period,
          deadline: result.template.deadline.toISOString(),
          createdBy: user.id,
          createdByName: user.name,
          createdByRole: user.role,
          assignedTo: assignedTo || [],
          goals: result.goals.map(goal => ({
            id: goal.id,
            title: goal.title,
            description: goal.description || '',
            category: goal.category,
            weightage: goal.weightage,
          })),
          status: result.template.status,
          createdAt: result.template.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}