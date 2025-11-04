import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission } from '@/lib/rbac'
import Papa from 'papaparse'

// POST /api/people/import - Import people from CSV
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:write')

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const text = await file.text()

    // Parse CSV
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (result.errors.length > 0) {
      return NextResponse.json(
        { error: 'CSV parsing failed', details: result.errors },
        { status: 400 }
      )
    }

    // Check plan limits
    const org = await prisma.organization.findUnique({
      where: { id: user.orgId },
      include: { _count: { select: { people: true } } },
    })

    if (org) {
      const limits = org.planLimits as any
      const newTotal = org._count.people + result.data.length

      if (newTotal > limits.people) {
        return NextResponse.json(
          { error: `Plan limit would be exceeded: maximum ${limits.people} people` },
          { status: 403 }
        )
      }
    }

    // Import people
    const imported = []
    const errors = []

    for (const row of result.data as any[]) {
      try {
        const person = await prisma.person.create({
          data: {
            orgId: user.orgId,
            firstName: row.firstName || row['First Name'] || '',
            lastName: row.lastName || row['Last Name'] || '',
            email: row.email || row['Email'] || null,
            phone: row.phone || row['Phone'] || null,
            tags: row.tags ? JSON.parse(row.tags) : [],
            notes: row.notes || row['Notes'] || null,
            status: row.status === 'inactive' ? 'inactive' : 'active',
          },
        })
        imported.push(person)
      } catch (error) {
        errors.push({ row, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      errors: errors.length,
      details: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Import people error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import people' },
      { status: 500 }
    )
  }
}
