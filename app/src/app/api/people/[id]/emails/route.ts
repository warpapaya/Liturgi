import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email(),
  isPrimary: z.boolean().optional(),
  isWork: z.boolean().optional(),
})

// GET /api/people/:id/emails
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const person = await prisma.person.findFirst({
      where: { id: params.id, ...getOrgFilter(user) },
    })

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    const emails = await prisma.personEmail.findMany({
      where: { personId: params.id },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ emails })
  } catch (error) {
    console.error('Get emails error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get emails' },
      { status: 500 }
    )
  }
}

// POST /api/people/:id/emails
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    const data = emailSchema.parse(body)

    if (data.isPrimary) {
      await prisma.personEmail.updateMany({
        where: { personId: params.id, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    const email = await prisma.personEmail.create({
      data: {
        ...data,
        personId: params.id,
      },
    })

    return NextResponse.json({ email }, { status: 201 })
  } catch (error) {
    console.error('Create email error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create email' },
      { status: 500 }
    )
  }
}
