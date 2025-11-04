import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const reportSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['demographic', 'growth', 'engagement', 'custom']),
  config: z.any(),
  schedule: z.string().optional(),
  recipients: z.array(z.string()).optional(),
})

// GET /api/reports
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const reports = await prisma.report.findMany({
      where: getOrgFilter(user),
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get reports' },
      { status: 500 }
    )
  }
}

// POST /api/reports
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const body = await req.json()
    const data = reportSchema.parse(body)

    const report = await prisma.report.create({
      data: {
        ...data,
        orgId: user.orgId,
        createdBy: user.id,
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('Create report error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create report' },
      { status: 500 }
    )
  }
}
