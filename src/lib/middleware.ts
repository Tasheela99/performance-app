import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

/**
 * Middleware to authenticate users and check if they have admin role
 * @param request NextRequest object
 * @returns Object with user info if authenticated admin, or error response
 */
export async function requireAdmin(request: NextRequest): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
  error?: NextResponse;
}> {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Authorization header required' },
          { status: 401 }
        )
      };
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Invalid authorization format. Use: Bearer <token>' },
          { status: 401 }
        )
      };
    }

    // Verify JWT token
    const payload = verifyToken(token);
    if (!payload) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      };
    }

    // Get user from database to verify current status
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      };
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        )
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      }
    };

  } catch (error) {
    console.error('Admin authentication error:', error);
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    };
  }
}

/**
 * Middleware to authenticate any user (admin, manager, or employee)
 * @param request NextRequest object
 * @returns Object with user info if authenticated, or error response
 */
export async function requireAuth(request: NextRequest): Promise<{
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
  error?: NextResponse;
}> {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Authorization header required' },
          { status: 401 }
        )
      };
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Invalid authorization format. Use: Bearer <token>' },
          { status: 401 }
        )
      };
    }

    // Verify JWT token
    const payload = verifyToken(token);
    if (!payload) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      };
    }

    // Get user from database to verify current status
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      }
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      )
    };
  }
}