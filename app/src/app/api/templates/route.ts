import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  template: z.array(z.object({
    type: z.enum(['song', 'element', 'note']),
    title: z.string(),
    durationSec: z.number().optional(),
    notes: z.string().optional(),
  })),
  isDefault: z.boolean().optional(),
})

// GET /api/templates - List service templates
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:read')

    const templates = await prisma.serviceTemplate.findMany({
      where: { ...getOrgFilter(user) },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get templates' },
      { status: 500 }
    )
  }
}

// POST /api/templates - Create service template
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    const body = await req.json()
    const data = createTemplateSchema.parse(body)

    const template = await prisma.serviceTemplate.create({
      data: {
        ...data,
        orgId: user.orgId,
      },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'created',
        entity: 'ServiceTemplate',
        entityId: template.id,
        diff: { new: template },
      },
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create template' },
      { status: 500 }
    )
  }
}
