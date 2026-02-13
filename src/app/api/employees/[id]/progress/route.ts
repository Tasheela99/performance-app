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

  const user = authResult.user!;
  
  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const { id: employeeId } = await params;

    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
        createdAt: true,
      }
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    const submissions = await prisma.appraisalSubmission.findMany({
      where: { employeeId },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            period: true,
            deadline: true,
            status: true,
          }
        },
        review: {
          select: {
            id: true,
            overallScore: true,
            overallComment: true,
            reviewedAt: true,
            reviewer: {
              select: { name: true }
            },
            goalReviews: {
              include: {
                goal: {
                  select: {
                    title: true,
                    category: true,
                    weightage: true,
                  }
                }
              }
            }
          }
        },
        goalResponses: {
          include: {
            goal: {
              select: {
                title: true,
                category: true,
                weightage: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalSubmissions = submissions.length;
    const completedSubmissions = submissions.filter(s => s.status === 'submitted' || s.status === 'reviewed').length;
    const reviewedSubmissions = submissions.filter(s => s.status === 'reviewed').length;
    const pendingSubmissions = submissions.filter(s => s.status === 'pending' || s.status === 'inProgress').length;

    const reviewedWithScores = submissions.filter(s => s.review?.overallScore);
    const averageScore = reviewedWithScores.length > 0
      ? reviewedWithScores.reduce((sum, s) => sum + (s.review?.overallScore || 0), 0) / reviewedWithScores.length
      : 0;

    const scoreTrend = submissions
      .filter(s => s.review?.overallScore && s.review?.reviewedAt)
      .map(s => ({
        period: s.template.period,
        score: s.review!.overallScore,
        reviewedAt: s.review!.reviewedAt,
      }))
      .sort((a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime());

    const categoryScores: { [key: string]: { total: number; count: number } } = {};
    
    submissions.forEach(submission => {
      if (submission.review?.goalReviews) {
        submission.review.goalReviews.forEach(gr => {
          const category = gr.goal.category;
          if (!categoryScores[category]) {
            categoryScores[category] = { total: 0, count: 0 };
          }
          categoryScores[category].total += gr.score;
          categoryScores[category].count += 1;
        });
      }
    });

    const categoryPerformance = Object.entries(categoryScores).map(([category, data]) => ({
      category,
      averageScore: Math.round(data.total / data.count),
      count: data.count,
    }));

    const statusDistribution = {
      pending: submissions.filter(s => s.status === 'pending').length,
      inProgress: submissions.filter(s => s.status === 'inProgress').length,
      submitted: submissions.filter(s => s.status === 'submitted').length,
      reviewed: submissions.filter(s => s.status === 'reviewed').length,
    };

    const recentSubmissions = submissions.slice(0, 5).map(s => ({
      id: s.id,
      templateTitle: s.template.title,
      period: s.template.period,
      status: s.status,
      submittedAt: s.submittedAt?.toISOString(),
      score: s.review?.overallScore,
      reviewedAt: s.review?.reviewedAt?.toISOString(),
      reviewerName: s.review?.reviewer.name,
    }));

    return NextResponse.json({
      employee: {
        ...employee,
        createdAt: employee.createdAt.toISOString(),
      },
      statistics: {
        totalSubmissions,
        completedSubmissions,
        reviewedSubmissions,
        pendingSubmissions,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: totalSubmissions > 0 
          ? Math.round((completedSubmissions / totalSubmissions) * 100) 
          : 0,
      },
      scoreTrend,
      categoryPerformance,
      statusDistribution,
      recentSubmissions,
    });

  } catch (error) {
    console.error('Get employee progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
