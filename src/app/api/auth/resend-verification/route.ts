import { prisma } from '@/lib/db';
import { createOTPExpiry, generateOTP, sendVerificationEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const otpExpiry = createOTPExpiry();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: otp,
        verificationTokenExpiry: otpExpiry,
      },
    });

    try {
      await sendVerificationEmail(user.email, user.name, otp);
      console.log(`🔐 Verification email resent to ${user.email} with OTP: ${otp}`);
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Verification code resent successfully. Please check your email.',
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}