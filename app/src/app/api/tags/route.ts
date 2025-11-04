import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const tagSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  color: z.string().optional(),
  description: z.string().optional(),
})

// GET /api/tags - List all tags
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const tags = await prisma.tag.findMany({
      where: getOrgFilter(user),
      include: {
        category: true,
        _count: {
          select: { personTags: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ tags })
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get tags' },
      { status: 500 }
    )
  }
}

// POST /api/tags - Create a new tag
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const data = tagSchema.parse(body)

    const tag = await prisma.tag.create({
      data: {
        ...data,
        orgId: user.orgId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    console.error('Create tag error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create tag' },
      { status: 500 }
    )
  }
}
