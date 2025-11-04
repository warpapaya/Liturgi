import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const noteSchema = z.object({
  category: z.enum(['general', 'pastoral_care', 'follow_up', 'other']).default('general'),
  content: z.string().min(1),
  isPrivate: z.boolean().default(false),
  pinned: z.boolean().default(false),
  reminderAt: z.string().optional().nullable(),
})

// GET /api/people/:id/notes
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

    const notes = await prisma.personNote.findMany({
      where: {
        personId: params.id,
        // Filter private notes based on user role
        OR: [
          { isPrivate: false },
          { isPrivate: true, authorId: user.id },
          ...(user.role === 'admin' ? [{ isPrivate: true }] : []),
        ],
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get notes' },
      { status: 500 }
    )
  }
}

// POST /api/people/:id/notes
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
    const data = noteSchema.parse(body)

    const note = await prisma.personNote.create({
      data: {
        ...data,
        reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
        personId: params.id,
        authorId: user.id,
      },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create note' },
      { status: 500 }
    )
  }
}
