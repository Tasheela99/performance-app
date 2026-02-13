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
      if (templateId) whereClause.templateId = templateId;
      if (employeeId) whereClause.employeeId = employeeId;
    } else {
      whereClause.employeeId = userId;
      whereClause.template = { status: 'published' };
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
      overallComment: '',
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

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const user = authResult.user!;

  try {
    const body = await request.json();
    const { templateId, employeeId, employeeName, responses, overallComment, status } = body;

    if (!templateId || !employeeId || !employeeName) {
      return NextResponse.json(
        { error: 'Missing required fields: templateId, employeeId, employeeName' },
        { status: 400 }
      );
    }

    const template = await prisma.appraisalTemplate.findUnique({
      where: { id: templateId },
      include: { goals: true }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (template.status !== 'published') {
      return NextResponse.json(
        { error: 'Cannot create submission for unpublished template' },
        { status: 400 }
      );
    }

    if (user.role === 'employee' && employeeId !== user.id) {
      return NextResponse.json(
        { error: 'Cannot create submission for another employee' },
        { status: 403 }
      );
    }

    const existingSubmission = await prisma.appraisalSubmission.findFirst({
      where: {
        templateId,
        employeeId
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Submission already exists for this template and employee' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const submission = await tx.appraisalSubmission.create({
        data: {
          templateId,
          employeeId,
          employeeName,
          status: status || 'pending',
        }
      });

      if (responses && responses.length > 0) {
        const responsePromises = responses.map((response: any) =>
          tx.goalResponse.create({
            data: {
              submissionId: submission.id,
              goalId: response.goalId,
              response: response.selfComment || '',
            }
          })
        );
        await Promise.all(responsePromises);
      }

      return submission;
    });

    return NextResponse.json({
      message: 'Submission created successfully',
      submission: {
        id: result.id,
        templateId: result.templateId,
        employeeId: result.employeeId,
        employeeName: result.employeeName,
        status: result.status,
        createdAt: result.createdAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Create submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}