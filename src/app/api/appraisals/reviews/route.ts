import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');
    
    const userId = authResult.user!.id;
    const userRole = authResult.user!.role;

    let whereClause: any = {};

    if (userRole === 'admin') {
      // Admin can see all reviews
      if (submissionId) whereClause.submissionId = submissionId;
    } else if (userRole === 'manager') {
      // Manager can see reviews they created or for templates they own
      whereClause = {
        OR: [
          { reviewerId: userId },
          {
            submission: {
              template: {
                createdById: userId
              }
            }
          }
        ]
      };
      if (submissionId) whereClause.submissionId = submissionId;
    } else {
      // Employee can see reviews of their submissions
      whereClause = {
        submission: {
          employeeId: userId
        }
      };
      if (submissionId) whereClause.submissionId = submissionId;
    }

    const reviews = await prisma.appraisalReview.findMany({
      where: whereClause,
      include: {
        submission: {
          include: {
            template: {
              select: {
                id: true,
                title: true,
                period: true
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
            goal: {
              select: {
                id: true,
                title: true,
                category: true,
                weightage: true
              }
            }
          },
          orderBy: {
            goal: { goalOrder: 'asc' }
          }
        }
      },
      orderBy: { reviewedAt: 'desc' },
    });

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      submissionId: review.submissionId,
      templateId: review.submission.templateId,
      employeeId: review.submission.employeeId,
      employeeName: review.submission.employeeName,
      reviewerId: review.reviewerId,
      reviewerName: review.reviewerName,
      overallScore: review.overallScore,
      overallComment: review.overallComment,
      goalReviews: review.goalReviews.map(gr => ({
        goalId: gr.goalId,
        score: gr.score,
        comment: gr.feedback || '',
      })),
      reviewedAt: review.reviewedAt.toISOString(),
    }));

    return NextResponse.json({
      reviews: formattedReviews,
    });

  } catch (error) {
    console.error('Get reviews error:', error);
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

  // Only admin and manager can create reviews
  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json(
      { error: 'Only administrators and managers can create reviews' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { submissionId, goalReviews, overallScore, overallComment } = body;

    // Validation
    if (!submissionId || !goalReviews || goalReviews.length === 0 || overallScore === undefined) {
      return NextResponse.json(
        { error: 'Submission ID, goal reviews, and overall score are required' },
        { status: 400 }
      );
    }

    if (overallScore < 0 || overallScore > 100) {
      return NextResponse.json(
        { error: 'Overall score must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Check if submission exists and user has permission to review it
    const submission = await prisma.appraisalSubmission.findFirst({
      where: user.role === 'admin' 
        ? { id: submissionId }
        : {
            id: submissionId,
            template: {
              createdById: user.id
            }
          },
      include: {
        template: {
          include: {
            goals: true
          }
        },
        review: true
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found or access denied' },
        { status: 404 }
      );
    }

    // Check if submission is in reviewable state
    if (submission.status !== 'submitted') {
      return NextResponse.json(
        { error: 'Can only review submitted appraisals' },
        { status: 400 }
      );
    }

    // Check if already reviewed
    if (submission.review) {
      return NextResponse.json(
        { error: 'This submission has already been reviewed' },
        { status: 400 }
      );
    }

    // Validate all goals have reviews
    const requiredGoalIds = submission.template.goals.map(goal => goal.id);
    const reviewGoalIds = goalReviews.map((gr: any) => gr.goalId);
    const missingGoals = requiredGoalIds.filter(goalId => !reviewGoalIds.includes(goalId));

    if (missingGoals.length > 0) {
      return NextResponse.json(
        { error: 'Please provide reviews for all goals' },
        { status: 400 }
      );
    }

    // Validate goal review scores
    const invalidScores = goalReviews.filter((gr: any) => 
      gr.score < 0 || gr.score > 100
    );

    if (invalidScores.length > 0) {
      return NextResponse.json(
        { error: 'All goal scores must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Create review and goal reviews in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create review
      const review = await tx.appraisalReview.create({
        data: {
          submissionId,
          reviewerId: user.id,
          reviewerName: user.name,
          overallScore,
          overallComment: overallComment || '',
        },
      });

      // Create goal reviews
      const goalReviewPromises = goalReviews.map((gr: any) =>
        tx.goalReview.create({
          data: {
            reviewId: review.id,
            goalId: gr.goalId,
            score: gr.score,
            feedback: gr.comment || '',
          },
        })
      );
      await Promise.all(goalReviewPromises);

      // Update submission status to reviewed
      await tx.appraisalSubmission.update({
        where: { id: submissionId },
        data: { status: 'reviewed' }
      });

      return review;
    });

    // Get the created review with all data for response
    const createdReview = await prisma.appraisalReview.findUnique({
      where: { id: result.id },
      include: {
        submission: {
          select: {
            templateId: true,
            employeeId: true,
            employeeName: true
          }
        },
        goalReviews: {
          select: {
            goalId: true,
            score: true,
            feedback: true
          }
        }
      }
    });

    const formattedReview = {
      id: createdReview!.id,
      submissionId: createdReview!.submissionId,
      templateId: createdReview!.submission.templateId,
      employeeId: createdReview!.submission.employeeId,
      employeeName: createdReview!.submission.employeeName,
      reviewerId: createdReview!.reviewerId,
      reviewerName: createdReview!.reviewerName,
      overallScore: createdReview!.overallScore,
      overallComment: createdReview!.overallComment,
      goalReviews: createdReview!.goalReviews.map(gr => ({
        goalId: gr.goalId,
        score: gr.score,
        comment: gr.feedback || '',
      })),
      reviewedAt: createdReview!.reviewedAt.toISOString(),
    };

    return NextResponse.json(
      {
        message: 'Review submitted successfully',
        review: formattedReview,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}