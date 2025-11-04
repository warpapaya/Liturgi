'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface Group {
  id: string
  name: string
}

interface GroupMembership {
  id: string
  role: string
  group: Group
}

interface ServicePlan {
  id: string
  name: string
  date: string
}

interface ServiceAssignment {
  id: string
  role: string
  status: string
  servicePlan: ServicePlan
}

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  photoUrl: string | null
  tags: string[]
  notes: string | null
  status: string
  createdAt: string
  groupMemberships: GroupMembership[]
  serviceAssignments: ServiceAssignment[]
}

export default function PersonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [person, setPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPerson()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchPerson = async () => {
    try {
      const res = await fetch(`/api/people/${params.id}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load person')
      }

      setPerson(data.person)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load person')
    } finally {
      setLoading(false)
    }
  }

  const deletePerson = async () => {
    if (!confirm('Are you sure you want to delete this person? This will also remove them from all groups and service assignments.')) return

    try {
      const res = await fetch(`/api/people/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete person')
      }

      router.push('/people')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete person')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading person...</div>
      </div>
    )
  }

  if (error || !person) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Person not found'}</div>
        <Link href="/people" className="btn-primary">
          Back to People
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/people" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          ← Back to People
        </Link>
        <div className="mt-4 flex items-start justify-between">
          <div className="flex gap-4">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-semibold">
                {person.firstName.charAt(0)}{person.lastName.charAt(0)}
              </div>
            </div>
            {/* Name and Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {person.firstName} {person.lastName}
              </h1>
              <div className="mt-2 space-y-1">
                {person.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>✉️</span>
                    <a href={`mailto:${person.email}`} className="hover:text-primary-600">
                      {person.email}
                    </a>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📞</span>
                    <a href={`tel:${person.phone}`} className="hover:text-primary-600">
                      {person.phone}
                    </a>
                  </div>
                )}
              </div>
              {person.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(person.tags as string[]).map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-3">
            <Link href={`/people/${person.id}/edit`} className="btn-primary">
              Edit
            </Link>
            <button onClick={deletePerson} className="btn-danger">
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-500">Status</h2>
            <div className="mt-1">
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  person.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {person.status}
              </span>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-medium text-gray-500">Member Since</h2>
            <p className="mt-1 text-gray-900">
              {format(new Date(person.createdAt), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {person.notes && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Notes</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{person.notes}</p>
        </div>
      )}

      {/* Groups */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Groups ({person.groupMemberships.length})
        </h2>
        {person.groupMemberships.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Not a member of any groups yet.
          </p>
        ) : (
          <div className="space-y-2">
            {person.groupMemberships.map((membership) => (
              <Link
                key={membership.id}
                href={`/groups/${membership.group.id}`}
                className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{membership.group.name}</h3>
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    {membership.role}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Service Assignments */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Service Assignments ({person.serviceAssignments.length})
        </h2>
        {person.serviceAssignments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No upcoming service assignments.
          </p>
        ) : (
          <div className="space-y-2">
            {person.serviceAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                href={`/services/${assignment.servicePlan.id}`}
                className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{assignment.role}</h3>
                    <p className="text-sm text-gray-500">
                      {assignment.servicePlan.name} • {format(new Date(assignment.servicePlan.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    assignment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    assignment.status === 'declined' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
