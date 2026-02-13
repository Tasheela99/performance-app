import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,  
  { params }: RouteParams
) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const { id } = await params;
    const userId = authResult.user!.id;
    const userRole = authResult.user!.role;

    const whereClause = (userRole === 'admin' || userRole === 'manager')
      ? { id }
      : {
          id,
          assignments: {
            some: { employeeId: userId }
          }
        };

    const template = await prisma.appraisalTemplate.findFirst({
      where: whereClause,
      include: {
        createdBy: {
          select: { id: true, name: true, role: true }
        },
        goals: {
          orderBy: { goalOrder: 'asc' }
        },
        assignments: {
          include: {
            employee: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        submissions: {
          include: {
            employee: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found or access denied' },
        { status: 404 }
      );
    }

    const formattedTemplate = {
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
        weightage: goal.weightage,
      })),
      status: template.status,
      createdAt: template.createdAt.toISOString(),
      assignments: template.assignments.map(a => ({
        employeeId: a.employeeId,
        employeeName: a.employee.name,
        employeeEmail: a.employee.email,
      })),
      submissions: template.submissions.map(s => ({
        id: s.id,
        employeeId: s.employeeId,
        employeeName: s.employeeName,
        status: s.status,
        submittedAt: s.submittedAt?.toISOString(),
      })),
    };

    return NextResponse.json({ template: formattedTemplate });

  } catch (error) {
    console.error('Get template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const user = authResult.user!;

  try {
    const { id } = await params;
    const body = await request.json();

    const existingTemplate = await prisma.appraisalTemplate.findFirst({
      where: (user.role === 'admin' || user.role === 'manager')
        ? { id }
        : { id, createdById: user.id },
      include: {
        submissions: true
      }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found or access denied' },
        { status: 404 }
      );
    }

    if (existingTemplate.submissions.length > 0 && existingTemplate.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot update template that has submissions and is not in draft status' },
        { status: 400 }
      );
    }

    const { title, description, period, deadline, assignedTo, goals, status } = body;

    if (goals) {
      const totalWeightage = goals.reduce((sum: number, goal: any) => sum + (goal.weightage || 0), 0);
      if (totalWeightage !== 100) {
        return NextResponse.json(
          { error: 'Goal weightages must sum to 100%' },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedTemplate = await tx.appraisalTemplate.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(period && { period }),
          ...(deadline && { deadline: new Date(deadline) }),
          ...(status && { status }),
        },
      });

      if (goals) {
        await tx.goal.deleteMany({
          where: { templateId: id }
        });

        const goalPromises = goals.map((goal: any, index: number) =>
          tx.goal.create({
            data: {
              templateId: id,
              title: goal.title,
              description: goal.description || '',
              category: goal.category,
              weightage: goal.weightage,
              goalOrder: index + 1,
            },
          })
        );
        await Promise.all(goalPromises);
      }

      if (assignedTo !== undefined) {
        const existingAssignments = await tx.templateAssignment.findMany({
          where: { templateId: id },
          select: { employeeId: true }
        });
        const existingEmployeeIds = new Set(existingAssignments.map(a => a.employeeId));

        await tx.templateAssignment.deleteMany({
          where: { templateId: id }
        });

        if (assignedTo.length > 0) {
          const assignmentPromises = assignedTo.map((employeeId: string) =>
            tx.templateAssignment.create({
              data: {
                templateId: id,
                employeeId,
              },
            })
          );
          await Promise.all(assignmentPromises);

          if (updatedTemplate.status === 'published') {
            const newEmployeeIds = assignedTo.filter((empId: string) => !existingEmployeeIds.has(empId));
            
            if (newEmployeeIds.length > 0) {
              const newEmployees = await tx.user.findMany({
                where: { id: { in: newEmployeeIds } },
                select: { id: true, name: true, email: true }
              });

              const submissionPromises = newEmployees.map(employee =>
                tx.appraisalSubmission.create({
                  data: {
                    templateId: id,
                    employeeId: employee.id,
                    employeeName: employee.name,
                    status: 'pending',
                  }
                })
              );
              await Promise.all(submissionPromises);
            }
          }
        }
      }

      return updatedTemplate;
    });

    return NextResponse.json({
      message: 'Template updated successfully',
      template: {
        id: result.id,
        title: result.title,
        description: result.description,
        period: result.period,
        deadline: result.deadline.toISOString(),
        status: result.status,
        updatedAt: result.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const user = authResult.user!;

  try {
    const { id } = await params;

    const template = await prisma.appraisalTemplate.findFirst({
      where: (user.role === 'admin' || user.role === 'manager')
        ? { id }
        : { id, createdById: user.id },
      include: {
        submissions: true
      }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found or access denied' },
        { status: 404 }
      );
    }

    if (template.submissions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete template that has submissions' },
        { status: 400 }
      );
    }

    await prisma.appraisalTemplate.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}