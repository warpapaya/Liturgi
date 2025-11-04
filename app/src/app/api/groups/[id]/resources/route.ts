import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { createGroupResourceSchema } from '@/lib/validation'

// GET /api/groups/:id/resources - List all resources for a group
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:read')

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

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const where: any = { groupId: params.id }
    if (type) where.type = type

    const resources = await prisma.groupResource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ resources })
  } catch (error) {
    console.error('Get resources error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get resources' },
      { status: 500 }
    )
  }
}

// POST /api/groups/:id/resources - Create a resource
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    const data = createGroupResourceSchema.parse({ ...body, groupId: params.id })

    const resource = await prisma.groupResource.create({
      data: {
        groupId: params.id,
        title: data.title,
        description: data.description,
        type: data.type,
        url: data.url,
        fileUrl: data.fileUrl,
        createdBy: user.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'created',
        entity: 'GroupResource',
        entityId: resource.id,
        diff: { new: resource },
      },
    })

    return NextResponse.json({ resource }, { status: 201 })
  } catch (error) {
    console.error('Create resource error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create resource' },
      { status: 500 }
    )
  }
}
