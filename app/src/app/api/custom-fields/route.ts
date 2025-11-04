import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const customFieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'number', 'date', 'dropdown', 'checkbox', 'file']),
  options: z.any().optional(),
  defaultValue: z.string().optional(),
  isRequired: z.boolean().default(false),
  isVisible: z.boolean().default(true),
  visibleToRoles: z.array(z.string()).optional(),
  groupName: z.string().optional(),
  position: z.number().default(0),
  validationRules: z.any().optional(),
  helpText: z.string().optional(),
})

// GET /api/custom-fields
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const fields = await prisma.customFieldDefinition.findMany({
      where: getOrgFilter(user),
      orderBy: [{ groupName: 'asc' }, { position: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ fields })
  } catch (error) {
    console.error('Get custom fields error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get custom fields' },
      { status: 500 }
    )
  }
}

// POST /api/custom-fields
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const data = customFieldSchema.parse(body)

    const field = await prisma.customFieldDefinition.create({
      data: {
        ...data,
        orgId: user.orgId,
      },
    })

    return NextResponse.json({ field }, { status: 201 })
  } catch (error) {
    console.error('Create custom field error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create custom field' },
      { status: 500 }
    )
  }
}
