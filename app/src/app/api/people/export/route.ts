import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { requirePermission, getOrgFilter } from '@/lib/rbac'
import Papa from 'papaparse'

// GET /api/people/export - Export people to CSV
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    requirePermission(user, 'people:read')

    const people = await prisma.person.findMany({
      where: getOrgFilter(user),
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })

    // Convert to CSV format
    const csvData = people.map((person) => ({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email || '',
      phone: person.phone || '',
      tags: JSON.stringify(person.tags),
      notes: person.notes || '',
      status: person.status,
    }))

    const csv = Papa.unparse(csvData)

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="people-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export people error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export people' },
      { status: 500 }
    )
  }
}
