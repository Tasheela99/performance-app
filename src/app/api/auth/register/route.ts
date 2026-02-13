import { hashPassword, isStrongPassword, isValidEmail } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createOTPExpiry, generateOTP, sendVerificationEmail } from '@/lib/email';
import { Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, department, position, acceptedTerms } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400, headers: corsHeaders }
      );
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: passwordCheck.message },
        { status: 400, headers: corsHeaders }
      );
    }

    const userRole: Role = role || 'employee';
    if (!['admin', 'manager', 'employee'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, manager, or employee' },
        { status: 400, headers: corsHeaders }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { 
        id: true, 
        name: true, 
        isVerified: true,
        verificationTokenExpiry: true
      },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409, headers: corsHeaders }
        );
      } else {
        const otp = generateOTP();
        const otpExpiry = createOTPExpiry();

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            verificationToken: otp,
            verificationTokenExpiry: otpExpiry,
          },
        });

        try {
          await sendVerificationEmail(email, existingUser.name, otp);
          console.log(`🔐 Verification email sent to ${email} with OTP: ${otp}`);
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
        }

        return NextResponse.json(
          {
            message: 'A verification code has been sent to your email address',
            needsVerification: true,
            email: email.toLowerCase(),
          },
          { status: 200, headers: corsHeaders }
        );
      }
    }

    const passwordHash = await hashPassword(password);

    const otp = generateOTP();
    const otpExpiry = createOTPExpiry();

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: userRole,
        department: department || null,
        position: position || null,
        isVerified: false,
        verificationToken: otp,
        verificationTokenExpiry: otpExpiry,
        acceptedTerms: acceptedTerms || false,
        acceptedTermsAt: acceptedTerms ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
        isVerified: true,
      },
    });

    try {
      await sendVerificationEmail(email, name, otp);
      console.log(`🔐 Verification email sent to ${email} with OTP: ${otp}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    return NextResponse.json(
      {
        message: 'Account created successfully. Please check your email for verification code.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position,
          isVerified: user.isVerified,
        },
        needsVerification: true,
        email: user.email,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? { error: errorMessage, stack: error instanceof Error ? error.stack : undefined }
      : { error: 'Internal server error' };
    
    return NextResponse.json(
      errorDetails,
      { status: 500, headers: corsHeaders }
    );
  }
}
