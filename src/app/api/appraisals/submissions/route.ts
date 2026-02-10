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
    const templateId = searchParams.get('templateId');
    const employeeId = searchParams.get('employeeId');
    
    const userId = authResult.user!.id;
    const userRole = authResult.user!.role;

    let whereClause: any = {};

    if (userRole === 'admin' || userRole === 'manager') {
      // Admin and Manager can see all submissions
      if (templateId) whereClause.templateId = templateId;
      if (employeeId) whereClause.employeeId = employeeId;
    } else {
      // Employee can only see their own submissions
      whereClause.employeeId = userId;
      if (templateId) whereClause.templateId = templateId;
    }

    const submissions = await prisma.appraisalSubmission.findMany({
      where: whereClause,
      include: {
        template: {
          select: {
            id: true,
            title: true,
            period: true,
            deadline: true,
            status: true
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
            goal: {
              select: {
                id: true,
                title: true,
                category: true,
                weightage: true
              }
            }
          }
        },
        review: {
          select: {
            id: true,
            overallScore: true,
            reviewedAt: true,
            reviewer: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedSubmissions = submissions.map(submission => ({
      id: submission.id,
      templateId: submission.templateId,
      templateTitle: submission.template.title,
      templatePeriod: submission.template.period,
      templateDeadline: submission.template.deadline.toISOString(),
      templateStatus: submission.template.status,
      employeeId: submission.employeeId,
      employeeName: submission.employeeName,
      employee: submission.employee,
      responses: submission.goalResponses.map(response => ({
        goalId: response.goalId,
        selfComment: response.response || '',
      })),
      overallComment: '', // TODO: Add overall comment field to database
      status: submission.status,
      submittedAt: submission.submittedAt?.toISOString(),
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      hasReview: !!submission.review,
      reviewScore: submission.review?.overallScore,
      reviewedAt: submission.review?.reviewedAt?.toISOString(),
      reviewerName: submission.review?.reviewer.name,
    }));

    return NextResponse.json({
      submissions: formattedSubmissions,
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}