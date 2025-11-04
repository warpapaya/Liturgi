import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const listSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['static', 'smart']),
  filters: z.any().optional(),
  personIds: z.array(z.string()).optional(),
  isShared: z.boolean().default(false),
})

// GET /api/lists
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const lists = await prisma.savedList.findMany({
      where: {
        ...getOrgFilter(user),
        OR: [
          { isShared: true },
          { createdBy: user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ lists })
  } catch (error) {
    console.error('Get lists error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get lists' },
      { status: 500 }
    )
  }
}

// POST /api/lists
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const data = listSchema.parse(body)

    const list = await prisma.savedList.create({
      data: {
        ...data,
        orgId: user.orgId,
        createdBy: user.id,
      },
    })

    return NextResponse.json({ list }, { status: 201 })
  } catch (error) {
    console.error('Create list error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create list' },
      { status: 500 }
    )
  }
}
