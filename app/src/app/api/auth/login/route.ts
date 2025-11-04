import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession, checkRateLimit, resetRateLimit } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = loginSchema.parse(body)

    const email = data.email.toLowerCase()
    const ip = req.headers.get('x-forwarded-for') || 'unknown'

    // Rate limiting
    if (!checkRateLimit(`login:${ip}:${email}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email },
      include: { organization: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const validPassword = await verifyPassword(user.passwordHash, data.password)

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Reset rate limit on successful login
    resetRateLimit(`login:${ip}:${email}`)

    // Create session
    await createSession(user.id, user.orgId, ip)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        orgId: user.orgId,
        orgName: user.organization.name,
      },
    })
  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
