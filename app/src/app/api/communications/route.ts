import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'
import { z } from 'zod'

const communicationSchema = z.object({
  personId: z.string().optional(),
  personIds: z.array(z.string()).optional(),
  type: z.enum(['email', 'sms']),
  templateId: z.string().optional(),
  subject: z.string().optional(),
  content: z.string(),
})

// POST /api/communications/send
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const body = await req.json()
    const data = communicationSchema.parse(body)

    const personIds = data.personIds || (data.personId ? [data.personId] : [])

    if (personIds.length === 0) {
      return NextResponse.json(
        { error: 'No recipients specified' },
        { status: 400 }
      )
    }

    // Create communication records for each person
    const communications = await Promise.all(
      personIds.map((personId) =>
        prisma.communication.create({
          data: {
            personId,
            type: data.type,
            templateId: data.templateId,
            subject: data.subject,
            content: data.content,
            status: 'sent', // In production, this would be 'pending' and processed by a queue
            sentAt: new Date(),
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      count: communications.length,
      communications
    })
  } catch (error) {
    console.error('Send communication error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send communication' },
      { status: 500 }
    )
  }
}

// GET /api/communications/templates
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    if (type === 'sms') {
      const templates = await prisma.smsTemplate.findMany({
        where: { orgId: user.orgId },
        orderBy: { name: 'asc' },
      })
      return NextResponse.json({ templates })
    } else {
      const templates = await prisma.emailTemplate.findMany({
        where: { orgId: user.orgId },
        orderBy: { name: 'asc' },
      })
      return NextResponse.json({ templates })
    }
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get templates' },
      { status: 500 }
    )
  }
}
