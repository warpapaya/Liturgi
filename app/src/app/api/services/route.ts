import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { createServicePlanSchema } from '@/lib/validation'

// GET /api/services - List service plans
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:read')

    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: any = { ...getOrgFilter(user) }

    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to) where.date.lte = new Date(to)
    }

    const servicePlans = await prisma.servicePlan.findMany({
      where,
      include: {
        _count: {
          select: {
            items: true,
            assignments: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ servicePlans })
  } catch (error) {
    console.error('Get service plans error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get service plans' },
      { status: 500 }
    )
  }
}

// POST /api/services - Create service plan
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    const body = await req.json()
    const data = createServicePlanSchema.parse(body)

    // Check plan limits
    const org = await prisma.organization.findUnique({
      where: { id: user.orgId },
      include: { _count: { select: { servicePlans: true } } },
    })

    if (org) {
      const limits = org.planLimits as any
      if (org._count.servicePlans >= limits.servicePlans) {
        return NextResponse.json(
          { error: `Plan limit reached: maximum ${limits.servicePlans} service plans` },
          { status: 403 }
        )
      }
    }

    const servicePlan = await prisma.servicePlan.create({
      data: {
        ...data,
        orgId: user.orgId,
        date: new Date(data.date),
      },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'created',
        entity: 'ServicePlan',
        entityId: servicePlan.id,
        diff: { new: servicePlan },
      },
    })

    return NextResponse.json({ servicePlan }, { status: 201 })
  } catch (error) {
    console.error('Create service plan error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create service plan' },
      { status: 500 }
    )
  }
}
