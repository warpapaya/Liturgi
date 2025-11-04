import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'

// GET /api/forms/:id/submissions
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const submissions = await prisma.formSubmission.findMany({
      where: { formId: params.id },
      include: {
        person: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Get submissions error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get submissions' },
      { status: 500 }
    )
  }
}

// POST /api/forms/:id/submissions - Public submission endpoint
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    const form = await prisma.form.findUnique({
      where: { id: params.id },
    })

    if (!form || !form.isActive) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      )
    }

    const submission = await prisma.formSubmission.create({
      data: {
        formId: params.id,
        data: body.data,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    console.error('Submit form error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit form' },
      { status: 500 }
    )
  }
}
