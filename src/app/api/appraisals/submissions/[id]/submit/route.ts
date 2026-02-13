import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { NextRequest, NextResponse } from 'next/server';

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

  try {
    const { id } = await params;

    const submission = await prisma.appraisalSubmission.findFirst({
      where: { 
        id, 
        employeeId: user.id 
      },
      include: {
        template: {
          include: {
            goals: true
          }
        },
        goalResponses: true
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
        { error: 'Cannot submit for unpublished template' },
        { status: 403 }
      );
    }

    if (submission.status === 'submitted' || submission.status === 'reviewed') {
      return NextResponse.json(
        { error: 'Submission has already been submitted' },
        { status: 400 }
      );
    }

    const requiredGoalIds = submission.template.goals.map(goal => goal.id);
    const responseGoalIds = submission.goalResponses.map(response => response.goalId);
    const missingGoals = requiredGoalIds.filter(goalId => !responseGoalIds.includes(goalId));

    if (missingGoals.length > 0) {
      return NextResponse.json(
        { error: 'Please provide responses for all goals before submitting' },
        { status: 400 }
      );
    }

    const emptyResponses = submission.goalResponses.filter(response => 
      !response.response || response.response.trim().length === 0
    );

    if (emptyResponses.length > 0) {
      return NextResponse.json(
        { error: 'Please provide content for all goal responses before submitting' },
        { status: 400 }
      );
    }

    const now = new Date();
    if (submission.template.deadline < now) {
      return NextResponse.json(
        { error: 'Submission deadline has passed' },
        { status: 400 }
      );
    }

    const updatedSubmission = await prisma.appraisalSubmission.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Appraisal submitted successfully',
      submission: {
        id: updatedSubmission.id,
        status: updatedSubmission.status,
        submittedAt: updatedSubmission.submittedAt?.toISOString(),
      },
    });

  } catch (error) {
    console.error('Submit appraisal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}