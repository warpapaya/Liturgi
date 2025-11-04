'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditGroupPage() {
  const router = useRouter()
  const params = useParams()
  const groupId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    fetchGroup()
  }, [groupId])

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`)
      if (!res.ok) throw new Error('Failed to fetch group')

      const data = await res.json()
      const group = data.group

      setFormData({
        name: group.name || '',
        description: group.description || '',
        category: group.category || 'small_group',
        status: group.status || 'active',
        visibility: group.visibility || 'public',
        capacity: group.capacity?.toString() || '',
        location: group.location || '',
        campus: group.campus || '',
        meetingDay: group.meetingDay || '',
        meetingTime: group.meetingTime || '',
        cadence: group.cadence || '',
        photoUrl: group.photoUrl || '',
        startDate: group.startDate ? group.startDate.split('T')[0] : '',
        endDate: group.endDate ? group.endDate.split('T')[0] : '',
        isOpen: group.isOpen ?? true,
      })
    } catch (err) {
      setError('Failed to load group')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload: any = { ...formData }

      // Convert capacity to number or null
      payload.capacity = formData.capacity ? parseInt(formData.capacity) : null

      // Convert dates to ISO strings or null
      payload.startDate = formData.startDate ? new Date(formData.startDate).toISOString() : null
      payload.endDate = formData.endDate ? new Date(formData.endDate).toISOString() : null

      const res = await fetch(`/api/groups/${groupId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update group')
      }

      router.push(`/groups/${groupId}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Edit Group</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="small_group">Small Group</option>
                  <option value="ministry_team">Ministry Team</option>
                  <option value="class">Class</option>
                  <option value="committee">Committee</option>
                  <option value="prayer_group">Prayer Group</option>
                  <option value="bible_study">Bible Study</option>
                  <option value="youth_group">Youth Group</option>
                  <option value="kids_group">Kids Group</option>
                  <option value="mens_group">Men's Group</option>
                  <option value="womens_group">Women's Group</option>
                  <option value="support_group">Support Group</option>
                  <option value="service_team">Service Team</option>
                  <option value="worship_team">Worship Team</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Visibility</label>
                <select
                  className="input"
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              <div>
                <label className="label">Capacity (leave empty for unlimited)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                  className="mr-2"
                />
                <span>Open for new members</span>
              </label>
            </div>
          </div>
        </div>

        {/* Meeting Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Meeting Details</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Meeting Day</label>
                <select
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
                <label className="label">Meeting Time</label>
                <input
                  type="time"
                  className="input"
                  value={formData.meetingTime}
                  onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Cadence (e.g., "Weekly", "Bi-weekly", "Monthly")</label>
              <input
                type="text"
                className="input"
                value={formData.cadence}
                onChange={(e) => setFormData({ ...formData, cadence: e.target.value })}
                placeholder="Weekly"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  className="input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="123 Main St or Online"
                />
              </div>

              <div>
                <label className="label">Campus</label>
                <input
                  type="text"
                  className="input"
                  value={formData.campus}
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lifecycle */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Lifecycle</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="label">End Date</label>
              <input
                type="date"
                className="input"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Group Photo</h2>

          <div>
            <label className="label">Photo URL</label>
            <input
              type="url"
              className="input"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              placeholder="https://example.com/photo.jpg"
            />
            {formData.photoUrl && (
              <img
                src={formData.photoUrl}
                alt="Group preview"
                className="mt-2 w-32 h-32 object-cover rounded"
              />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.push(`/groups/${groupId}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
