import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { updatePersonSchema } from '@/lib/validation'

// GET /api/people/:id - Get person by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const person = await prisma.person.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
      include: {
        groupMemberships: {
          include: {
            group: true,
          },
        },
        serviceAssignments: {
          include: {
            servicePlan: true,
          },
          where: {
            servicePlan: {
              date: {
                gte: new Date(),
              },
            },
          },
          orderBy: {
            servicePlan: {
              date: 'asc',
            },
          },
        },
      },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ person })
  } catch (error) {
    console.error('Get person error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get person' },
      { status: 500 }
    )
  }
}

// PATCH /api/people/:id - Update person
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const data = updatePersonSchema.parse(body)

    const existingPerson = await prisma.person.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!existingPerson) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    const person = await prisma.person.update({
      where: { id: params.id },
      data,
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'Person',
        entityId: person.id,
        diff: { old: existingPerson, new: person },
      },
    })

    return NextResponse.json({ person })
  } catch (error) {
    console.error('Update person error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update person' },
      { status: 500 }
    )
  }
}

// DELETE /api/people/:id - Delete person
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:delete')

    const person = await prisma.person.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!person) {
      return NextResponse.json(
        { error: 'Person not found' },
        { status: 404 }
      )
    }

    await prisma.person.delete({
      where: { id: params.id },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'deleted',
        entity: 'Person',
        entityId: person.id,
        diff: { old: person },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete person error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete person' },
      { status: 500 }
    )
  }
}
