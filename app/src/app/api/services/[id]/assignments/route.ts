import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { createServiceAssignmentSchema } from '@/lib/validation'

// POST /api/services/:id/assignments - Create service assignment
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
    const data = createServiceAssignmentSchema.parse({
      ...body,
      servicePlanId: params.id,
    })

    // Verify person is in same org
    const person = await prisma.person.findFirst({
      where: {
        id: data.personId,
        ...getOrgFilter(user),
      },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    const assignment = await prisma.serviceAssignment.create({
      data,
      include: {
        person: true,
      },
    })

    return NextResponse.json({ assignment }, { status: 201 })
  } catch (error) {
    console.error('Create service assignment error:', error)

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'This person is already assigned to this role' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create service assignment' },
      { status: 500 }
    )
  }
}
