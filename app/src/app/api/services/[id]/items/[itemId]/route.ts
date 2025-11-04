import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const updateServiceItemSchema = z.object({
  type: z.enum(['song', 'element', 'note']).optional(),
  title: z.string().min(1).optional(),
  durationSec: z.number().int().min(0).optional(),
  notes: z.string().nullable().optional(),
  position: z.number().int().min(0).optional(),
  key: z.string().nullable().optional(),
  songId: z.string().nullable().optional(),
})

// PATCH /api/services/:id/items/:itemId - Update service item
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    // Verify service item belongs to user's org
    const serviceItem = await prisma.serviceItem.findFirst({
      where: {
        id: params.itemId,
        servicePlanId: params.id,
        servicePlan: {
          ...getOrgFilter(user),
        },
      },
    })

    if (!serviceItem) {
      return NextResponse.json(
        { error: 'Service item not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const data = updateServiceItemSchema.parse(body)

    const updatedItem = await prisma.serviceItem.update({
      where: { id: params.itemId },
      data,
    })

    return NextResponse.json({ serviceItem: updatedItem })
  } catch (error) {
    console.error('Update service item error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update service item' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/:id/items/:itemId - Delete service item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    // Verify service item belongs to user's org
    const serviceItem = await prisma.serviceItem.findFirst({
      where: {
        id: params.itemId,
        servicePlanId: params.id,
        servicePlan: {
          ...getOrgFilter(user),
        },
      },
    })

    if (!serviceItem) {
      return NextResponse.json(
        { error: 'Service item not found' },
        { status: 404 }
      )
    }

    await prisma.serviceItem.delete({
      where: { id: params.itemId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete service item error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete service item' },
      { status: 500 }
    )
  }
}
