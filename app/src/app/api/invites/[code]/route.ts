import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/invites/:code - Get invite by code (public, for registration)
export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const invite = await prisma.invite.findUnique({
      where: {
        code: params.code,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        inviter: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      )
    }

    // Check if expired
    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invite has expired' },
        { status: 400 }
      )
    }

    // Check if already accepted
    if (invite.acceptedAt) {
      return NextResponse.json(
        { error: 'This invite has already been used' },
        { status: 400 }
      )
    }

    return NextResponse.json({ invite })
  } catch (error) {
    console.error('Get invite error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get invite' },
      { status: 500 }
    )
  }
}
