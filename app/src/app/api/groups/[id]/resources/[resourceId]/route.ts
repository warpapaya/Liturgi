import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'
import { updateGroupResourceSchema } from '@/lib/validation'

// PATCH /api/groups/:id/resources/:resourceId - Update resource
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; resourceId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

    const body = await req.json()
    const data = updateGroupResourceSchema.parse(body)

    const resource = await prisma.groupResource.update({
      where: { id: params.resourceId },
      data,
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'GroupResource',
        entityId: resource.id,
        diff: { updated: data },
      },
    })

    return NextResponse.json({ resource })
  } catch (error) {
    console.error('Update resource error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update resource' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/:id/resources/:resourceId - Delete resource
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; resourceId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:write')

    const resource = await prisma.groupResource.findUnique({
      where: { id: params.resourceId },
    })

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }

    await prisma.groupResource.delete({
      where: { id: params.resourceId },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'deleted',
        entity: 'GroupResource',
        entityId: resource.id,
        diff: { old: resource },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete resource error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete resource' },
      { status: 500 }
    )
  }
}
