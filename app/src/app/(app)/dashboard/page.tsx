'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'

interface ServicePlan {
  id: string
  name: string
  date: string
  campus: string | null
  _count: {
    items: number
    assignments: number
  }
}

interface Stats {
  people: {
    total: number
    active: number
    inactive: number
  }
  groups: {
    total: number
    avgSize: number
    totalMembers: number
  }
  services: {
    total: number
    upcoming: number
    totalUpcomingAssignments: number
  }
  users: {
    total: number
  }
}

interface Activity {
  id: string
  action: string
  entity: string
  entityId: string
  createdAt: string
  user: {
    firstName: string | null
    lastName: string | null
    email: string
  }
}

interface User {
  firstName: string | null
  lastName: string | null
}

export default function DashboardPage() {
  const [upcomingServices, setUpcomingServices] = useState<ServicePlan[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/services?from=${new Date().toISOString()}`).then(r => r.json()),
      fetch('/api/dashboard/stats').then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ])
      .then(([servicesData, statsData, userData]) => {
        setUpcomingServices(servicesData.servicePlans?.slice(0, 5) || [])
        setStats(statsData.stats || null)
        setRecentActivity(statsData.recentActivity || [])
        setCurrentUser(userData.user || null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getUserName = () => {
    if (currentUser?.firstName && currentUser?.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`
    }
    return 'there'
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'created':
        return '✨'
      case 'updated':
        return '✏️'
      case 'deleted':
        return '🗑️'
      default:
        return '📝'
    }
  }

  const getActivityText = (activity: Activity) => {
    const userName = activity.user.firstName && activity.user.lastName
      ? `${activity.user.firstName} ${activity.user.lastName}`
      : activity.user.email

    return `${userName} ${activity.action} ${activity.entity.toLowerCase()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {getUserName()}
        </h1>
        <p className="mt-1 text-body text-gray-600">Here's what's happening in your church.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">People</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.people.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.people.active || 0} active
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-liturgi">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <Link href="/people" className="mt-4 text-sm text-primary-600 hover:text-primary-500 inline-block">
            View all →
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Groups</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.groups.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Avg {stats?.groups.avgSize || 0} members
              </p>
            </div>
            <div className="p-3 bg-sage-100 rounded-liturgi">
              <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <Link href="/groups" className="mt-4 text-sm text-primary-600 hover:text-primary-500 inline-block">
            View all →
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Service Plans</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.services.upcoming || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.services.totalUpcomingAssignments || 0} assignments
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-liturgi">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <Link href="/services" className="mt-4 text-sm text-primary-600 hover:text-primary-500 inline-block">
            View all →
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Your Team</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.users.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Active users
              </p>
            </div>
            <div className="p-3 bg-gold-100 rounded-liturgi">
              <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <Link href="/settings/users" className="mt-4 text-sm text-primary-600 hover:text-primary-500 inline-block">
            Manage →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Service Plans */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Service Plans</h2>
            <Link href="/services" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
          {upcomingServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-body text-gray-600 mb-4">Looks quiet here — try creating your first service plan.</p>
              <Link href="/services/new" className="btn-primary">
                Create Service Plan
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="block p-3 border border-ash rounded-liturgi hover:border-primary-400 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(service.date), 'EEE, MMM d • h:mm a')}
                        {service.campus && ` • ${service.campus}`}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      <div>{service._count.items} items</div>
                      <div>{service._count.assignments} assigned</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-body text-gray-600 text-center py-8">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-liturgi bg-gray-100 flex items-center justify-center text-lg">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{getActivityText(activity)}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/people/new"
            className="p-4 border-2 border-dashed border-ash rounded-liturgi hover:border-primary-400 hover:bg-primary-50 transition-colors text-center"
          >
            <div className="text-gray-600">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="font-semibold text-sm">Add Person</span>
            </div>
          </Link>
          <Link
            href="/services/new"
            className="p-4 border-2 border-dashed border-ash rounded-liturgi hover:border-primary-400 hover:bg-primary-50 transition-colors text-center"
          >
            <div className="text-gray-600">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold text-sm">Create Service Plan</span>
            </div>
          </Link>
          <Link
            href="/groups/new"
            className="p-4 border-2 border-dashed border-ash rounded-liturgi hover:border-primary-400 hover:bg-primary-50 transition-colors text-center"
          >
            <div className="text-gray-600">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold text-sm">Create Group</span>
            </div>
          </Link>
          <Link
            href="/settings/users"
            className="p-4 border-2 border-dashed border-ash rounded-liturgi hover:border-primary-400 hover:bg-primary-50 transition-colors text-center"
          >
            <div className="text-gray-600">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              <span className="font-semibold text-sm">Invite Team Member</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
