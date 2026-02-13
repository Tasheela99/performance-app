import { getPerformanceClassification, PERFORMANCE_SECTIONS, SECTION_WEIGHTAGES } from '@/constants/appraisal';
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

    if (userRole === 'admin' || userRole === 'manager') {
      if (submissionId) whereClause.submissionId = submissionId;
    } else {
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

    const formattedReviews = reviews.map(review => {
      const classification = getPerformanceClassification(review.overallScore);
      return {
        id: review.id,
        submissionId: review.submissionId,
        templateId: review.submission.templateId,
        employeeId: review.submission.employeeId,
        employeeName: review.submission.employeeName,
        reviewerId: review.reviewerId,
        reviewerName: review.reviewerName,
        taskScore: review.taskScore,
        competencyScore: review.competencyScore,
        overallScore: review.overallScore,
        performanceClassification: {
          key: classification.key,
          label: classification.label,
          color: classification.color,
        },
        overallComment: review.overallComment,
        goalReviews: review.goalReviews.map(gr => ({
          goalId: gr.goalId,
          score: gr.score,
          comment: gr.feedback || '',
        })),
        reviewedAt: review.reviewedAt.toISOString(),
      };
    });

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

  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json(
      { error: 'Only administrators and managers can create reviews' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { submissionId, goalReviews, overallComment } = body;

    if (!submissionId || !goalReviews || goalReviews.length === 0) {
      return NextResponse.json(
        { error: 'Submission ID and goal reviews are required' },
        { status: 400 }
      );
    }

    const submission = await prisma.appraisalSubmission.findFirst({
      where: (user.role === 'admin' || user.role === 'manager')
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

    if (submission.status !== 'submitted') {
      return NextResponse.json(
        { error: 'Can only review submitted appraisals' },
        { status: 400 }
      );
    }

    if (submission.review) {
      return NextResponse.json(
        { error: 'This submission has already been reviewed' },
        { status: 400 }
      );
    }

    const requiredGoalIds = submission.template.goals.map(goal => goal.id);
    const reviewGoalIds = goalReviews.map((gr: any) => gr.goalId);
    const missingGoals = requiredGoalIds.filter(goalId => !reviewGoalIds.includes(goalId));

    if (missingGoals.length > 0) {
      return NextResponse.json(
        { error: 'Please provide reviews for all goals' },
        { status: 400 }
      );
    }

    const invalidScores = goalReviews.filter((gr: any) => 
      gr.score < 0 || gr.score > 100
    );

    if (invalidScores.length > 0) {
      return NextResponse.json(
        { error: 'All goal scores must be between 0 and 100' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const taskGoals = submission.template.goals.filter(goal => goal.section === PERFORMANCE_SECTIONS.TASKS);
      const competencyGoals = submission.template.goals.filter(goal => goal.section === PERFORMANCE_SECTIONS.COMPETENCIES);
      
      let taskScore = 0;
      let competencyScore = 0;
      let totalTaskWeightage = 0;
      let totalCompetencyWeightage = 0;

      taskGoals.forEach(goal => {
        const goalReview = goalReviews.find((gr: any) => gr.goalId === goal.id);
        if (goalReview) {
          taskScore += (goalReview.score * goal.weightage);
          totalTaskWeightage += goal.weightage;
        }
      });
      
      competencyGoals.forEach(goal => {
        const goalReview = goalReviews.find((gr: any) => gr.goalId === goal.id);
        if (goalReview) {
          competencyScore += (goalReview.score * goal.weightage);
          totalCompetencyWeightage += goal.weightage;
        }
      });

      taskScore = totalTaskWeightage > 0 ? taskScore / totalTaskWeightage : 0;
      competencyScore = totalCompetencyWeightage > 0 ? competencyScore / totalCompetencyWeightage : 0;

      const overallScore = Math.round(
        (taskScore * SECTION_WEIGHTAGES.tasks) / 100 +
        (competencyScore * SECTION_WEIGHTAGES.competencies) / 100
      );

      const classification = getPerformanceClassification(overallScore);

      const review = await tx.appraisalReview.create({
        data: {
          submissionId,
          reviewerId: user.id,
          reviewerName: user.name,
          taskScore: Math.round(taskScore),
          competencyScore: Math.round(competencyScore),
          overallScore,
          performanceClassification: classification.key,
          overallComment: overallComment || '',
        },
      });

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

      await tx.appraisalSubmission.update({
        where: { id: submissionId },
        data: { status: 'reviewed' }
      });

      if (classification.key === 'EXCELLENT') {
        await updateOfficerPerformanceTracking(tx, submission.employeeId);
      }

      return review;
    });

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

    const classification = getPerformanceClassification(createdReview!.overallScore);
    const formattedReview = {
      id: createdReview!.id,
      submissionId: createdReview!.submissionId,
      templateId: createdReview!.submission.templateId,
      employeeId: createdReview!.submission.employeeId,
      employeeName: createdReview!.submission.employeeName,
      reviewerId: createdReview!.reviewerId,
      reviewerName: createdReview!.reviewerName,
      taskScore: createdReview!.taskScore,
      competencyScore: createdReview!.competencyScore,
      overallScore: createdReview!.overallScore,
      performanceClassification: {
        key: classification.key,
        label: classification.label,
        color: classification.color,
      },
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

async function updateOfficerPerformanceTracking(tx: any, officerId: string) {
  const currentYear = new Date().getFullYear().toString();
  
  let tracking = await tx.officerPerformanceTracking.findUnique({
    where: { officerId }
  });

  if (!tracking) {
    tracking = await tx.officerPerformanceTracking.create({
      data: {
        officerId,
        consecutiveExcellentYears: 1,
        totalIncrements: 0,
        lastExcellentYear: currentYear,
        eligibleForPresidentialAward: false,
      }
    });
  } else {
    const lastYear = tracking.lastExcellentYear ? parseInt(tracking.lastExcellentYear) : 0;
    const isConsecutive = lastYear === parseInt(currentYear) - 1 || !tracking.lastExcellentYear;
    
    let consecutiveYears = isConsecutive ? tracking.consecutiveExcellentYears + 1 : 1;
    let totalIncrements = tracking.totalIncrements;
    let eligibleForPresidentialAward = tracking.eligibleForPresidentialAward;
    
    if (consecutiveYears === 3) {
      totalIncrements += 1;
      consecutiveYears = 0;
      
      if (totalIncrements >= 3) {
        eligibleForPresidentialAward = true;
      }
    }
    
    tracking = await tx.officerPerformanceTracking.update({
      where: { officerId },
      data: {
        consecutiveExcellentYears: consecutiveYears,
        totalIncrements,
        eligibleForPresidentialAward,
        lastExcellentYear: currentYear,
      }
    });
  }
}