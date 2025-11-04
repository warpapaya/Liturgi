import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import argon2 from 'argon2';

const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required for security'),
});

// POST /api/user/2fa/disable - Disable 2FA
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = disable2FASchema.parse(body);

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        orgId: true,
        passwordHash: true,
        twoFactorEnabled: true,
        require2FA: true,
      },
    });

    if (!userWithPassword) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if 2FA is required by role
    if (userWithPassword.require2FA) {
      return NextResponse.json(
        { error: '2FA is required for your role and cannot be disabled' },
        { status: 403 }
      );
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

    // Disable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        twoFactorMethod: null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'User',
        entityId: user.id,
        diff: { action: '2fa_disabled' },
      },
    });

    return NextResponse.json({
      message: '2FA disabled successfully',
      enabled: false,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error disabling 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
