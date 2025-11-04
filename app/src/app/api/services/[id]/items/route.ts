import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { createServiceItemSchema } from '@/lib/validation'

// POST /api/services/:id/items - Create service item
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    // Verify service plan ownership
    const servicePlan = await prisma.servicePlan.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!servicePlan) {
      return NextResponse.json(
        { error: 'Service plan not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const data = createServiceItemSchema.parse({
      ...body,
      servicePlanId: params.id,
    })

    const serviceItem = await prisma.serviceItem.create({
      data,
    })

    return NextResponse.json({ serviceItem }, { status: 201 })
  } catch (error) {
    console.error('Create service item error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create service item' },
      { status: 500 }
    )
  }
}
