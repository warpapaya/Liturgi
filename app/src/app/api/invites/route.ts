import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const createInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'leader', 'member', 'viewer']).default('member'),
})

// GET /api/invites - List all invites
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'users:manage')

    const invites = await prisma.invite.findMany({
      where: {
        ...getOrgFilter(user),
      },
      include: {
        inviter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ invites })
  } catch (error) {
    console.error('Get invites error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get invites' },
      { status: 500 }
    )
  }
}

// POST /api/invites - Create invite
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'users:manage')

    const body = await req.json()
    const data = createInviteSchema.parse(body)

    // Check if user already exists with this email
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email.toLowerCase(),
        ...getOrgFilter(user),
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists in your organization' },
        { status: 400 }
      )
    }

    // Check if there's already a pending invite
    const existingInvite = await prisma.invite.findFirst({
      where: {
        email: data.email.toLowerCase(),
        ...getOrgFilter(user),
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invite has already been sent to this email' },
        { status: 400 }
      )
    }

    // Generate unique invite code
    const code = randomBytes(16).toString('hex')

    // Create invite (expires in 7 days)
    const invite = await prisma.invite.create({
      data: {
        orgId: user.orgId,
        email: data.email.toLowerCase(),
        role: data.role,
        invitedBy: user.id,
        code,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      include: {
        inviter: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        organization: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ invite }, { status: 201 })
  } catch (error) {
    console.error('Create invite error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invite' },
      { status: 500 }
    )
  }
}
