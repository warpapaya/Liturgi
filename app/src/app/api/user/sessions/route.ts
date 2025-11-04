import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/user/sessions - Get all active sessions
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current session ID
    const currentSession = await getSession(request);

    // Get all active sessions for user
    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        deviceName: true,
        lastAccessedAt: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });

    // Mark current session
    const sessionsWithCurrent = sessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSession?.id,
    }));

    return NextResponse.json({
      sessions: sessionsWithCurrent,
      count: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// DELETE /api/user/sessions - Logout from all devices
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current session to keep it (or delete all including current)
    const currentSession = await getSession(request);
    const { searchParams } = new URL(request.url);
    const keepCurrent = searchParams.get('keepCurrent') === 'true';

    // Delete all sessions except current (if keepCurrent is true)
    const deleteResult = await prisma.session.deleteMany({
      where: {
        userId: user.id,
        ...(keepCurrent && currentSession ? { id: { not: currentSession.id } } : {}),
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
        diff: {
          action: 'force_logout_all_devices',
          sessionsDeleted: deleteResult.count,
          keepCurrent,
        },
      },
    });

    return NextResponse.json({
      message: keepCurrent
        ? 'Logged out from all other devices'
        : 'Logged out from all devices',
      sessionsDeleted: deleteResult.count,
    });
  } catch (error) {
    console.error('Error deleting sessions:', error);
    return NextResponse.json(
      { error: 'Failed to logout from devices' },
      { status: 500 }
    );
  }
}
