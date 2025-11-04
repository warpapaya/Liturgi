import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'

// POST /api/assignments/conflicts - Check for scheduling conflicts
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:read')

    const body = await req.json()
    const { personId, servicePlanId } = body

    if (!personId || !servicePlanId) {
      return NextResponse.json(
        { error: 'personId and servicePlanId are required' },
        { status: 400 }
      )
    }

    // Get the service plan date
    const servicePlan = await prisma.servicePlan.findFirst({
      where: {
        id: servicePlanId,
        orgId: user.orgId,
      },
    })

    if (!servicePlan) {
      return NextResponse.json({ error: 'Service plan not found' }, { status: 404 })
    }

    const serviceDate = new Date(servicePlan.date)
    const serviceDateOnly = new Date(
      serviceDate.getFullYear(),
      serviceDate.getMonth(),
      serviceDate.getDate()
    )

    // Check for availability conflicts
    const availability = await prisma.personAvailability.findFirst({
      where: {
        personId,
        date: serviceDateOnly,
        available: false,
      },
    })

    // Check for assignment conflicts on the same day
    const conflictingAssignments = await prisma.serviceAssignment.findMany({
      where: {
        personId,
        servicePlan: {
          orgId: user.orgId,
          date: {
            gte: serviceDateOnly,
            lt: new Date(serviceDateOnly.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        servicePlan: {
          select: {
            id: true,
            name: true,
            date: true,
            campus: true,
          },
        },
      },
    })

    const conflicts = []

    if (availability) {
      conflicts.push({
        type: 'unavailable',
        message: 'Person marked unavailable on this date',
        notes: availability.notes,
      })
    }

    if (conflictingAssignments.length > 0) {
      for (const assignment of conflictingAssignments) {
        // Skip if it's the same service plan
        if (assignment.servicePlan.id !== servicePlanId) {
          conflicts.push({
            type: 'assignment',
            message: `Already assigned to ${assignment.servicePlan.name}`,
            servicePlan: assignment.servicePlan,
            role: assignment.role,
          })
        }
      }
    }

    return NextResponse.json({
      hasConflicts: conflicts.length > 0,
      conflicts,
    })
  } catch (error) {
    console.error('Check conflicts error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check conflicts' },
      { status: 500 }
    )
  }
}
