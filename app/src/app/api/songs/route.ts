import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const createSongSchema = z.object({
  title: z.string().min(1),
  artist: z.string().optional(),
  ccliNumber: z.string().optional(),
  bpm: z.number().optional(),
  timeSignature: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

// GET /api/songs - List songs with search
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:read')

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')

    const where: any = { ...getOrgFilter(user) }

    // Search by title or artist
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',')
      where.tags = {
        array_contains: tagArray,
      }
    }

    const songs = await prisma.song.findMany({
      where,
      include: {
        arrangements: true,
        _count: {
          select: {
            serviceItems: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    })

    return NextResponse.json({ songs })
  } catch (error) {
    console.error('Get songs error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get songs' },
      { status: 500 }
    )
  }
}

// POST /api/songs - Create song
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    const body = await req.json()
    const data = createSongSchema.parse(body)

    const song = await prisma.song.create({
      data: {
        ...data,
        orgId: user.orgId,
        tags: data.tags || [],
      },
      include: {
        arrangements: true,
      },
    })

    await prisma.auditLog.create({
      data: {
        orgId: user.orgId,
        userId: user.id,
        action: 'created',
        entity: 'Song',
        entityId: song.id,
        diff: { new: song },
      },
    })

    return NextResponse.json({ song }, { status: 201 })
  } catch (error) {
    console.error('Create song error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create song' },
      { status: 500 }
    )
  }
}
