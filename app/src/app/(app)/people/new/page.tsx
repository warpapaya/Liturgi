'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPersonPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tags: '',
    notes: '',
    status: 'active',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const tags = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : []

      const res = await fetch('/api/people', {
        method: 'POST',
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
        setError(data.error || 'Failed to create person')
        return
      }

      router.push('/people')
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/people" className="text-primary-600 hover:text-primary-500 text-sm">
          ← Back to People
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Add Person</h1>
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
          <Link href="/people" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Person'}
          </button>
        </div>
      </form>
    </div>
  )
}
