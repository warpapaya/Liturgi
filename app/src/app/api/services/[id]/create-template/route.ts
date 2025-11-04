import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const createTemplateFromServiceSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional().nullable(),
})

// POST /api/services/:id/create-template - Create template from service
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    // Find the service plan
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
    const data = createTemplateFromServiceSchema.parse(body)

    // Convert service items to template format
    const templateItems = servicePlan.items.map((item) => ({
      type: item.type,
      title: item.title,
      durationSec: item.durationSec,
      notes: item.notes || undefined,
    }))

    // Create the template
    const template = await prisma.serviceTemplate.create({
      data: {
        orgId: user.orgId,
        name: data.name,
        description: data.description,
        template: templateItems,
        isDefault: false,
      },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'created',
        entity: 'ServiceTemplate',
        entityId: template.id,
        diff: { new: template, sourceServiceId: servicePlan.id },
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Create template from service error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create template' },
      { status: 500 }
    )
  }
}
