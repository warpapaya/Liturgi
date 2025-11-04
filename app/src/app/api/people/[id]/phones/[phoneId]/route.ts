import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const phoneSchema = z.object({
  type: z.enum(['mobile', 'home', 'work', 'other']).optional(),
  number: z.string().min(1).optional(),
  isPrimary: z.boolean().optional(),
  doNotCall: z.boolean().optional(),
})

// PATCH /api/people/:id/phones/:phoneId - Update a phone number
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; phoneId: string } }
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
    const data = phoneSchema.parse(body)

    // If this is set as primary, unset other primary phones
    if (data.isPrimary) {
      await prisma.personPhone.updateMany({
        where: { personId: params.id, isPrimary: true, id: { not: params.phoneId } },
        data: { isPrimary: false },
      })
    }

    const phone = await prisma.personPhone.update({
      where: { id: params.phoneId },
      data,
    })

    return NextResponse.json({ phone })
  } catch (error) {
    console.error('Update phone error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update phone' },
      { status: 500 }
    )
  }
}

// DELETE /api/people/:id/phones/:phoneId - Delete a phone number
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; phoneId: string } }
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

    await prisma.personPhone.delete({
      where: { id: params.phoneId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete phone error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete phone' },
      { status: 500 }
    )
  }
}
