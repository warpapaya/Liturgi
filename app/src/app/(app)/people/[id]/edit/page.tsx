'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { showToast } from '@/components/Toast'

export default function EditPersonPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tags: '',
    notes: '',
    status: 'active',
  })

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

      const person = data.person
      setFormData({
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.email || '',
        phone: person.phone || '',
        tags: (person.tags as string[]).join(', '),
        notes: person.notes || '',
        status: person.status,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load person')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const tags = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []

      const res = await fetch(`/api/people/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags,
          email: formData.email || null,
          phone: formData.phone || null,
          notes: formData.notes || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to update person')
        return
      }

      showToast('Person updated successfully!', 'success')
      router.push(`/people/${params.id}`)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading person...</div>
      </div>
    )
  }

  if (error && !formData.firstName) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Link href="/people" className="btn-primary">
          Back to People
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/people/${params.id}`} className="text-primary-600 hover:text-primary-500 text-sm">
          ← Back to Person
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit Person</h1>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="label">
              First Name *
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="input"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="label">
              Last Name *
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="input"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="input"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="phone" className="label">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="input"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="tags" className="label">
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            className="input"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Volunteer, Music, Leader (comma-separated)"
          />
        </div>

        <div>
          <label htmlFor="status" className="label">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="input"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="label">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className="input"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Link href={`/people/${params.id}`} className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
