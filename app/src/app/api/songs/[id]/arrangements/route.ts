import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const createArrangementSchema = z.object({
  name: z.string().min(1),
  key: z.string().min(1),
  chordChart: z.string().optional(),
  lyrics: z.string().optional(),
  audio: z.string().optional(),
})

// POST /api/songs/[id]/arrangements - Create arrangement
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    // Verify song exists and belongs to org
    const song = await prisma.song.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    const body = await req.json()
    const data = createArrangementSchema.parse(body)

    const arrangement = await prisma.arrangement.create({
      data: {
        ...data,
        songId: params.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'created',
        entity: 'Arrangement',
        entityId: arrangement.id,
        diff: { new: arrangement },
      },
    })

    return NextResponse.json({ arrangement }, { status: 201 })
  } catch (error) {
    console.error('Create arrangement error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create arrangement' },
      { status: 500 }
    )
  }
}
