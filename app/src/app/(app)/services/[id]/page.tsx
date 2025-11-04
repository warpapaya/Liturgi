'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface ServiceItem {
  id: string
  type: 'song' | 'element' | 'note'
  title: string
  durationSec: number
  position: number
  notes: string | null
}

interface Assignment {
  id: string
  role: string
  status: string
  person: {
    id: string
    firstName: string
    lastName: string
  }
}

interface ServicePlan {
  id: string
  name: string
  date: string
  campus: string | null
  notes: string | null
  items: ServiceItem[]
  assignments: Assignment[]
  totalDuration: number
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [service, setService] = useState<ServicePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showItemForm, setShowItemForm] = useState(false)
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)

  useEffect(() => {
    fetchService()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchService = async () => {
    try {
      const res = await fetch(`/api/services/${params.id}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load service')
      }

      setService(data.servicePlan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service')
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async () => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const res = await fetch(`/api/services/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete service')
      }

      router.push('/services')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete service')
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'song': return '🎵'
      case 'element': return '📖'
      case 'note': return '📝'
      default: return '•'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading service...</div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Service not found'}</div>
        <Link href="/services" className="btn-primary">
          Back to Services
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/services" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          ← Back to Services
        </Link>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
            <p className="mt-1 text-gray-500">
              {format(new Date(service.date), 'EEEE, MMMM d, yyyy • h:mm a')}
              {service.campus && ` • ${service.campus}`}
            </p>
          </div>
          <button onClick={deleteService} className="btn-danger">
            Delete Service
          </button>
        </div>
        {service.notes && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">{service.notes}</p>
          </div>
        )}
      </div>

      {/* Order of Service */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order of Service</h2>
            <p className="text-sm text-gray-500">
              Total Duration: {formatDuration(service.totalDuration)}
            </p>
          </div>
          <button
            onClick={() => setShowItemForm(true)}
            className="btn-primary"
          >
            Add Item
          </button>
        </div>

        {service.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No items yet. Add your first item to build the service order.
          </div>
        ) : (
          <div className="space-y-2">
            {service.items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="text-2xl">{getItemIcon(item.type)}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDuration(item.durationSec)}
                </div>
                <div className="text-xs text-gray-400 uppercase">
                  {item.type}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Item Form */}
        {showItemForm && (
          <AddItemForm
            serviceId={service.id}
            position={service.items.length}
            onSuccess={() => {
              setShowItemForm(false)
              fetchService()
            }}
            onCancel={() => setShowItemForm(false)}
          />
        )}
      </div>

      {/* Assignments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
          <button
            onClick={() => setShowAssignmentForm(true)}
            className="btn-primary"
          >
            Add Assignment
          </button>
        </div>

        {service.assignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No assignments yet. Assign people to roles for this service.
          </div>
        ) : (
          <div className="space-y-2">
            {service.assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{assignment.role}</h3>
                  <p className="text-sm text-gray-500">
                    {assignment.person.firstName} {assignment.person.lastName}
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
            ))}
          </div>
        )}

        {/* Add Assignment Form */}
        {showAssignmentForm && (
          <AddAssignmentForm
            serviceId={service.id}
            onSuccess={() => {
              setShowAssignmentForm(false)
              fetchService()
            }}
            onCancel={() => setShowAssignmentForm(false)}
          />
        )}
      </div>
    </div>
  )
}

// Add Item Form Component
function AddItemForm({
  serviceId,
  position,
  onSuccess,
  onCancel,
}: {
  serviceId: string
  position: number
  onSuccess: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    type: 'song' as 'song' | 'element' | 'note',
    title: '',
    durationSec: 0,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/services/${serviceId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          position,
          notes: formData.notes || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add item')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border-2 border-primary-200 rounded-lg bg-primary-50 space-y-4">
      <h3 className="font-semibold text-gray-900">Add Service Item</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="label">
            Type *
          </label>
          <select
            id="type"
            className="input"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            required
          >
            <option value="song">Song</option>
            <option value="element">Element</option>
            <option value="note">Note</option>
          </select>
        </div>

        <div>
          <label htmlFor="duration" className="label">
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            className="input"
            min="0"
            value={Math.floor(formData.durationSec / 60)}
            onChange={(e) => setFormData({ ...formData, durationSec: parseInt(e.target.value) * 60 })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="title" className="label">
          Title *
        </label>
        <input
          type="text"
          id="title"
          className="input"
          placeholder="e.g., Amazing Grace, Welcome, Offering"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="notes" className="label">
          Notes
        </label>
        <textarea
          id="notes"
          className="input"
          rows={2}
          placeholder="Chord chart, special instructions..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Adding...' : 'Add Item'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}

// Add Assignment Form Component
function AddAssignmentForm({
  serviceId,
  onSuccess,
  onCancel,
}: {
  serviceId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [people, setPeople] = useState<any[]>([])
  const [formData, setFormData] = useState({
    personId: '',
    role: '',
  })

  useEffect(() => {
    fetch('/api/people')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load people')
        return res.json()
      })
      .then((data) => setPeople(data.people || []))
      .catch((err) => {
        console.error('Error loading people:', err)
        setPeople([])
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/services/${serviceId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add assignment')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border-2 border-primary-200 rounded-lg bg-primary-50 space-y-4">
      <h3 className="font-semibold text-gray-900">Add Assignment</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="role" className="label">
          Role *
        </label>
        <input
          type="text"
          id="role"
          className="input"
          placeholder="e.g., Worship Leader, Sound Tech, Greeter"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="person" className="label">
          Person *
        </label>
        <select
          id="person"
          className="input"
          value={formData.personId}
          onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
          required
        >
          <option value="">Select a person...</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.firstName} {person.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Adding...' : 'Add Assignment'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
