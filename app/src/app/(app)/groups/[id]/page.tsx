'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

type Tab = 'overview' | 'members' | 'meetings' | 'resources' | 'prayers' | 'discussion'

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  useEffect(() => {
    fetchGroup()
  }, [params.id])

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${params.id}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to load group')

      setGroup(data.group)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group')
    } finally {
      setLoading(false)
    }
  }

  const deleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      const res = await fetch(`/api/groups/${params.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete group')
      router.push('/groups')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete group')
    }
  }

  const duplicateGroup = async () => {
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${group.name} (Copy)`,
          description: group.description,
          category: group.category,
          visibility: group.visibility,
          capacity: group.capacity,
          location: group.location,
          campus: group.campus,
          meetingDay: group.meetingDay,
          meetingTime: group.meetingTime,
          cadence: group.cadence,
          isOpen: group.isOpen,
        }),
      })

      if (!res.ok) throw new Error('Failed to duplicate group')

      const data = await res.json()
      router.push(`/groups/${data.group.id}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to duplicate group')
    }
  }

  if (loading) return <div className="text-center py-12">Loading group...</div>

  if (error || !group) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Group not found'}</div>
        <Link href="/groups" className="btn-primary">Back to Groups</Link>
      </div>
    )
  }

  const categoryLabels: Record<string, string> = {
    small_group: 'Small Group',
    ministry_team: 'Ministry Team',
    bible_study: 'Bible Study',
    prayer_group: 'Prayer Group',
    youth_group: 'Youth Group',
    mens_group: "Men's Group",
    womens_group: "Women's Group",
    class: 'Class',
    committee: 'Committee',
    service_team: 'Service Team',
    worship_team: 'Worship Team',
    other: 'Other',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/groups" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          ← Back to Groups
        </Link>

        <div className="mt-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                group.status === 'active' ? 'bg-green-100 text-green-800' :
                group.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'
              }`}>
                {group.status?.toUpperCase()}
              </span>
              <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                {categoryLabels[group.category] || group.category}
              </span>
            </div>

            {(group.meetingDay || group.location) && (
              <div className="mt-2 flex flex-wrap gap-4 text-gray-600">
                {group.meetingDay && (
                  <span>📅 {group.meetingDay}{group.meetingTime && ` at ${group.meetingTime}`}</span>
                )}
                {group.location && <span>📍 {group.location}</span>}
                {group.campus && <span>🏫 {group.campus}</span>}
              </div>
            )}

            {group.capacity && (
              <div className="mt-2 text-sm text-gray-600">
                Capacity: {group._count?.members || 0} / {group.capacity}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Link href={`/groups/${group.id}/edit`} className="btn-secondary">
              Edit
            </Link>
            <button onClick={duplicateGroup} className="btn-secondary">
              Duplicate
            </button>
            <button onClick={deleteGroup} className="btn-danger">
              Delete
            </button>
          </div>
        </div>

        {group.description && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-gray-700">{group.description}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          {[
            { id: 'overview' as Tab, label: 'Overview', icon: '📊' },
            { id: 'members' as Tab, label: `Members (${group._count?.members || 0})`, icon: '👥' },
            { id: 'meetings' as Tab, label: `Meetings (${group._count?.meetings || 0})`, icon: '📅' },
            { id: 'resources' as Tab, label: `Resources (${group._count?.resources || 0})`, icon: '📚' },
            { id: 'prayers' as Tab, label: `Prayer Requests (${group._count?.prayerRequests || 0})`, icon: '🙏' },
            { id: 'discussion' as Tab, label: 'Discussion', icon: '💬' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab group={group} />}
      {activeTab === 'members' && <MembersTab group={group} onUpdate={fetchGroup} />}
      {activeTab === 'meetings' && <MeetingsTab group={group} onUpdate={fetchGroup} />}
      {activeTab === 'resources' && <ResourcesTab group={group} onUpdate={fetchGroup} />}
      {activeTab === 'prayers' && <PrayersTab group={group} onUpdate={fetchGroup} />}
      {activeTab === 'discussion' && <DiscussionTab group={group} onUpdate={fetchGroup} />}
    </div>
  )
}

// Overview Tab
function OverviewTab({ group }: { group: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Group Information</h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Category</dt>
            <dd className="text-sm text-gray-900">{group.category?.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="text-sm text-gray-900">{group.status}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Visibility</dt>
            <dd className="text-sm text-gray-900">{group.visibility}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Open for Members</dt>
            <dd className="text-sm text-gray-900">{group.isOpen ? 'Yes' : 'No'}</dd>
          </div>
          {group.capacity && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Capacity</dt>
              <dd className="text-sm text-gray-900">{group.capacity} members</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Meeting Details</h3>
        <dl className="space-y-2">
          {group.meetingDay && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Day</dt>
              <dd className="text-sm text-gray-900">{group.meetingDay}</dd>
            </div>
          )}
          {group.meetingTime && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Time</dt>
              <dd className="text-sm text-gray-900">{group.meetingTime}</dd>
            </div>
          )}
          {group.cadence && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Frequency</dt>
              <dd className="text-sm text-gray-900">{group.cadence}</dd>
            </div>
          )}
          {group.location && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="text-sm text-gray-900">{group.location}</dd>
            </div>
          )}
          {group.campus && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Campus</dt>
              <dd className="text-sm text-gray-900">{group.campus}</dd>
            </div>
          )}
        </dl>
      </div>

      {(group.startDate || group.endDate) && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Lifecycle</h3>
          <dl className="space-y-2">
            {group.startDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                <dd className="text-sm text-gray-900">
                  {format(new Date(group.startDate), 'MMMM d, yyyy')}
                </dd>
              </div>
            )}
            {group.endDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">End Date</dt>
                <dd className="text-sm text-gray-900">
                  {format(new Date(group.endDate), 'MMMM d, yyyy')}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Members</dt>
            <dd className="text-2xl font-bold text-gray-900">{group._count?.members || 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Total Meetings</dt>
            <dd className="text-2xl font-bold text-gray-900">{group._count?.meetings || 0}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Resources</dt>
            <dd className="text-2xl font-bold text-gray-900">{group._count?.resources || 0}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

// Members Tab
function MembersTab({ group, onUpdate }: { group: any; onUpdate: () => void }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [people, setPeople] = useState<any[]>([])
  const [formData, setFormData] = useState({
    personId: '',
    role: 'member',
    status: 'active',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/people')
      .then((res) => res.json())
      .then((data) => setPeople(data.people || []))
  }, [])

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/groups/${group.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to add member')

      setShowAddForm(false)
      setFormData({ personId: '', role: 'member', status: 'active', notes: '' })
      onUpdate()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  const removeMember = async (membershipId: string) => {
    if (!confirm('Remove this member?')) return

    try {
      const res = await fetch(`/api/groups/${group.id}/members/${membershipId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to remove member')
      onUpdate()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  const printRoster = () => {
    window.print()
  }

  const leaders = group.members?.filter((m: any) => ['leader', 'co_leader'].includes(m.role)) || []
  const regularMembers = group.members?.filter((m: any) => !['leader', 'co_leader'].includes(m.role)) || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Members ({group.members?.length || 0})</h2>
        <div className="flex gap-2">
          <button onClick={printRoster} className="btn-secondary">
            🖨️ Print Roster
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            {showAddForm ? 'Cancel' : '+ Add Member'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={addMember} className="card space-y-4">
          <h3 className="font-semibold">Add Member</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Person *</label>
              <select
                className="input"
                value={formData.personId}
                onChange={(e) => setFormData({ ...formData, personId: e.target.value })}
                required
              >
                <option value="">Select person...</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Role *</label>
              <select
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="member">Member</option>
                <option value="leader">Leader</option>
                <option value="co_leader">Co-Leader</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      )}

      {leaders.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Leaders</h3>
          <div className="space-y-2">
            {leaders.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {member.person.firstName} {member.person.lastName}
                  </h4>
                  {member.person.email && (
                    <p className="text-sm text-gray-500">{member.person.email}</p>
                  )}
                  {member.notes && (
                    <p className="text-sm text-gray-600 mt-1">{member.notes}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-primary-700">
                    {member.role.toUpperCase().replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {regularMembers.length > 0 && (
        <div className="card">
          {leaders.length > 0 && (
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Members</h3>
          )}
          <div className="space-y-2">
            {regularMembers.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {member.person.firstName} {member.person.lastName}
                  </h4>
                  {member.person.email && (
                    <p className="text-sm text-gray-500">{member.person.email}</p>
                  )}
                  {member.notes && (
                    <p className="text-sm text-gray-600 mt-1">{member.notes}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => removeMember(member.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {group.members?.length === 0 && (
        <div className="card text-center py-12 text-gray-500">
          No members yet. Add your first member to get started.
        </div>
      )}
    </div>
  )
}

// Meetings Tab
function MeetingsTab({ group, onUpdate }: { group: any; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [meetings, setMeetings] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
    isRecurring: false,
    notes: '',
  })

  useEffect(() => {
    fetch(`/api/groups/${group.id}/meetings`)
      .then((res) => res.json())
      .then((data) => setMeetings(data.meetings || []))
  }, [group.id])

  const createMeeting = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`/api/groups/${group.id}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create meeting')

      setShowForm(false)
      setFormData({ title: '', description: '', startTime: '', endTime: '', location: '', isRecurring: false, notes: '' })
      const data = await res.json()
      setMeetings([data.meeting, ...meetings])
      onUpdate()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create meeting')
    }
  }

  const cancelMeeting = async (meetingId: string) => {
    if (!confirm('Cancel this meeting?')) return

    try {
      const res = await fetch(`/api/groups/${group.id}/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCancelled: true }),
      })

      if (!res.ok) throw new Error('Failed to cancel meeting')
      setMeetings(meetings.map(m => m.id === meetingId ? { ...m, isCancelled: true } : m))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel meeting')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Meetings ({meetings.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Schedule Meeting'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createMeeting} className="card space-y-4">
          <h3 className="font-semibold">Schedule Meeting</h3>
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Time *</label>
              <input
                type="datetime-local"
                className="input"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">End Time</label>
              <input
                type="datetime-local"
                className="input"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Location</label>
            <input
              type="text"
              className="input"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary">Schedule Meeting</button>
        </form>
      )}

      <div className="space-y-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className={`card ${meeting.isCancelled ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{meeting.title}</h3>
                {meeting.isCancelled && (
                  <span className="text-sm text-red-600 font-semibold">CANCELLED</span>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  {format(new Date(meeting.startTime), 'EEEE, MMMM d, yyyy • h:mm a')}
                </p>
                {meeting.location && (
                  <p className="text-sm text-gray-600">📍 {meeting.location}</p>
                )}
                {meeting.description && (
                  <p className="text-gray-700 mt-2">{meeting.description}</p>
                )}
                {meeting._count && (
                  <p className="text-sm text-gray-500 mt-2">
                    Attendance: {meeting._count.attendance} recorded
                  </p>
                )}
              </div>
              {!meeting.isCancelled && (
                <button onClick={() => cancelMeeting(meeting.id)} className="text-sm text-red-600 hover:text-red-800">
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
        {meetings.length === 0 && (
          <div className="card text-center py-12 text-gray-500">
            No meetings scheduled yet.
          </div>
        )}
      </div>
    </div>
  )
}

// Resources Tab
function ResourcesTab({ group, onUpdate }: { group: any; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [resources, setResources] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    url: '',
  })

  useEffect(() => {
    fetch(`/api/groups/${group.id}/resources`)
      .then((res) => res.json())
      .then((data) => setResources(data.resources || []))
  }, [group.id])

  const createResource = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`/api/groups/${group.id}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create resource')

      setShowForm(false)
      setFormData({ title: '', description: '', type: 'document', url: '' })
      const data = await res.json()
      setResources([data.resource, ...resources])
      onUpdate()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create resource')
    }
  }

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Delete this resource?')) return

    try {
      const res = await fetch(`/api/groups/${group.id}/resources/${resourceId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete resource')
      setResources(resources.filter(r => r.id !== resourceId))
      onUpdate()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete resource')
    }
  }

  const typeIcons: Record<string, string> = {
    document: '📄',
    video: '🎥',
    audio: '🎵',
    link: '🔗',
    curriculum: '📚',
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Resources ({resources.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Resource'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createResource} className="card space-y-4">
          <h3 className="font-semibold">Add Resource</h3>
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type *</label>
              <select
                className="input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="link">Link</option>
                <option value="curriculum">Curriculum</option>
              </select>
            </div>
            <div>
              <label className="label">URL *</label>
              <input
                type="url"
                className="input"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary">Add Resource</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource) => (
          <div key={resource.id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{typeIcons[resource.type] || '📄'}</span>
                  <h3 className="font-semibold">{resource.title}</h3>
                </div>
                {resource.description && (
                  <p className="text-sm text-gray-600 mt-2">{resource.description}</p>
                )}
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                >
                  Open Resource →
                </a>
              </div>
              <button
                onClick={() => deleteResource(resource.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {resources.length === 0 && (
          <div className="col-span-2 card text-center py-12 text-gray-500">
            No resources yet. Add study materials, videos, or links.
          </div>
        )}
      </div>
    </div>
  )
}

// Prayer Requests Tab
function PrayersTab({ group, onUpdate }: { group: any; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [prayers, setPrayers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPrivate: false,
  })

  useEffect(() => {
    fetch(`/api/groups/${group.id}/prayer-requests`)
      .then((res) => res.json())
      .then((data) => setPrayers(data.prayerRequests || []))
  }, [group.id])

  const createPrayer = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch(`/api/groups/${group.id}/prayer-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create prayer request')

      setShowForm(false)
      setFormData({ title: '', content: '', isPrivate: false })
      const data = await res.json()
      setPrayers([data.prayerRequest, ...prayers])
      onUpdate()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create prayer request')
    }
  }

  const markAnswered = async (prayerId: string) => {
    try {
      const res = await fetch(`/api/groups/${group.id}/prayer-requests/${prayerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAnswered: true }),
      })

      if (!res.ok) throw new Error('Failed to mark as answered')
      setPrayers(prayers.map(p => p.id === prayerId ? { ...p, isAnswered: true, answeredAt: new Date().toISOString() } : p))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as answered')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Prayer Requests ({prayers.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Add Prayer Request'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createPrayer} className="card space-y-4">
          <h3 className="font-semibold">Add Prayer Request</h3>
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Request *</label>
            <textarea
              className="input"
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
            />
            <span className="text-sm">Private (leaders only)</span>
          </label>
          <button type="submit" className="btn-primary">Submit Request</button>
        </form>
      )}

      <div className="space-y-4">
        {prayers.map((prayer) => (
          <div key={prayer.id} className={`card ${prayer.isAnswered ? 'bg-green-50 border-green-200' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{prayer.title}</h3>
                  {prayer.isPrivate && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">Private</span>
                  )}
                  {prayer.isAnswered && (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-semibold">
                      ✓ Answered
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mt-2">{prayer.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {format(new Date(prayer.createdAt), 'MMM d, yyyy')}
                  {prayer.answeredAt && ` • Answered ${format(new Date(prayer.answeredAt), 'MMM d, yyyy')}`}
                </p>
              </div>
              {!prayer.isAnswered && (
                <button
                  onClick={() => markAnswered(prayer.id)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Mark Answered
                </button>
              )}
            </div>
          </div>
        ))}
        {prayers.length === 0 && (
          <div className="card text-center py-12 text-gray-500">
            No prayer requests yet. Share a request with the group.
          </div>
        )}
      </div>
    </div>
  )
}

// Discussion Tab
function DiscussionTab({ group, onUpdate }: { group: any; onUpdate: () => void }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/groups/${group.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) throw new Error('Failed to post comment')

      setContent('')
      onUpdate()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Discussion</h2>

      <form onSubmit={postComment} className="card space-y-4">
        <div>
          <label className="label">Add a comment</label>
          <textarea
            className="input"
            rows={4}
            placeholder="Share an update, ask a question, or start a discussion..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading || !content.trim()} className="btn-primary">
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      <div className="space-y-4">
        {group.comments?.map((comment: any) => (
          <div key={comment.id} className="card">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                {comment.userId.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">User</span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
        {group.comments?.length === 0 && (
          <div className="card text-center py-12 text-gray-500">
            No comments yet. Start the conversation!
          </div>
        )}
      </div>
    </div>
  )
}
