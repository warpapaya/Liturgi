import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePassword, createSession, checkRateLimit } from '@/lib/auth'
import { registerSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(`register:${ip}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(data.password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // Check if this is the first org (bootstrap admin)
    const orgCount = await prisma.organization.count()
    const isFirstOrg = orgCount === 0

    let org

    if (isFirstOrg) {
      // Bootstrap: Create first org and admin
      if (!data.orgName || !data.subdomain) {
        return NextResponse.json(
          { error: 'Organization name and subdomain are required for first registration' },
          { status: 400 }
        )
      }

      // Check subdomain availability
      const existingOrg = await prisma.organization.findUnique({
        where: { subdomain: data.subdomain },
      })

      if (existingOrg) {
        return NextResponse.json(
          { error: 'Subdomain already taken' },
          { status: 400 }
        )
      }

      // Create org with trial plan
      org = await prisma.organization.create({
        data: {
          name: data.orgName,
          subdomain: data.subdomain,
          plan: 'trial',
          planLimits: {
            people: 100,
            groups: 10,
            servicePlans: 10,
          },
          trialEndAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      })

      // Create admin user
      const passwordHash = await hashPassword(data.password)

      const user = await prisma.user.create({
        data: {
          orgId: org.id,
          email: data.email.toLowerCase(),
          passwordHash,
          role: 'admin',
          firstName: data.firstName || null,
          lastName: data.lastName || null,
        },
      })

      // Create session
      await createSession(user.id, org.id, ip)

      return NextResponse.json({
        success: true,
        message: 'Organization and admin user created successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          orgId: org.id,
        },
      })
    } else {
      // Registration with invite code
      if (!data.inviteCode) {
        return NextResponse.json(
          { error: 'Registration requires an invite code' },
          { status: 400 }
        )
      }

      // Verify invite
      const invite = await prisma.invite.findUnique({
        where: { code: data.inviteCode },
        include: { organization: true },
      })

      if (!invite) {
        return NextResponse.json(
          { error: 'Invalid invite code' },
          { status: 400 }
        )
      }

      if (invite.expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'This invite has expired' },
          { status: 400 }
        )
      }

      if (invite.acceptedAt) {
        return NextResponse.json(
          { error: 'This invite has already been used' },
          { status: 400 }
        )
      }

      // Check email matches invite
      if (invite.email.toLowerCase() !== data.email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Email does not match the invited email address' },
          { status: 400 }
        )
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          orgId: invite.orgId,
          email: data.email.toLowerCase(),
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'A user with this email already exists in the organization' },
          { status: 400 }
        )
      }

      // Create user
      const passwordHash = await hashPassword(data.password)

      const user = await prisma.user.create({
        data: {
          orgId: invite.orgId,
          email: data.email.toLowerCase(),
          passwordHash,
          role: invite.role,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
        },
      })

      // Mark invite as accepted
      await prisma.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      })

      // Create session
      await createSession(user.id, invite.orgId, ip)

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          orgId: invite.orgId,
        },
      })
    }
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
