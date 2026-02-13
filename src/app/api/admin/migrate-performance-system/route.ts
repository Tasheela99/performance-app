import { requireAuth } from '@/lib/middleware';
import { runPerformanceSystemMigration } from '@/lib/migration';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.success) {
    return authResult.error;
  }

  const user = authResult.user!;

  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Only administrators can run migrations' },
      { status: 403 }
    );
  }

  try {
    await runPerformanceSystemMigration();
    
    return NextResponse.json({
      message: 'Performance system migration completed successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}