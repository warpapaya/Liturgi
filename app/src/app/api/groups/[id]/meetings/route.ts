import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { createGroupMeetingSchema } from '@/lib/validation'

// GET /api/groups/:id/meetings - List all meetings for a group
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:read')

    // Verify group ownership
    const group = await prisma.group.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    const meetings = await prisma.groupMeeting.findMany({
      where: { groupId: params.id },
      include: {
        _count: {
          select: { attendance: true },
        },
      },
      orderBy: { startTime: 'desc' },
    })

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error('Get meetings error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get meetings' },
      { status: 500 }
    )
  }
}

// POST /api/groups/:id/meetings - Create a meeting
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

    // Verify group ownership
    const group = await prisma.group.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const data = createGroupMeetingSchema.parse({ ...body, groupId: params.id })

    const meeting = await prisma.groupMeeting.create({
      data: {
        groupId: params.id,
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        location: data.location,
        isRecurring: data.isRecurring,
        notes: data.notes,
      },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'created',
        entity: 'GroupMeeting',
        entityId: meeting.id,
        diff: { new: meeting },
      },
    })

    return NextResponse.json({ meeting }, { status: 201 })
  } catch (error) {
    console.error('Create meeting error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create meeting' },
      { status: 500 }
    )
  }
}
