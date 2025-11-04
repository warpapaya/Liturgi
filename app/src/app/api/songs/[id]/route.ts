import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const updateSongSchema = z.object({
  title: z.string().min(1).optional(),
  artist: z.string().optional(),
  ccliNumber: z.string().optional(),
  bpm: z.number().optional(),
  timeSignature: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

// GET /api/songs/[id] - Get single song
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:read')

    const song = await prisma.song.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
      include: {
        arrangements: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            serviceItems: true,
          },
        },
      },
    })

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    return NextResponse.json({ song })
  } catch (error) {
    console.error('Get song error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get song' },
      { status: 500 }
    )
  }
}

// PATCH /api/songs/[id] - Update song
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    const body = await req.json()
    const data = updateSongSchema.parse(body)

    const existing = await prisma.song.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    const song = await prisma.song.update({
      where: { id: params.id },
      data,
      include: {
        arrangements: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'updated',
        entity: 'Song',
        entityId: song.id,
        diff: { old: existing, new: song },
      },
    })

    return NextResponse.json({ song })
  } catch (error) {
    console.error('Update song error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update song' },
      { status: 500 }
    )
  }
}

// DELETE /api/songs/[id] - Delete song
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    const existing = await prisma.song.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    await prisma.song.delete({
      where: { id: params.id },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'deleted',
        entity: 'Song',
        entityId: params.id,
        diff: { old: existing },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete song error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete song' },
      { status: 500 }
    )
  }
}
