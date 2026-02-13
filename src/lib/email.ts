import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@performancemanagement.com';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER && SMTP_PASSWORD ? {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  } : undefined,
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    if (!SMTP_USER || !SMTP_PASSWORD) {
      console.log('📧 Email not configured. Would have sent:');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body: ${options.text || 'HTML content'}`);
      return true;
    }

    await transporter.sendMail({
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log(`✅ Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
}

export function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

export function isOTPExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}

export function createOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 15);
  return expiry;
}

export async function sendVerificationEmail(email: string, name: string, otp: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Performance Management System</title>
    </head>
    <body style="font-family: 'Roboto', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🔐 Email Verification Required</h1>
            <p style="margin: 10px 0 0 0;">Performance Management System</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #7c3aed;">Hello ${name}! 👋</h2>
            
            <p>Welcome to the Performance Management System! To complete your account setup and ensure the security of your account, please verify your email address.</p>
            
            <div style="background: #fff; border: 2px dashed #7c3aed; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Your verification code is:</strong></p>
                <div style="font-size: 32px; font-weight: bold; color: #7c3aed; letter-spacing: 4px; margin: 10px 0;">${otp}</div>
                <p style="margin: 0; color: #6b7280; font-size: 14px;"><small>This code will expire in 15 minutes</small></p>
            </div>
            
            <p><strong>To complete your verification:</strong></p>
            <ol style="padding-left: 20px;">
                <li>Return to the registration page</li>
                <li>Enter the 6-digit code above</li>
                <li>Click "Verify Email" to activate your account</li>
            </ol>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 15px; border-radius: 6px; margin: 20px 0;">
                ⚠️ <strong>Security Note:</strong> If you didn't create an account with us, please ignore this email. Your email address will not be added to our system without verification.
            </div>
            
            <p>Questions or need help? Contact our support team.</p>
            
            <p style="margin-top: 30px;">Best regards,<br>
            <strong>Performance Management Team</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Performance Management System. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;

  const text = `
    Email Verification Required - Performance Management System
    
    Hello ${name}!
    
    Welcome to the Performance Management System! To complete your account setup, please verify your email address.
    
    Your verification code: ${otp}
    
    This code will expire in 15 minutes.
    
    To complete verification:
    1. Return to the registration page
    2. Enter the 6-digit code: ${otp}
    3. Click "Verify Email" to activate your account
    
    If you didn't create an account with us, please ignore this email.
    
    Best regards,
    Performance Management Team
    
    © ${new Date().getFullYear()} Performance Management System. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: '🔐 Verify Your Email - Performance Management System',
    html,
    text,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: 'Roboto', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Performance Management System</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #7c3aed;">Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #6b7280; word-break: break-all; font-size: 14px;">${resetUrl}</p>
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Performance Management System. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Password Reset Request
    
    Hi ${userName},
    
    We received a request to reset your password. Click the link below to create a new password:
    
    ${resetUrl}
    
    This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    
    © ${new Date().getFullYear()} Performance Management System. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Performance Management System',
    html,
    text,
  });
}
