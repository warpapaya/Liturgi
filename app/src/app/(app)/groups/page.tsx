'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    visibility: '',
    campus: '',
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchGroups()
  }, [filters])

  const fetchGroups = async () => {
    setLoading(true)

    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.category) params.append('category', filters.category)
    if (filters.visibility) params.append('visibility', filters.visibility)
    if (filters.campus) params.append('campus', filters.campus)
    if (search) params.append('search', search)

    const url = `/api/groups${params.toString() ? `?${params.toString()}` : ''}`

    try {
      const res = await fetch(url)
      const data = await res.json()
      setGroups(data.groups || [])
    } catch (err) {
      console.error('Failed to fetch groups:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchGroups()
  }

  const clearFilters = () => {
    setFilters({ status: '', category: '', visibility: '', campus: '' })
    setSearch('')
  }

  const filteredGroups = groups

  const stats = {
    total: filteredGroups.length,
    active: filteredGroups.filter(g => g.status === 'active').length,
    members: filteredGroups.reduce((sum, g) => sum + (g._count?.members || 0), 0),
    withMeetings: filteredGroups.filter(g => (g._count?.meetings || 0) > 0).length,
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
    kids_group: "Kids' Group",
    support_group: 'Support Group',
    other: 'Other',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="mt-1 text-gray-500">Manage small groups and teams</p>
        </div>
        <Link href="/groups/new" className="btn-primary">
          + Create Group
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm font-medium text-gray-500">Total Groups</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-500">Active Groups</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{stats.active}</div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-500">Total Members</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">{stats.members}</div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-500">With Scheduled Meetings</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">{stats.withMeetings}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search groups by name or description..."
              className="input flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="label">Visibility</label>
              <select
                className="input"
                value={filters.visibility}
                onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
              >
                <option value="">All Visibility</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div>
              <label className="label">Campus</label>
              <input
                type="text"
                placeholder="Filter by campus..."
                className="input"
                value={filters.campus}
                onChange={(e) => setFilters({ ...filters, campus: e.target.value })}
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center">
            <button onClick={clearFilters} className="text-sm text-gray-600 hover:text-gray-800">
              Clear all filters
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-600'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Groups Display */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading groups...</div>
      ) : filteredGroups.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No groups found.</p>
          {(search || filters.status || filters.category || filters.visibility || filters.campus) ? (
            <button onClick={clearFilters} className="btn-secondary">
              Clear filters
            </button>
          ) : (
            <Link href="/groups/new" className="btn-primary">
              Create your first group
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="card hover:shadow-lg transition-all"
            >
              {group.photoUrl && (
                <img
                  src={group.photoUrl}
                  alt={group.name}
                  className="w-full h-40 object-cover rounded-t-lg -mt-6 -mx-6 mb-4"
                />
              )}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900">{group.name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    group.status === 'active' ? 'bg-green-100 text-green-800' :
                    group.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {group.status}
                </span>
              </div>

              <div className="flex gap-2 mb-3">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {categoryLabels[group.category] || group.category}
                </span>
                {group.visibility === 'private' && (
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    🔒 Private
                  </span>
                )}
              </div>

              {group.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="text-sm text-gray-500 space-y-1">
                {group.meetingDay && (
                  <div>📅 {group.meetingDay}{group.meetingTime && ` at ${group.meetingTime}`}</div>
                )}
                {group.location && <div>📍 {group.location}</div>}
                {group.campus && <div>🏫 {group.campus}</div>}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                  <span>👥 {group._count?.members || 0} members</span>
                  {group.capacity && (
                    <span className="text-xs">Capacity: {group._count?.members || 0}/{group.capacity}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="card hover:shadow-lg transition-all flex items-center gap-4"
            >
              {group.photoUrl && (
                <img
                  src={group.photoUrl}
                  alt={group.name}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-lg text-gray-900">{group.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    group.status === 'active' ? 'bg-green-100 text-green-800' :
                    group.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {group.status}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {categoryLabels[group.category] || group.category}
                  </span>
                </div>
                {group.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">{group.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>👥 {group._count?.members || 0} members</span>
                  {group.meetingDay && <span>📅 {group.meetingDay}</span>}
                  {group.location && <span>📍 {group.location}</span>}
                  {group.campus && <span>🏫 {group.campus}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
