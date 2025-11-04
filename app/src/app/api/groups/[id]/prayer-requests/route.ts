import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { createGroupPrayerRequestSchema } from '@/lib/validation'

// GET /api/groups/:id/prayer-requests - List all prayer requests for a group
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
    const isAnswered = searchParams.get('isAnswered')

    const where: any = { groupId: params.id }
    if (isAnswered !== null) {
      where.isAnswered = isAnswered === 'true'
    }

    const prayerRequests = await prisma.groupPrayerRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ prayerRequests })
  } catch (error) {
    console.error('Get prayer requests error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get prayer requests' },
      { status: 500 }
    )
  }
}

// POST /api/groups/:id/prayer-requests - Create a prayer request
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'groups:read')  // Members can create prayer requests

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
    const data = createGroupPrayerRequestSchema.parse({ ...body, groupId: params.id })

    const prayerRequest = await prisma.groupPrayerRequest.create({
      data: {
        groupId: params.id,
        requestedBy: user.id,
        title: data.title,
        content: data.content,
        isPrivate: data.isPrivate,
      },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'created',
        entity: 'GroupPrayerRequest',
        entityId: prayerRequest.id,
        diff: { new: prayerRequest },
      },
    })

    return NextResponse.json({ prayerRequest }, { status: 201 })
  } catch (error) {
    console.error('Create prayer request error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create prayer request' },
      { status: 500 }
    )
  }
}
