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
    category: 'small_group',
    status: 'active',
    visibility: 'public',
    capacity: '',
    location: '',
    campus: '',
    meetingDay: '',
    meetingTime: '',
    cadence: '',
    photoUrl: '',
    startDate: '',
    endDate: '',
    isOpen: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload: any = {
        ...formData,
        description: formData.description || null,
        cadence: formData.cadence || null,
        location: formData.location || null,
        campus: formData.campus || null,
        meetingDay: formData.meetingDay || null,
        meetingTime: formData.meetingTime || null,
        photoUrl: formData.photoUrl || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      }

      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="card space-y-6">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <div>
            <label htmlFor="name" className="label">Group Name *</label>
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
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description"
              className="input"
              rows={4}
              placeholder="A welcoming group for young adults..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="label">Category</label>
              <select
                id="category"
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="small_group">Small Group</option>
                <option value="ministry_team">Ministry Team</option>
                <option value="bible_study">Bible Study</option>
                <option value="prayer_group">Prayer Group</option>
                <option value="youth_group">Youth Group</option>
                <option value="mens_group">Men's Group</option>
                <option value="womens_group">Women's Group</option>
                <option value="class">Class</option>
                <option value="committee">Committee</option>
                <option value="service_team">Service Team</option>
                <option value="worship_team">Worship Team</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="visibility" className="label">Visibility</label>
              <select
                id="visibility"
                className="input"
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              >
                <option value="public">Public - Anyone can see</option>
                <option value="private">Private - Members only</option>
                <option value="hidden">Hidden - Invitation only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="capacity" className="label">Capacity (optional)</label>
              <input
                type="number"
                id="capacity"
                className="input"
                placeholder="Leave empty for unlimited"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                min="1"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer mt-8">
                <input
                  type="checkbox"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Open for new members</span>
              </label>
            </div>
          </div>
        </div>

        <div className="card space-y-6">
          <h3 className="text-lg font-semibold">Meeting Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="meetingDay" className="label">Meeting Day</label>
              <select
                id="meetingDay"
                className="input"
                value={formData.meetingDay}
                onChange={(e) => setFormData({ ...formData, meetingDay: e.target.value })}
              >
                <option value="">Select a day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div>
              <label htmlFor="meetingTime" className="label">Meeting Time</label>
              <input
                type="time"
                id="meetingTime"
                className="input"
                value={formData.meetingTime}
                onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="cadence" className="label">Frequency</label>
            <input
              type="text"
              id="cadence"
              className="input"
              placeholder="Weekly, Bi-weekly, Monthly, etc."
              value={formData.cadence}
              onChange={(e) => setFormData({ ...formData, cadence: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="label">Location</label>
              <input
                type="text"
                id="location"
                className="input"
                placeholder="Coffee Shop Downtown"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="campus" className="label">Campus</label>
              <input
                type="text"
                id="campus"
                className="input"
                placeholder="Main Campus"
                value={formData.campus}
                onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Group'}
          </button>
          <Link href="/groups" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
