import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import { z } from 'zod'

const bulkUpdateSchema = z.object({
  personIds: z.array(z.string()),
  updates: z.object({
    status: z.enum(['active', 'inactive', 'visitor']).optional(),
    doNotContact: z.boolean().optional(),
    emailOptIn: z.boolean().optional(),
    smsOptIn: z.boolean().optional(),
  }),
})

const bulkTagSchema = z.object({
  personIds: z.array(z.string()),
  tagId: z.string(),
  action: z.enum(['add', 'remove']),
})

const bulkDeleteSchema = z.object({
  personIds: z.array(z.string()),
})

// POST /api/people/bulk - Bulk operations
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const { operation } = body

    switch (operation) {
      case 'update': {
        const data = bulkUpdateSchema.parse(body)

        // Verify all people belong to the organization
        const people = await prisma.person.findMany({
          where: {
            id: { in: data.personIds },
            ...getOrgFilter(user),
          },
        })

        if (people.length !== data.personIds.length) {
          return NextResponse.json(
            { error: 'Some people not found' },
            { status: 404 }
          )
        }

        await prisma.person.updateMany({
          where: { id: { in: data.personIds } },
          data: data.updates,
        })

        // Audit log
        await prisma.auditLog.create({
          data: {
            orgId: user.orgId,
            userId: user.id,
            action: 'bulk_updated',
            entity: 'Person',
            entityId: 'bulk',
            diff: { personIds: data.personIds, updates: data.updates },
          },
        })

        return NextResponse.json({ success: true, count: people.length })
      }

      case 'tag': {
        const data = bulkTagSchema.parse(body)

        if (data.action === 'add') {
          // Add tags to all people (skip duplicates)
          for (const personId of data.personIds) {
            await prisma.personTag.upsert({
              where: {
                personId_tagId: {
                  personId,
                  tagId: data.tagId,
                },
              },
              create: {
                personId,
                tagId: data.tagId,
                addedBy: user.id,
              },
              update: {},
            })
          }
        } else {
          // Remove tags
          await prisma.personTag.deleteMany({
            where: {
              personId: { in: data.personIds },
              tagId: data.tagId,
            },
          })
        }

        return NextResponse.json({ success: true, count: data.personIds.length })
      }

      case 'delete': {
        const data = bulkDeleteSchema.parse(body)

        requirePermission(user, 'people:delete')

        // Verify all people belong to the organization
        const people = await prisma.person.findMany({
          where: {
            id: { in: data.personIds },
            ...getOrgFilter(user),
          },
        })

        if (people.length !== data.personIds.length) {
          return NextResponse.json(
            { error: 'Some people not found' },
            { status: 404 }
          )
        }

        await prisma.person.deleteMany({
          where: { id: { in: data.personIds } },
        })

        // Audit log
        await prisma.auditLog.create({
          data: {
            orgId: user.orgId,
            userId: user.id,
            action: 'bulk_deleted',
            entity: 'Person',
            entityId: 'bulk',
            diff: { personIds: data.personIds },
          },
        })

        return NextResponse.json({ success: true, count: people.length })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}
