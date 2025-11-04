import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'
import { updateGroupPrayerRequestSchema } from '@/lib/validation'

// PATCH /api/groups/:id/prayer-requests/:requestId - Update prayer request
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; requestId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

    const body = await req.json()
    const data = updateGroupPrayerRequestSchema.parse(body)

    const updateData: any = { ...data }
    if (data.isAnswered === true && !updateData.answeredAt) {
      updateData.answeredAt = new Date()
    }

    const prayerRequest = await prisma.groupPrayerRequest.update({
      where: { id: params.requestId },
      data: updateData,
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'GroupPrayerRequest',
        entityId: prayerRequest.id,
        diff: { updated: data },
      },
    })

    return NextResponse.json({ prayerRequest })
  } catch (error) {
    console.error('Update prayer request error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update prayer request' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/:id/prayer-requests/:requestId - Delete prayer request
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; requestId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

    const prayerRequest = await prisma.groupPrayerRequest.findUnique({
      where: { id: params.requestId },
    })

    if (!prayerRequest) {
      return NextResponse.json(
        { error: 'Prayer request not found' },
        { status: 404 }
      )
    }

    // Only the creator or leaders can delete
    if (prayerRequest.requestedBy !== user.id && !['admin', 'leader'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.groupPrayerRequest.delete({
      where: { id: params.requestId },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'deleted',
        entity: 'GroupPrayerRequest',
        entityId: prayerRequest.id,
        diff: { old: prayerRequest },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete prayer request error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete prayer request' },
      { status: 500 }
    )
  }
}
