import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const attendanceSchema = z.object({
  personId: z.string(),
  servicePlanId: z.string().optional(),
  groupId: z.string().optional(),
  date: z.string(),
  present: z.boolean().default(true),
  notes: z.string().optional(),
})

// GET /api/attendance
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const { searchParams } = new URL(req.url)
    const personId = searchParams.get('personId')
    const servicePlanId = searchParams.get('servicePlanId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { ...getOrgFilter(user) }

    if (personId) where.personId = personId
    if (servicePlanId) where.servicePlanId = servicePlanId
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const attendance = await prisma.attendanceRecord.findMany({
      where,
      include: {
        person: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get attendance' },
      { status: 500 }
    )
  }
}

// POST /api/attendance
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const data = attendanceSchema.parse(body)

    const attendance = await prisma.attendanceRecord.create({
      data: {
        ...data,
        date: new Date(data.date),
        orgId: user.orgId,
      },
      include: {
        person: true,
      },
    })

    return NextResponse.json({ attendance }, { status: 201 })
  } catch (error) {
    console.error('Create attendance error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create attendance' },
      { status: 500 }
    )
  }
}
