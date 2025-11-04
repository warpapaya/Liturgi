import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  template: z.array(z.object({
    type: z.enum(['song', 'element', 'note']),
    title: z.string(),
    durationSec: z.number().optional(),
    notes: z.string().optional(),
  })).optional(),
  isDefault: z.boolean().optional(),
})

// GET /api/templates/:id - Get template by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:read')

    const template = await prisma.serviceTemplate.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
      include: {
        _count: {
          select: {
            servicePlans: true,
          },
        },
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Get template error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get template' },
      { status: 500 }
    )
  }
}

// PATCH /api/templates/:id - Update template
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    const body = await req.json()
    const data = updateTemplateSchema.parse(body)

    const existingTemplate = await prisma.serviceTemplate.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // If setting as default, unset other defaults
    if (data.isDefault === true) {
      await prisma.serviceTemplate.updateMany({
        where: {
          orgId: user.orgId,
          isDefault: true,
          id: { not: params.id },
        },
        data: {
          isDefault: false,
        },
      })
    }

    const template = await prisma.serviceTemplate.update({
      where: { id: params.id },
      data,
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'ServiceTemplate',
        entityId: template.id,
        diff: { old: existingTemplate, new: template },
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Update template error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE /api/templates/:id - Delete template
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:delete')

    const template = await prisma.serviceTemplate.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    await prisma.serviceTemplate.delete({
      where: { id: params.id },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'deleted',
        entity: 'ServiceTemplate',
        entityId: template.id,
        diff: { old: template },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete template error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete template' },
      { status: 500 }
    )
  }
}
