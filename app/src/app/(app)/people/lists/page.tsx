'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SavedList {
  id: string
  name: string
  description?: string
  type: 'static' | 'smart'
  isShared: boolean
  createdAt: string
}

export default function ListsPage() {
  const [lists, setLists] = useState<SavedList[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/lists')
      .then(r => r.json())
      .then(data => setLists(data.lists || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saved Lists</h1>
          <p className="mt-1 text-gray-600">Create and manage lists of people</p>
        </div>
        <button className="btn-primary">New List</button>
      </div>

      <div className="card">
        {lists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No saved lists yet</p>
            <button className="btn-primary">Create your first list</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <div key={list.id} className="border rounded-lg p-4 hover:border-primary-500 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{list.name}</h3>
                  <div className="flex space-x-2">
                    <span className={`badge badge-sm ${list.type === 'smart' ? 'badge-info' : 'badge'}`}>
                      {list.type}
                    </span>
                    {list.isShared && (
                      <span className="badge badge-sm">shared</span>
                    )}
                  </div>
                </div>
                {list.description && (
                  <p className="text-sm text-gray-600 mb-4">{list.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {new Date(list.createdAt).toLocaleDateString()}
                  </span>
                  <Link href={`/people/lists/${list.id}`} className="text-primary-600 hover:text-primary-900">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
