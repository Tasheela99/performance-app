import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { NextRequest, NextResponse } from 'next/server';

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

    let whereClause: any = { id };
    
    if (userRole === 'employee') {
      whereClause.employeeId = userId;
      whereClause.template = { status: 'published' };
    }

    const submission = await prisma.appraisalSubmission.findFirst({
      where: whereClause,
      include: {
        template: {
          include: {
            goals: {
              orderBy: { goalOrder: 'asc' }
            },
            createdBy: {
              select: { name: true, role: true }
            }
          }
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true
          }
        },
        goalResponses: {
          include: {
            goal: true
          }
        },
        review: {
          include: {
            reviewer: {
              select: { name: true }
            },
            goalReviews: {
              include: {
                goal: true
              }
            }
          }
        }
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found or access denied' },
        { status: 404 }
      );
    }

    const formattedSubmission = {
      id: submission.id,
      templateId: submission.templateId,
      template: {
        id: submission.template.id,
        title: submission.template.title,
        description: submission.template.description,
        period: submission.template.period,
        deadline: submission.template.deadline.toISOString(),
        status: submission.template.status,
        createdBy: submission.template.createdBy.name,
        createdByRole: submission.template.createdBy.role,
        goals: submission.template.goals.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description || '',
          category: goal.category,
          weightage: goal.weightage,
        })),
      },
      employeeId: submission.employeeId,
      employeeName: submission.employeeName,
      employee: submission.employee,
      responses: submission.goalResponses.map(response => ({
        goalId: response.goalId,
        selfComment: response.response || '',
      })),
      overallComment: '',
      status: submission.status,
      submittedAt: submission.submittedAt?.toISOString(),
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      review: submission.review ? {
        id: submission.review.id,
        overallScore: submission.review.overallScore,
        overallComment: submission.review.overallComment,
        reviewedAt: submission.review.reviewedAt.toISOString(),
        reviewerName: submission.review.reviewer.name,
        goalReviews: submission.review.goalReviews.map(gr => ({
          goalId: gr.goalId,
          score: gr.score,
          comment: gr.feedback || '',
        })),
      } : null,
    };

    return NextResponse.json({ submission: formattedSubmission });

  } catch (error) {
    console.error('Get submission error:', error);
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

    const submission = await prisma.appraisalSubmission.findFirst({
      where: { 
        id, 
        employeeId: user.id,
      },
      include: {
        template: {
          select: { status: true }
        }
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found or access denied' },
        { status: 404 }
      );
    }

    if (submission.template.status !== 'published') {
      return NextResponse.json(
        { error: 'Cannot update submission for unpublished template' },
        { status: 403 }
      );
    }

    if (submission.status === 'submitted' || submission.status === 'reviewed') {
      return NextResponse.json(
        { error: 'Cannot update submitted or reviewed submission' },
        { status: 400 }
      );
    }

    const { responses, overallComment } = body;

    const result = await prisma.$transaction(async (tx) => {
      const updatedSubmission = await tx.appraisalSubmission.update({
        where: { id },
        data: {
          status: submission.status === 'pending' ? 'inProgress' : submission.status,
        },
      });

      if (responses && responses.length > 0) {
        for (const response of responses) {
          await tx.goalResponse.upsert({
            where: {
              submissionId_goalId: {
                submissionId: id,
                goalId: response.goalId,
              },
            },
            update: {
              response: response.selfComment || '',
            },
            create: {
              submissionId: id,
              goalId: response.goalId,
              response: response.selfComment || '',
            },
          });
        }
      }

      return updatedSubmission;
    });

    return NextResponse.json({
      message: 'Submission updated successfully',
      submission: {
        id: result.id,
        status: result.status,
        updatedAt: result.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Update submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}