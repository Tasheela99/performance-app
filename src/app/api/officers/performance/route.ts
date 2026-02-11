import { RECOGNITION_RULES } from '@/constants/appraisal';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/middleware';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const user = authResult.user!;

  // Only admin and manager can view performance tracking
  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json(
      { error: 'Only administrators and managers can view performance tracking' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const officerId = searchParams.get('officerId');

    let whereClause: any = {};
    if (officerId) {
      whereClause.officerId = officerId;
    }

    const performanceTrackings = await prisma.officerPerformanceTracking.findMany({
      where: whereClause,
      include: {
        officer: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formattedTrackings = performanceTrackings.map(tracking => ({
      id: tracking.id,
      officerId: tracking.officerId,
      officer: tracking.officer,
      consecutiveExcellentYears: tracking.consecutiveExcellentYears,
      totalIncrements: tracking.totalIncrements,
      eligibleForPresidentialAward: tracking.eligibleForPresidentialAward,
      lastExcellentYear: tracking.lastExcellentYear,
      yearsToIncrement: Math.max(0, RECOGNITION_RULES.CONSECUTIVE_EXCELLENT_FOR_INCREMENT - tracking.consecutiveExcellentYears),
      incrementsToPresidentialAward: Math.max(0, RECOGNITION_RULES.INCREMENTS_FOR_PRESIDENTIAL_AWARD - tracking.totalIncrements),
      createdAt: tracking.createdAt.toISOString(),
      updatedAt: tracking.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      performanceTrackings: formattedTrackings,
    });

  } catch (error) {
    console.error('Get performance tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get officers eligible for increments or awards
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const user = authResult.user!;

  // Only admin can manage awards and increments
  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only administrators can manage awards and increments' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { type } = body; // 'increment' or 'presidential_award'

    let eligibleOfficers;

    if (type === 'increment') {
      // Officers with 3 consecutive excellent years
      eligibleOfficers = await prisma.officerPerformanceTracking.findMany({
        where: {
          consecutiveExcellentYears: {
            gte: RECOGNITION_RULES.CONSECUTIVE_EXCELLENT_FOR_INCREMENT
          }
        },
        include: {
          officer: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              position: true,
            }
          }
        }
      });
    } else if (type === 'presidential_award') {
      // Officers eligible for Presidential Awards
      eligibleOfficers = await prisma.officerPerformanceTracking.findMany({
        where: {
          eligibleForPresidentialAward: true
        },
        include: {
          officer: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              position: true,
            }
          }
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use "increment" or "presidential_award"' },
        { status: 400 }
      );
    }

    const formattedOfficers = eligibleOfficers.map(tracking => ({
      id: tracking.id,
      officerId: tracking.officerId,
      officer: tracking.officer,
      consecutiveExcellentYears: tracking.consecutiveExcellentYears,
      totalIncrements: tracking.totalIncrements,
      eligibleForPresidentialAward: tracking.eligibleForPresidentialAward,
      lastExcellentYear: tracking.lastExcellentYear,
    }));

    return NextResponse.json({
      eligibleOfficers: formattedOfficers,
    });

  } catch (error) {
    console.error('Get eligible officers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}