import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const addressSchema = z.object({
  type: z.enum(['home', 'work', 'other']),
  street: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  country: z.string().default('US'),
  isPrimary: z.boolean().optional(),
})

// GET /api/people/:id/addresses
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

    const addresses = await prisma.personAddress.findMany({
      where: { personId: params.id },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Get addresses error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get addresses' },
      { status: 500 }
    )
  }
}

// POST /api/people/:id/addresses
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
    const data = addressSchema.parse(body)

    if (data.isPrimary) {
      await prisma.personAddress.updateMany({
        where: { personId: params.id, isPrimary: true },
        data: { isPrimary: false },
      })
    }

    const address = await prisma.personAddress.create({
      data: {
        ...data,
        personId: params.id,
      },
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch (error) {
    console.error('Create address error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create address' },
      { status: 500 }
    )
  }
}
