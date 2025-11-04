import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { updateGroupMeetingSchema, cancelGroupMeetingSchema } from '@/lib/validation'

// GET /api/groups/:id/meetings/:meetingId - Get meeting details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; meetingId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:read')

    const meeting = await prisma.groupMeeting.findUnique({
      where: { id: params.meetingId },
      include: {
        group: true,
        attendance: {
          include: {
            membership: {
              include: {
                person: true,
              },
            },
          },
        },
      },
    })

    if (!meeting || meeting.group.orgId !== user.orgId) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error('Get meeting error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get meeting' },
      { status: 500 }
    )
  }
}

// PATCH /api/groups/:id/meetings/:meetingId - Update meeting
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; meetingId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

    const body = await req.json()

    // Check if it's a cancel request
    if ('isCancelled' in body) {
      const data = cancelGroupMeetingSchema.parse(body)
      const meeting = await prisma.groupMeeting.update({
        where: { id: params.meetingId },
        data: { isCancelled: data.isCancelled },
      })
      return NextResponse.json({ meeting })
    }

    // Regular update
    const data = updateGroupMeetingSchema.parse(body)
    const updateData: any = { ...data }

    if (data.startTime) updateData.startTime = new Date(data.startTime)
    if (data.endTime) updateData.endTime = new Date(data.endTime)

    const meeting = await prisma.groupMeeting.update({
      where: { id: params.meetingId },
      data: updateData,
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'GroupMeeting',
        entityId: meeting.id,
        diff: { updated: data },
      },
    })

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error('Update meeting error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update meeting' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/:id/meetings/:meetingId - Delete meeting
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; meetingId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

    const meeting = await prisma.groupMeeting.findUnique({
      where: { id: params.meetingId },
      include: { group: true },
    })

    if (!meeting || meeting.group.orgId !== user.orgId) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    await prisma.groupMeeting.delete({
      where: { id: params.meetingId },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'deleted',
        entity: 'GroupMeeting',
        entityId: meeting.id,
        diff: { old: meeting },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete meeting error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete meeting' },
      { status: 500 }
    )
  }
}
