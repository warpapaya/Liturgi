'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { showToast } from '@/components/Toast'

export default function NewGroupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cadence: '',
    location: '',
    isOpen: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          description: formData.description || null,
          cadence: formData.cadence || null,
          location: formData.location || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create group')
      }

      showToast('Group created successfully!', 'success')
      router.push(`/groups/${data.group.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/groups" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          ← Back to Groups
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Create Group</h1>
        <p className="mt-1 text-gray-500">Set up a new small group or team</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="label">
            Group Name *
          </label>
          <input
            type="text"
            id="name"
            className="input"
            placeholder="Young Adults Bible Study"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            className="input"
            rows={4}
            placeholder="A welcoming group for young adults to study the Bible and build community..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cadence" className="label">
              Meeting Schedule
            </label>
            <input
              type="text"
              id="cadence"
              className="input"
              placeholder="Weekly on Thursdays"
              value={formData.cadence}
              onChange={(e) => setFormData({ ...formData, cadence: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="location" className="label">
              Location
            </label>
            <input
              type="text"
              id="location"
              className="input"
              placeholder="Coffee Shop Downtown"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isOpen}
              onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Open for new members
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Uncheck this if the group is currently full or closed
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
          <Link href="/groups" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
