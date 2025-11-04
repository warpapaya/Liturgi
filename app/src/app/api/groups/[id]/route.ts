import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { updateGroupSchema } from '@/lib/validation'

// GET /api/groups/:id - Get group by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:read')

    const group = await prisma.group.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
      include: {
        members: {
          include: {
            person: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Get group error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get group' },
      { status: 500 }
    )
  }
}

// PATCH /api/groups/:id - Update group
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

    const body = await req.json()
    const data = updateGroupSchema.parse(body)

    const existingGroup = await prisma.group.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!existingGroup) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    const group = await prisma.group.update({
      where: { id: params.id },
      data,
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'Group',
        entityId: group.id,
        diff: { old: existingGroup, new: group },
      },
    })

    return NextResponse.json({ group })
  } catch (error) {
    console.error('Update group error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update group' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/:id - Delete group
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:delete')

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

    await prisma.group.delete({
      where: { id: params.id },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'deleted',
        entity: 'Group',
        entityId: group.id,
        diff: { old: group },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete group error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete group' },
      { status: 500 }
    )
  }
}
