'use client'

import { useEffect, useState } from 'react'

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
}

interface SongBrowserModalProps {
  onSelect: (song: Song, arrangement?: Arrangement) => void
  onCancel: () => void
}

export default function SongBrowserModal({ onSelect, onCancel }: SongBrowserModalProps) {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)

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

  const handleSelectSong = (song: Song) => {
    if (song.arrangements.length > 0) {
      // Show arrangement selection if song has arrangements
      setSelectedSong(song)
    } else {
      // No arrangements, just select the song
      onSelect(song)
    }
  }

  const handleSelectArrangement = (arrangement: Arrangement) => {
    if (selectedSong) {
      onSelect(selectedSong, arrangement)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedSong ? `Select Arrangement for "${selectedSong.title}"` : 'Select a Song'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {!selectedSong && (
            <input
              type="text"
              placeholder="Search songs by title or artist..."
              className="input w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedSong ? (
            // Show arrangements for selected song
            <div className="space-y-3">
              <button
                onClick={() => setSelectedSong(null)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4"
              >
                ← Back to songs
              </button>

              {selectedSong.arrangements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No arrangements available for this song.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {selectedSong.arrangements.map((arrangement) => (
                    <button
                      key={arrangement.id}
                      onClick={() => handleSelectArrangement(arrangement)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900">{arrangement.name}</div>
                      <div className="text-sm text-gray-600 mt-1">Key: {arrangement.key}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Show song list
            <>
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading songs...</div>
              ) : songs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {search ? 'No songs found matching your search.' : 'No songs in your library yet.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {songs.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => handleSelectSong(song)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
                    >
                      <h3 className="font-semibold text-gray-900">{song.title}</h3>
                      {song.artist && (
                        <p className="text-sm text-gray-600 mt-1">{song.artist}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-2">
                        {song.bpm && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {song.bpm} BPM
                          </span>
                        )}
                        {song.timeSignature && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {song.timeSignature}
                          </span>
                        )}
                        {song.arrangements.length > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                            {song.arrangements.length} arrangement{song.arrangements.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {song.tags && song.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(song.tags as string[]).slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button onClick={onCancel} className="btn-secondary w-full">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
