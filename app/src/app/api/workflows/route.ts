import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const workflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trigger: z.any(),
  steps: z.any(),
  status: z.enum(['active', 'paused', 'completed']).default('active'),
})

// GET /api/workflows
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const workflows = await prisma.workflow.findMany({
      where: getOrgFilter(user),
      include: {
        _count: {
          select: { instances: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ workflows })
  } catch (error) {
    console.error('Get workflows error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get workflows' },
      { status: 500 }
    )
  }
}

// POST /api/workflows
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const data = workflowSchema.parse(body)

    const workflow = await prisma.workflow.create({
      data: {
        ...data,
        orgId: user.orgId,
      },
    })

    return NextResponse.json({ workflow }, { status: 201 })
  } catch (error) {
    console.error('Create workflow error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create workflow' },
      { status: 500 }
    )
  }
}
