import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'

// GET /api/users - List all users
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'users:manage')

    const users = await prisma.user.findMany({
      where: {
        ...getOrgFilter(user),
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get users' },
      { status: 500 }
    )
  }
}
