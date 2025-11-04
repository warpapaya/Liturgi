import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  description: z.string().optional(),
})

// GET /api/tags/categories
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const categories = await prisma.tagCategory.findMany({
      where: getOrgFilter(user),
      include: {
        _count: {
          select: { tags: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Get tag categories error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get tag categories' },
      { status: 500 }
    )
  }
}

// POST /api/tags/categories
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const data = categorySchema.parse(body)

    const category = await prisma.tagCategory.create({
      data: {
        ...data,
        orgId: user.orgId,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Create tag category error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create tag category' },
      { status: 500 }
    )
  }
}
