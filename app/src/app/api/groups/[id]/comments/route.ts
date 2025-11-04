import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { createGroupCommentSchema } from '@/lib/validation'

// POST /api/groups/:id/comments - Add comment to group
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:read') // Anyone who can read can comment

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
    const data = createGroupCommentSchema.parse(body)

    const comment = await prisma.groupComment.create({
      data: {
        groupId: params.id,
        userId: user.id,
        content: data.content,
      },
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Add group comment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add comment' },
      { status: 500 }
    )
  }
}
