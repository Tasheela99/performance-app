import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const user = authResult.user!;

  // Only admin and manager can publish templates
  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json(
      { error: 'Only administrators and managers can publish templates' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    // Check if template exists and user has permission
    const template = await prisma.appraisalTemplate.findFirst({
      where: (user.role === 'admin' || user.role === 'manager')
        ? { id }
        : { id, createdById: user.id },
      include: {
        goals: true,
        assignments: {
          include: {
            employee: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found or access denied' },
        { status: 404 }
      );
    }

    // Validate template is complete before publishing
    if (template.goals.length === 0) {
      return NextResponse.json(
        { error: 'Cannot publish template without goals' },
        { status: 400 }
      );
    }

    if (template.assignments.length === 0) {
      return NextResponse.json(
        { error: 'Cannot publish template without assigned employees' },
        { status: 400 }
      );
    }

    // Check if template is already published
    if (template.status === 'published') {
      return NextResponse.json(
        { error: 'Template is already published' },
        { status: 400 }
      );
    }

    // Publish template and create submissions for assigned employees
    const result = await prisma.$transaction(async (tx) => {
      // Update template status
      const updatedTemplate = await tx.appraisalTemplate.update({
        where: { id },
        data: { status: 'published' }
      });

      // Create submissions for all assigned employees
      const submissionPromises = template.assignments.map(assignment =>
        tx.appraisalSubmission.create({
          data: {
            templateId: id,
            employeeId: assignment.employeeId,
            employeeName: assignment.employee.name,
            status: 'pending',
          }
        })
      );
      
      const submissions = await Promise.all(submissionPromises);

      return { template: updatedTemplate, submissions };
    });

    return NextResponse.json({
      message: 'Template published successfully',
      template: {
        id: result.template.id,
        status: result.template.status,
        updatedAt: result.template.updatedAt.toISOString(),
      },
      submissionsCreated: result.submissions.length,
    });

  } catch (error) {
    console.error('Publish template error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}