import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { updateGroupMemberSchema } from '@/lib/validation'

// PATCH /api/groups/:id/members/:membershipId - Update member
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; membershipId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

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
    const data = updateGroupMemberSchema.parse(body)

    const membership = await prisma.groupMembership.update({
      where: { id: params.membershipId },
      data,
      include: {
        person: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'GroupMembership',
        entityId: membership.id,
        diff: { updated: data },
      },
    })

    return NextResponse.json({ membership })
  } catch (error) {
    console.error('Update group member error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/:id/members/:membershipId - Remove member
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; membershipId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

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

    const membership = await prisma.groupMembership.findUnique({
      where: { id: params.membershipId },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      )
    }

    await prisma.groupMembership.delete({
      where: { id: params.membershipId },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'deleted',
        entity: 'GroupMembership',
        entityId: membership.id,
        diff: { old: membership },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete group member error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove member' },
      { status: 500 }
    )
  }
}
