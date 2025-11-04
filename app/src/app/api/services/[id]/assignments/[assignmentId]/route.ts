import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const updateAssignmentSchema = z.object({
  status: z.enum(['pending', 'accepted', 'declined']).optional(),
  declineReason: z.string().optional().nullable(),
})

// PATCH /api/services/:id/assignments/:assignmentId - Update assignment
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    // Verify assignment belongs to user's org
    const assignment = await prisma.serviceAssignment.findFirst({
      where: {
        id: params.assignmentId,
        servicePlanId: params.id,
        servicePlan: {
          ...getOrgFilter(user),
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const data = updateAssignmentSchema.parse(body)

    const updatedAssignment = await prisma.serviceAssignment.update({
      where: { id: params.assignmentId },
      data,
      include: {
        person: true,
      },
    })

    return NextResponse.json({ assignment: updatedAssignment })
  } catch (error) {
    console.error('Update assignment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update assignment' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/:id/assignments/:assignmentId - Delete assignment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; assignmentId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    // Verify assignment belongs to user's org
    const assignment = await prisma.serviceAssignment.findFirst({
      where: {
        id: params.assignmentId,
        servicePlanId: params.id,
        servicePlan: {
          ...getOrgFilter(user),
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    await prisma.serviceAssignment.delete({
      where: { id: params.assignmentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete assignment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}
