import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const tagAssignSchema = z.object({
  tagId: z.string(),
})

// GET /api/people/:id/tags
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const person = await prisma.person.findFirst({
      where: { id: params.id, ...getOrgFilter(user) },
    })

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    const personTags = await prisma.personTag.findMany({
      where: { personId: params.id },
      include: {
        tag: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ tags: personTags })
  } catch (error) {
    console.error('Get person tags error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get tags' },
      { status: 500 }
    )
  }
}

// POST /api/people/:id/tags - Assign a tag to person
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const person = await prisma.person.findFirst({
      where: { id: params.id, ...getOrgFilter(user) },
    })

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    const body = await req.json()
    const { tagId } = tagAssignSchema.parse(body)

    const personTag = await prisma.personTag.create({
      data: {
        personId: params.id,
        tagId,
        addedBy: user.id,
      },
      include: {
        tag: {
          include: {
            category: true,
          },
        },
      },
    })

    return NextResponse.json({ personTag }, { status: 201 })
  } catch (error) {
    console.error('Assign tag error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to assign tag' },
      { status: 500 }
    )
  }
}

// DELETE /api/people/:id/tags/:tagId
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const { searchParams } = new URL(req.url)
    const tagId = searchParams.get('tagId')

    if (!tagId) {
      return NextResponse.json({ error: 'tagId is required' }, { status: 400 })
    }

    await prisma.personTag.deleteMany({
      where: {
        personId: params.id,
        tagId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove tag error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove tag' },
      { status: 500 }
    )
  }
}
