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
      whereClause = {
        id,
        submission: {
          employeeId: userId
        }
      };
    }

    const review = await prisma.appraisalReview.findFirst({
      where: whereClause,
      include: {
        submission: {
          include: {
            template: {
              include: {
                goals: {
                  orderBy: { goalOrder: 'asc' }
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
            }
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        goalReviews: {
          include: {
            goal: true
          },
          orderBy: {
            goal: { goalOrder: 'asc' }
          }
        }
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found or access denied' },
        { status: 404 }
      );
    }

    const formattedReview = {
      id: review.id,
      submissionId: review.submissionId,
      templateId: review.submission.templateId,
      template: {
        id: review.submission.template.id,
        title: review.submission.template.title,
        description: review.submission.template.description,
        period: review.submission.template.period,
        goals: review.submission.template.goals.map(goal => ({
          id: goal.id,
          title: goal.title,
          description: goal.description || '',
          category: goal.category,
          weightage: goal.weightage,
        })),
      },
      employeeId: review.submission.employeeId,
      employeeName: review.submission.employeeName,
      employee: review.submission.employee,
      employeeResponses: review.submission.goalResponses.map(response => ({
        goalId: response.goalId,
        response: response.response || '',
      })),
      reviewerId: review.reviewerId,
      reviewerName: review.reviewerName,
      reviewer: review.reviewer,
      overallScore: review.overallScore,
      overallComment: review.overallComment,
      goalReviews: review.goalReviews.map(gr => ({
        goalId: gr.goalId,
        score: gr.score,
        comment: gr.feedback || '',
      })),
      reviewedAt: review.reviewedAt.toISOString(),
      createdAt: review.createdAt.toISOString(),
    };

    return NextResponse.json({ review: formattedReview });

  } catch (error) {
    console.error('Get review error:', error);
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

  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json(
      { error: 'Only administrators and managers can update reviews' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const review = await prisma.appraisalReview.findFirst({
      where: (user.role === 'admin' || user.role === 'manager')
        ? { id }
        : { id, reviewerId: user.id },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found or access denied' },
        { status: 404 }
      );
    }

    const { goalReviews, overallScore, overallComment } = body;

    if (overallScore !== undefined && (overallScore < 0 || overallScore > 100)) {
      return NextResponse.json(
        { error: 'Overall score must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (goalReviews) {
      const invalidScores = goalReviews.filter((gr: any) => 
        gr.score < 0 || gr.score > 100
      );

      if (invalidScores.length > 0) {
        return NextResponse.json(
          { error: 'All goal scores must be between 0 and 100' },
          { status: 400 }
        );
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedReview = await tx.appraisalReview.update({
        where: { id },
        data: {
          ...(overallScore !== undefined && { overallScore }),
          ...(overallComment !== undefined && { overallComment }),
        },
      });

      if (goalReviews) {
        for (const gr of goalReviews) {
          await tx.goalReview.updateMany({
            where: {
              reviewId: id,
              goalId: gr.goalId,
            },
            data: {
              score: gr.score,
              feedback: gr.comment || '',
            },
          });
        }
      }

      return updatedReview;
    });

    return NextResponse.json({
      message: 'Review updated successfully',
      review: {
        id: result.id,
        overallScore: result.overallScore,
        overallComment: result.overallComment,
        updatedAt: result.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}