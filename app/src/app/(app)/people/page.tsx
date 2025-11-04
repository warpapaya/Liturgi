'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  status: string
  tags: string[]
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/people')
      .then((res) => res.json())
      .then((data) => setPeople(data.people || []))
      .finally(() => setLoading(false))
  }, [])

  const filteredPeople = people.filter((person) => {
    const searchLower = search.toLowerCase()
    return (
      person.firstName.toLowerCase().includes(searchLower) ||
      person.lastName.toLowerCase().includes(searchLower) ||
      person.email?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">People</h1>
          <p className="mt-1 text-body text-gray-600">Your church directory</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/people/import" className="btn-secondary">
            Import CSV
          </Link>
          <a href="/api/people/export" className="btn-secondary">
            Export CSV
          </a>
          <Link href="/people/new" className="btn-primary">
            Add Person
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search people..."
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No people found.</p>
            <Link href="/people/new" className="mt-4 inline-block btn-primary">
              Add your first person
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPeople.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {person.firstName} {person.lastName}
                      </div>
                      {person.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(person.tags as string[]).slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="badge-info"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.email || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.phone || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`${
                          person.status === 'active'
                            ? 'badge-success'
                            : 'badge bg-gray-100 text-gray-800'
                        }`}
                      >
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/people/${person.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
