'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
  subdomain: string
  plan: string
  logoUrl: string | null
}

export default function SettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setOrg(data.organization))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">Manage your organization settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/settings/users"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-xl">
              👥
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">User Management</h3>
              <p className="text-sm text-gray-500">Invite and manage users</p>
            </div>
          </div>
        </Link>
        <div className="card bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
              ⚙️
            </div>
            <div>
              <h3 className="font-semibold text-gray-500">Organization</h3>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>
        <div className="card bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
              🔔
            </div>
            <div>
              <h3 className="font-semibold text-gray-500">Notifications</h3>
              <p className="text-sm text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization</h2>
        <dl className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{org?.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Subdomain</dt>
            <dd className="mt-1 text-sm text-gray-900">{org?.subdomain}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Plan</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {org?.plan}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan Limits</h2>
        <p className="text-sm text-gray-600 mb-4">
          Your current plan allows:
        </p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Up to 100 people</li>
          <li>• Up to 10 groups</li>
          <li>• Up to 10 service plans</li>
        </ul>
      </div>

      <div className="card bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Need More?</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upgrade your plan to increase limits and unlock more features.
        </p>
        <button className="btn-primary" disabled>
          Upgrade Plan (Coming Soon)
        </button>
      </div>
    </div>
  )
}
