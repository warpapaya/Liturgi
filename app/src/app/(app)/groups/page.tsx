'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Group {
  id: string
  name: string
  description: string | null
  cadence: string | null
  location: string | null
  isOpen: boolean
  _count: {
    members: number
  }
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => setGroups(data.groups || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="mt-1 text-gray-500">Manage small groups and teams</p>
        </div>
        <Link href="/groups/new" className="btn-primary">
          Create Group
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading...</div>
        ) : groups.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No groups found.</p>
            <Link href="/groups/new" className="mt-4 inline-block btn-primary">
              Create your first group
            </Link>
          </div>
        ) : (
          groups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    group.isOpen
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {group.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              {group.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {group.description}
                </p>
              )}
              <div className="text-sm text-gray-500 space-y-1">
                {group.cadence && <div>📅 {group.cadence}</div>}
                {group.location && <div>📍 {group.location}</div>}
                <div>👥 {group._count.members} members</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
