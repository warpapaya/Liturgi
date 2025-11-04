import argon2 from 'argon2'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { User, Session } from '@prisma/client'

const SESSION_COOKIE_NAME = 'clearline_session'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface SessionUser {
  id: string
  orgId: string
  email: string
  role: string
  firstName: string | null
  lastName: string | null
}

// Password hashing with Argon2id
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  })
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch {
    return false
  }
}

// Session management
export async function createSession(
  userId: string,
  orgId: string,
  ipFingerprint?: string
): Promise<Session> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  const session = await prisma.session.create({
    data: {
      userId,
      orgId,
      expiresAt,
      ipFingerprint,
    },
  })

  // Set HTTP-only secure cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })

  // Update last login
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })

  return session
}

export async function getSession(): Promise<(Session & { user: User }) | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })

  if (!session) {
    return null
  }

  // Check if expired
  if (session.expiresAt < new Date()) {
    await deleteSession(sessionId)
    return null
  }

  return session
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()

  if (!session) {
    return null
  }

  return {
    id: session.user.id,
    orgId: session.user.orgId,
    email: session.user.email,
    role: session.user.role,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
  }
}

export async function deleteSession(sessionId?: string): Promise<void> {
  const cookieStore = await cookies()
  const sid = sessionId || cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sid) {
    await prisma.session.delete({
      where: { id: sid },
    }).catch(() => {
      // Session might not exist
    })
  }

  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

// Clean up expired sessions (can be called periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}

// Password validation
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' }
  }

  return { valid: true }
}

// Rate limiting helper (simple in-memory for MVP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const attempt = loginAttempts.get(identifier)

  if (!attempt || attempt.resetAt < now) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (attempt.count >= maxAttempts) {
    return false
  }

  attempt.count++
  return true
}

export function resetRateLimit(identifier: string): void {
  loginAttempts.delete(identifier)
}
