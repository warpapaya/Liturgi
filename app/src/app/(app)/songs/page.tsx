'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Arrangement {
  id: string
  name: string
  key: string
}

interface Song {
  id: string
  title: string
  artist: string | null
  ccliNumber: string | null
  bpm: number | null
  timeSignature: string | null
  tags: string[]
  arrangements: Arrangement[]
  _count: {
    serviceItems: number
  }
}

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Load songs
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchDebounced) params.set('search', searchDebounced)

    fetch(`/api/songs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setSongs(data.songs || []))
      .finally(() => setLoading(false))
  }, [searchDebounced])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Songs & Arrangements</h1>
          <p className="mt-1 text-body text-gray-600">Your music library for worship planning</p>
        </div>
        <Link href="/songs/new" className="btn-primary">
          Add Song
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search songs by title or artist..."
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : songs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-body text-gray-600">
              {search ? 'No songs found matching your search.' : 'Looks quiet here — try adding your first song.'}
            </p>
            {!search && (
              <Link href="/songs/new" className="mt-4 inline-block btn-primary">
                Add Song
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {songs.map((song) => (
              <Link
                key={song.id}
                href={`/songs/${song.id}`}
                className="block p-4 border border-ash rounded-liturgi hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">{song.title}</h3>
                {song.artist && (
                  <p className="text-sm text-gray-600 mt-1">{song.artist}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {song.bpm && (
                    <span className="badge-info text-xs">
                      {song.bpm} BPM
                    </span>
                  )}
                  {song.timeSignature && (
                    <span className="badge-info text-xs">
                      {song.timeSignature}
                    </span>
                  )}
                  {song.arrangements.length > 0 && (
                    <span className="badge-success text-xs">
                      {song.arrangements.length} arrangement{song.arrangements.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {song.tags && song.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(song.tags as string[]).slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-liturgi"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  Used in {song._count.serviceItems} service{song._count.serviceItems !== 1 ? 's' : ''}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
