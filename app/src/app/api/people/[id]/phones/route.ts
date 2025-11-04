import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const phoneSchema = z.object({
  type: z.enum(['mobile', 'home', 'work', 'other']),
  number: z.string().min(1),
  isPrimary: z.boolean().optional(),
  doNotCall: z.boolean().optional(),
})

// GET /api/people/:id/phones - Get all phone numbers for a person
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

    const phones = await prisma.personPhone.findMany({
      where: { personId: params.id },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ phones })
  } catch (error) {
    console.error('Get phones error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get phones' },
      { status: 500 }
    )
  }
}

// POST /api/people/:id/phones - Add a phone number
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
    const data = phoneSchema.parse(body)

    // If this is set as primary, unset other primary phones
    if (data.isPrimary) {
      await prisma.personPhone.updateMany({
        where: { personId: params.id, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    const phone = await prisma.personPhone.create({
      data: {
        ...data,
        personId: params.id,
      },
    })

    return NextResponse.json({ phone }, { status: 201 })
  } catch (error) {
    console.error('Create phone error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create phone' },
      { status: 500 }
    )
  }
}
