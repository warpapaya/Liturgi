import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generate2FASecret, hashBackupCodes } from '@/lib/2fa';

// POST /api/user/2fa/setup - Initialize 2FA setup
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization info
    const organization = await prisma.organization.findUnique({
      where: { id: user.orgId },
      select: { name: true },
    });

    // Generate 2FA secret and QR code
    const setup = await generate2FASecret(user.email, organization?.name || 'Liturgi');

    // Hash backup codes before storing
    const hashedBackupCodes = hashBackupCodes(setup.backupCodes);

    // Store secret temporarily (not enabled until verified)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: setup.secret,
        twoFactorBackupCodes: hashedBackupCodes,
        twoFactorEnabled: false, // Not enabled yet
      },
    });

    // Return setup info (including plain backup codes for user to save)
    return NextResponse.json({
      secret: setup.secret,
      qrCode: setup.qrCode,
      otpauthUrl: setup.otpauthUrl,
      backupCodes: setup.backupCodes, // Return plain codes for user to save
      message: 'Scan the QR code with your authenticator app, then verify with a code to enable 2FA',
    });
  } catch (error) {
    console.error('Error setting up 2FA:', error);
    return NextResponse.json(
      { error: 'Failed to set up 2FA' },
      { status: 500 }
    );
  }
}
