import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { verify2FACode } from '@/lib/2fa';

const verify2FASchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
  method: z.enum(['totp', 'sms', 'email']).optional(),
});

// POST /api/user/2fa/verify - Verify and enable 2FA
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = verify2FASchema.parse(body);

    // Get user with 2FA secret
    const userWith2FA = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        orgId: true,
        twoFactorSecret: true,
        twoFactorEnabled: true,
        twoFactorMethod: true,
      },
    });

    if (!userWith2FA?.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA setup not initiated. Please start setup first.' },
        { status: 400 }
      );
    }

    // Verify the code
    const isValid = verify2FACode(userWith2FA.twoFactorSecret, validatedData.code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorMethod: validatedData.method || 'totp',
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
        diff: { action: '2fa_enabled', method: validatedData.method || 'totp' },
      },
    });

    return NextResponse.json({
      message: '2FA enabled successfully',
      enabled: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error verifying 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
