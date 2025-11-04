import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.any(),
  isPublic: z.boolean().default(true),
  requireAuth: z.boolean().default(false),
  allowAnonymous: z.boolean().default(false),
  confirmEmail: z.string().optional(),
  isActive: z.boolean().default(true),
})

// GET /api/forms
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const forms = await prisma.form.findMany({
      where: getOrgFilter(user),
      include: {
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ forms })
  } catch (error) {
    console.error('Get forms error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get forms' },
      { status: 500 }
    )
  }
}

// POST /api/forms
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const data = formSchema.parse(body)

    const form = await prisma.form.create({
      data: {
        ...data,
        orgId: user.orgId,
      },
    })

    return NextResponse.json({ form }, { status: 201 })
  } catch (error) {
    console.error('Create form error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create form' },
      { status: 500 }
    )
  }
}
