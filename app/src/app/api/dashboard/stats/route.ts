import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { getOrgFilter } from '@/lib/rbac'

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    // Get counts for all main entities
    const [
      peopleCount,
      activePeopleCount,
      groupsCount,
      servicePlansCount,
      upcomingServicesCount,
      usersCount,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.person.count({
        where: { ...getOrgFilter(user) },
      }),
      prisma.person.count({
        where: {
          ...getOrgFilter(user),
          status: 'active',
        },
      }),
      prisma.group.count({
        where: { ...getOrgFilter(user) },
      }),
      prisma.servicePlan.count({
        where: { ...getOrgFilter(user) },
      }),
      prisma.servicePlan.count({
        where: {
          ...getOrgFilter(user),
          date: {
            gte: new Date(),
          },
        },
      }),
      prisma.user.count({
        where: { ...getOrgFilter(user) },
      }),
      prisma.auditLog.findMany({
        where: { ...getOrgFilter(user) },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    // Get group stats
    const groupsWithMembers = await prisma.group.findMany({
      where: { ...getOrgFilter(user) },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    })

    const totalGroupMembers = groupsWithMembers.reduce(
      (sum, group) => sum + group._count.members,
      0
    )
    const avgGroupSize = groupsCount > 0 ? Math.round(totalGroupMembers / groupsCount) : 0

    // Get service stats
    const servicesWithAssignments = await prisma.servicePlan.findMany({
      where: {
        ...getOrgFilter(user),
        date: {
          gte: new Date(),
        },
      },
      include: {
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      take: 5,
      orderBy: { date: 'asc' },
    })

    const totalUpcomingAssignments = servicesWithAssignments.reduce(
      (sum, service) => sum + service._count.assignments,
      0
    )

    return NextResponse.json({
      stats: {
        people: {
          total: peopleCount,
          active: activePeopleCount,
          inactive: peopleCount - activePeopleCount,
        },
        groups: {
          total: groupsCount,
          avgSize: avgGroupSize,
          totalMembers: totalGroupMembers,
        },
        services: {
          total: servicePlansCount,
          upcoming: upcomingServicesCount,
          totalUpcomingAssignments,
        },
        users: {
          total: usersCount,
        },
      },
      recentActivity: recentAuditLogs.map(log => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        createdAt: log.createdAt,
        user: log.user,
      })),
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get stats' },
      { status: 500 }
    )
  }
}
