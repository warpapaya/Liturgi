import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

// POST /api/auth/verify-email/send - Send email verification
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 86400000); // 24 hours

    // Delete any existing verification tokens for this user
    await prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    // Create new verification token
    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Get organization info
    const organization = await prisma.organization.findUnique({
      where: { id: user.orgId },
      select: { name: true },
    });

    // Send verification email
    const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    await sendEmail(
      {
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `
          <h2>Email Verification</h2>
          <p>Hi ${user.firstName || 'there'},</p>
          <p>Please verify your email address for your ${organization?.name || 'Liturgi'} account.</p>
          <p>Click the link below to verify your email:</p>
          <p><a href="${verifyLink}">${verifyLink}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create this account, please ignore this email.</p>
        `,
        text: `
          Email Verification

          Hi ${user.firstName || 'there'},

          Please verify your email address for your ${organization?.name || 'Liturgi'} account.

          Click the link below to verify your email:
          ${verifyLink}

          This link will expire in 24 hours.

          If you didn't create this account, please ignore this email.
        `,
      },
      user.orgId
    );

    return NextResponse.json({
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
