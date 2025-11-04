import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { addGroupMemberSchema } from '@/lib/validation'

// POST /api/groups/:id/members - Add member to group
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
    const data = addGroupMemberSchema.parse(body)

    // Verify person is in same org
    const person = await prisma.person.findFirst({
      where: {
        id: data.personId,
        ...getOrgFilter(user),
      },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    const membership = await prisma.groupMembership.create({
      data: {
        groupId: params.id,
        personId: data.personId,
        role: data.role,
      },
      include: {
        person: true,
      },
    })

    return NextResponse.json({ membership }, { status: 201 })
  } catch (error) {
    console.error('Add group member error:', error)

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'This person is already a member of this group' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add group member' },
      { status: 500 }
    )
  }
}
