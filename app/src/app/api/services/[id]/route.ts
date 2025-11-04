import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { updateServicePlanSchema } from '@/lib/validation'

// GET /api/services/:id - Get service plan by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:read')

    const servicePlan = await prisma.servicePlan.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
        assignments: {
          include: {
            person: true,
          },
        },
      },
    })

    if (!servicePlan) {
      return NextResponse.json(
        { error: 'Service plan not found' },
        { status: 404 }
      )
    }

    // Calculate total duration
    const totalDuration = servicePlan.items.reduce((sum, item) => sum + item.durationSec, 0)

    return NextResponse.json({
      servicePlan: {
        ...servicePlan,
        totalDuration,
      }
    })
  } catch (error) {
    console.error('Get service plan error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get service plan' },
      { status: 500 }
    )
  }
}

// PATCH /api/services/:id - Update service plan
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    const body = await req.json()
    const data = updateServicePlanSchema.parse(body)

    const existingPlan = await prisma.servicePlan.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Service plan not found' },
        { status: 404 }
      )
    }

    const updateData: any = { ...data }
    if (data.date) {
      updateData.date = new Date(data.date)
    }

    const servicePlan = await prisma.servicePlan.update({
      where: { id: params.id },
      data: updateData,
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'ServicePlan',
        entityId: servicePlan.id,
        diff: { old: existingPlan, new: servicePlan },
      },
    })

    return NextResponse.json({ servicePlan })
  } catch (error) {
    console.error('Update service plan error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update service plan' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/:id - Delete service plan
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:delete')

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

    await prisma.servicePlan.delete({
      where: { id: params.id },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'deleted',
        entity: 'ServicePlan',
        entityId: servicePlan.id,
        diff: { old: servicePlan },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete service plan error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete service plan' },
      { status: 500 }
    )
  }
}
