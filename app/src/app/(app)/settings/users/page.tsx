'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface User {
  id: string
  email: string
  role: string
  firstName: string | null
  lastName: string | null
  createdAt: string
  lastLoginAt: string | null
}

interface Invite {
  id: string
  email: string
  role: string
  code: string
  expiresAt: string
  acceptedAt: string | null
  createdAt: string
  inviter: {
    firstName: string | null
    lastName: string | null
    email: string
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, invitesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/invites'),
      ])

      const usersData = await usersRes.json()
      const invitesData = await invitesRes.json()

      if (usersRes.ok) setUsers(usersData.users || [])
      if (invitesRes.ok) setInvites(invitesData.invites || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const pendingInvites = invites.filter(
    (inv) => !inv.acceptedAt && new Date(inv.expiresAt) > new Date()
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'leader':
        return 'bg-blue-100 text-blue-800'
      case 'member':
        return 'bg-green-100 text-green-800'
      case 'viewer':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/settings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          ← Back to Settings
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-1 text-gray-500">Manage users and send invitations</p>
          </div>
          <button
            onClick={() => setShowInviteForm(true)}
            className="btn-primary"
          >
            Invite User
          </button>
        </div>
      </div>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Invites ({pendingInvites.length})
          </h2>
          <div className="space-y-3">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 border border-yellow-200 bg-yellow-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">{invite.email}</div>
                  <div className="text-sm text-gray-500">
                    Invited by {invite.inviter.firstName} {invite.inviter.lastName} •{' '}
                    {format(new Date(invite.createdAt), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(invite.role)}`}>
                    {invite.role}
                  </span>
                  <button
                    onClick={() => {
                      const inviteUrl = `${window.location.origin}/register?invite=${invite.code}`
                      navigator.clipboard.writeText(inviteUrl)
                      alert('Invite link copied to clipboard!')
                    }}
                    className="text-sm text-primary-600 hover:text-primary-800"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Users ({users.length})
        </h2>
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : 'Unnamed User'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt
                        ? format(new Date(user.lastLoginAt), 'MMM d, yyyy')
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <InviteForm
          onSuccess={() => {
            setShowInviteForm(false)
            fetchData()
          }}
          onCancel={() => setShowInviteForm(false)}
        />
      )}
    </div>
  )
}

function InviteForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    role: 'member' as 'admin' | 'leader' | 'member' | 'viewer',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create invite')
      }

      const url = `${window.location.origin}/register?invite=${data.invite.code}`
      setInviteUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invite')
    } finally {
      setLoading(false)
    }
  }

  if (inviteUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Sent!</h3>
          <p className="text-gray-600 mb-4">
            Share this invite link with the new user:
          </p>
          <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4">
            <code className="text-sm text-gray-800 break-all">{inviteUrl}</code>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteUrl)
                alert('Copied to clipboard!')
              }}
              className="btn-primary"
            >
              Copy Link
            </button>
            <button onClick={onSuccess} className="btn-secondary">
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Invite User</h3>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            className="input"
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
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
            <option value="viewer">Viewer - Read-only access</option>
            <option value="member">Member - Can view and accept assignments</option>
            <option value="leader">Leader - Can manage people, services, and groups</option>
            <option value="admin">Admin - Full access to all settings</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
