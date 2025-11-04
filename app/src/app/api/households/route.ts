import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const householdSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
})

// GET /api/households
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const households = await prisma.household.findMany({
      where: getOrgFilter(user),
      include: {
        members: {
          orderBy: [{ householdRelation: 'asc' }, { firstName: 'asc' }],
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ households })
  } catch (error) {
    console.error('Get households error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get households' },
      { status: 500 }
    )
  }
}

// POST /api/households
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const data = householdSchema.parse(body)

    const household = await prisma.household.create({
      data: {
        ...data,
        orgId: user.orgId,
      },
    })

    return NextResponse.json({ household }, { status: 201 })
  } catch (error) {
    console.error('Create household error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create household' },
      { status: 500 }
    )
  }
}
