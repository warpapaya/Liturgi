import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { createGroupSchema } from '@/lib/validation'

// GET /api/groups - List groups with filtering
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:read')

    // Parse query parameters for filtering
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const visibility = searchParams.get('visibility')
    const campus = searchParams.get('campus')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = getOrgFilter(user)

    if (status) where.status = status
    if (category) where.category = category
    if (visibility) where.visibility = visibility
    if (campus) where.campus = campus
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const groups = await prisma.group.findMany({
      where,
      include: {
        _count: {
          select: {
            members: true,
            meetings: true,
            resources: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('Get groups error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get groups' },
      { status: 500 }
    )
  }
}

// POST /api/groups - Create group
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

    const body = await req.json()
    const data = createGroupSchema.parse(body)

    // Check plan limits
    const org = await prisma.organization.findUnique({
      where: { id: user.orgId },
      include: { _count: { select: { groups: true } } },
    })

    if (org) {
      const limits = org.planLimits as any
      if (org._count.groups >= limits.groups) {
        return NextResponse.json(
          { error: `Plan limit reached: maximum ${limits.groups} groups` },
          { status: 403 }
        )
      }
    }

    const group = await prisma.group.create({
      data: {
        ...data,
        orgId: user.orgId,
      },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'created',
        entity: 'Group',
        entityId: group.id,
        diff: { new: group },
      },
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create group' },
      { status: 500 }
    )
  }
}
