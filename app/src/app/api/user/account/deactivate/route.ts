import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import argon2 from 'argon2';

const deactivateSchema = z.object({
  password: z.string().min(1, 'Password is required for security'),
  reason: z.string().optional(),
});

// POST /api/user/account/deactivate - Deactivate account
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent last admin from deactivating
    if (user.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: {
          orgId: user.orgId,
          role: 'admin',
          accountStatus: 'active',
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot deactivate the last admin account. Transfer admin rights first.' },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const validatedData = deactivateSchema.parse(body);

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

    // Deactivate account
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accountStatus: 'deactivated',
      },
    });

    // Delete all sessions (logout everywhere)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'User',
        entityId: user.id,
        diff: {
          action: 'account_deactivated',
          reason: validatedData.reason,
        },
      },
    });

    return NextResponse.json({
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error deactivating account:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate account' },
      { status: 500 }
    );
  }
}
