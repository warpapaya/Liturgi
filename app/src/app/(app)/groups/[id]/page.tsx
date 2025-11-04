'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

interface Member {
  id: string
  role: 'leader' | 'member'
  createdAt: string
  person: Person
}

interface Comment {
  id: string
  userId: string
  content: string
  createdAt: string
}

interface Group {
  id: string
  name: string
  description: string | null
  cadence: string | null
  location: string | null
  isOpen: boolean
  members: Member[]
  comments: Comment[]
}

interface User {
  id: string
  firstName: string
  lastName: string
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [showCommentForm, setShowCommentForm] = useState(false)

  useEffect(() => {
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchData = async () => {
    try {
      const [groupRes, userRes] = await Promise.all([
        fetch(`/api/groups/${params.id}`),
        fetch('/api/auth/me'),
      ])

      const groupData = await groupRes.json()
      const userData = await userRes.json()

      if (!groupRes.ok) {
        throw new Error(groupData.error || 'Failed to load group')
      }

      setGroup(groupData.group)
      setCurrentUser(userData.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group')
    } finally {
      setLoading(false)
    }
  }

  const deleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      const res = await fetch(`/api/groups/${params.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete group')
      }

      router.push('/groups')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete group')
    }
  }

  const removeMember = async (membershipId: string) => {
    if (!confirm('Remove this member from the group?')) return

    try {
      // We'll need to add a DELETE endpoint for this
      alert('Member removal will be implemented with DELETE endpoint')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading group...</div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'Group not found'}</div>
        <Link href="/groups" className="btn-primary">
          Back to Groups
        </Link>
      </div>
    )
  }

  const leaders = group.members.filter(m => m.role === 'leader')
  const regularMembers = group.members.filter(m => m.role === 'member')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/groups" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          ← Back to Groups
        </Link>
        <div className="mt-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  group.isOpen
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {group.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
            {(group.cadence || group.location) && (
              <div className="mt-2 flex gap-4 text-gray-600">
                {group.cadence && <span>📅 {group.cadence}</span>}
                {group.location && <span>📍 {group.location}</span>}
              </div>
            )}
          </div>
          <button onClick={deleteGroup} className="btn-danger">
            Delete Group
          </button>
        </div>
        {group.description && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-gray-700">{group.description}</p>
          </div>
        )}
      </div>

      {/* Members */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Members ({group.members.length})
          </h2>
          <button
            onClick={() => setShowMemberForm(true)}
            className="btn-primary"
          >
            Add Member
          </button>
        </div>

        {group.members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No members yet. Add your first member to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Leaders */}
            {leaders.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Leaders</h3>
                <div className="space-y-2">
                  {leaders.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-primary-50"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {member.person.firstName} {member.person.lastName}
                        </h4>
                        {member.person.email && (
                          <p className="text-sm text-gray-500">{member.person.email}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary-700">LEADER</span>
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

            {/* Regular Members */}
            {regularMembers.length > 0 && (
              <div>
                {leaders.length > 0 && (
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Members</h3>
                )}
                <div className="space-y-2">
                  {regularMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {member.person.firstName} {member.person.lastName}
                        </h4>
                        {member.person.email && (
                          <p className="text-sm text-gray-500">{member.person.email}</p>
                        )}
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
          </div>
        )}

        {/* Add Member Form */}
        {showMemberForm && (
          <AddMemberForm
            groupId={group.id}
            onSuccess={() => {
              setShowMemberForm(false)
              fetchData()
            }}
            onCancel={() => setShowMemberForm(false)}
          />
        )}
      </div>

      {/* Discussion */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Discussion ({group.comments.length})
          </h2>
        </div>

        {/* Comment Form */}
        <div className="mb-6">
          <CommentForm
            groupId={group.id}
            currentUser={currentUser}
            onSuccess={() => {
              fetchData()
            }}
          />
        </div>

        {/* Comments List */}
        {group.comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-t border-gray-200">
            No comments yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4 border-t border-gray-200 pt-6">
            {group.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                  {comment.userId.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {comment.userId === currentUser?.id ? 'You' : 'User'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Add Member Form Component
function AddMemberForm({
  groupId,
  onSuccess,
  onCancel,
}: {
  groupId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [people, setPeople] = useState<any[]>([])
  const [formData, setFormData] = useState({
    personId: '',
    role: 'member' as 'leader' | 'member',
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
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add member')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border-2 border-primary-200 rounded-lg bg-primary-50 space-y-4">
      <h3 className="font-semibold text-gray-900">Add Member</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

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

      <div>
        <label htmlFor="role" className="label">
          Role *
        </label>
        <select
          id="role"
          className="input"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          required
        >
          <option value="member">Member</option>
          <option value="leader">Leader</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Adding...' : 'Add Member'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}

// Comment Form Component
function CommentForm({
  groupId,
  currentUser,
  onSuccess,
}: {
  groupId: string
  currentUser: User | null
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/groups/${groupId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add comment')
      }

      setContent('')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="comment" className="label">
          Add a comment
        </label>
        <textarea
          id="comment"
          className="input"
          rows={3}
          placeholder="Share an update, prayer request, or discussion topic..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={loading || !content.trim()} className="btn-primary">
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}
