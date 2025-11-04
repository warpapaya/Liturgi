import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { createPersonSchema } from '@/lib/validation'

// GET /api/people - List people with filters
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const tag = searchParams.get('tag')

    const where: any = { ...getOrgFilter(user) }

    if (status) {
      where.status = status
    }

    if (tag) {
      where.tags = {
        path: '$',
        array_contains: [tag],
      }
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const people = await prisma.person.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })

    return NextResponse.json({ people })
  } catch (error) {
    console.error('Get people error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get people' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

// POST /api/people - Create person
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const data = createPersonSchema.parse(body)

    // Check plan limits
    const org = await prisma.organization.findUnique({
      where: { id: user.orgId },
      include: { _count: { select: { people: true } } },
    })

    if (org) {
      const limits = org.planLimits as any
      if (org._count.people >= limits.people) {
        return NextResponse.json(
          { error: `Plan limit reached: maximum ${limits.people} people` },
          { status: 403 }
        )
      }
    }

    const person = await prisma.person.create({
      data: {
        ...data,
        orgId: user.orgId,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'created',
        entity: 'Person',
        entityId: person.id,
        diff: { new: person },
      },
    })

    return NextResponse.json({ person }, { status: 201 })
  } catch (error) {
    console.error('Create person error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create person' },
      { status: 500 }
    )
  }
}
