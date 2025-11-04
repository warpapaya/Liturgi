import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { recordGroupAttendanceSchema, bulkRecordAttendanceSchema } from '@/lib/validation'

// POST /api/groups/:id/meetings/:meetingId/attendance - Record attendance
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; meetingId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

    const body = await req.json()

    // Check if it's bulk attendance recording
    if (Array.isArray(body.attendanceRecords)) {
      const data = bulkRecordAttendanceSchema.parse(body)

      const attendanceRecords = await Promise.all(
        data.attendanceRecords.map(record =>
          prisma.groupAttendance.upsert({
            where: {
              meetingId_membershipId: {
                meetingId: params.meetingId,
                membershipId: record.membershipId,
              },
            },
            create: {
              meetingId: params.meetingId,
              groupId: params.id,
              membershipId: record.membershipId,
              attended: record.attended,
              notes: record.notes,
            },
            update: {
              attended: record.attended,
              notes: record.notes,
            },
          })
        )
      )

      return NextResponse.json({ attendanceRecords }, { status: 201 })
    }

    // Single attendance record
    const data = recordGroupAttendanceSchema.parse(body)

    const attendance = await prisma.groupAttendance.upsert({
      where: {
        meetingId_membershipId: {
          meetingId: params.meetingId,
          membershipId: data.membershipId,
        },
      },
      create: {
        meetingId: params.meetingId,
        groupId: params.id,
        membershipId: data.membershipId,
        attended: data.attended,
        notes: data.notes,
      },
      update: {
        attended: data.attended,
        notes: data.notes,
      },
      include: {
        membership: {
          include: {
            person: true,
          },
        },
      },
    })

    return NextResponse.json({ attendance }, { status: 201 })
  } catch (error) {
    console.error('Record attendance error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record attendance' },
      { status: 500 }
    )
  }
}
