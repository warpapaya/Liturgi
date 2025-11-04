import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'

// POST /api/services/:id/duplicate - Duplicate a service plan
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'services:write')

    // Find the original service plan
    const originalService = await prisma.servicePlan.findFirst({
      where: {
        id: params.id,
        ...getOrgFilter(user),
      },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
        assignments: {
          include: {
            person: true,
          },
        },
      },
    })

    if (!originalService) {
      return NextResponse.json(
        { error: 'Service plan not found' },
        { status: 404 }
      )
    }

    // Create a new service plan with copied data
    const newService = await prisma.servicePlan.create({
      data: {
        orgId: originalService.orgId,
        name: `${originalService.name} (Copy)`,
        date: new Date(originalService.date.getTime() + 7 * 24 * 60 * 60 * 1000), // +7 days
        campus: originalService.campus,
        notes: originalService.notes,
        templateId: originalService.templateId,
        items: {
          create: originalService.items.map((item) => ({
            type: item.type,
            title: item.title,
            key: item.key,
            durationSec: item.durationSec,
            position: item.position,
            attachments: item.attachments,
            notes: item.notes,
            songId: item.songId,
          })),
        },
        // Optionally copy assignments (with pending status)
        assignments: {
          create: originalService.assignments.map((assignment) => ({
            personId: assignment.personId,
            role: assignment.role,
            status: 'pending', // Reset to pending for duplicated service
          })),
        },
      },
      include: {
        items: true,
        assignments: {
          include: {
            person: true,
          },
        },
      },
    })

    return NextResponse.json({ servicePlan: newService }, { status: 201 })
  } catch (error) {
    console.error('Duplicate service plan error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to duplicate service plan' },
      { status: 500 }
    )
  }
}
