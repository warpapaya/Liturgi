import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const reorderSchema = z.object({
  itemId: z.string(),
  newPosition: z.number().int().min(0),
})

// POST /api/services/:id/items/reorder - Reorder service items
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    // Verify service plan ownership
    const servicePlan = await prisma.servicePlan.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
    })

    if (!servicePlan) {
      return NextResponse.json(
        { error: 'Service plan not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { itemId, newPosition } = reorderSchema.parse(body)

    // Find the item being moved
    const itemIndex = servicePlan.items.findIndex((item) => item.id === itemId)
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Service item not found' },
        { status: 404 }
      )
    }

    // Reorder the items array
    const items = [...servicePlan.items]
    const [movedItem] = items.splice(itemIndex, 1)
    items.splice(newPosition, 0, movedItem)

    // Update all positions in a transaction
    await prisma.$transaction(
      items.map((item, index) =>
        prisma.serviceItem.update({
          where: { id: item.id },
          data: { position: index },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder service items error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reorder items' },
      { status: 500 }
    )
  }
}
