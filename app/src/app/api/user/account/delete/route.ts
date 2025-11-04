import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import argon2 from 'argon2';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for security'),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'You must type DELETE to confirm' }),
  }),
});

// POST /api/user/account/delete - Delete account (GDPR compliant)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent last admin from deleting
    if (user.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: {
          orgId: user.orgId,
          role: 'admin',
          accountStatus: { not: 'deleted' },
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin account. Transfer admin rights first.' },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const validatedData = deleteAccountSchema.parse(body);

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!userWithPassword) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password
    const isValidPassword = await argon2.verify(
      userWithPassword.passwordHash,
      validatedData.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 400 }
      );
    }

    // Mark account as deleted with data retention period (GDPR compliant)
    const retentionDays = 90; // Keep data for 90 days for compliance
    const dataRetentionUntil = new Date();
    dataRetentionUntil.setDate(dataRetentionUntil.getDate() + retentionDays);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        accountStatus: 'deleted',
        deletedAt: new Date(),
        dataRetentionUntil,
        // Anonymize personal data
        email: `deleted_${user.id}@deleted.local`,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        photoUrl: null,
        // Clear sensitive data
        passwordHash: '',
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
      },
    });

    // Delete all sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Delete all password reset tokens
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Delete all email verification tokens
    await prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'deleted',
        entity: 'User',
        entityId: user.id,
        diff: {
          action: 'account_deleted',
          dataRetentionUntil: dataRetentionUntil.toISOString(),
        },
      },
    });

    return NextResponse.json({
      message: `Account deleted successfully. Data will be permanently removed after ${retentionDays} days.`,
      dataRetentionUntil,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
