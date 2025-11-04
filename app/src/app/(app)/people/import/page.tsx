'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ImportPeoplePage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/people/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Import failed')
        return
      }

      setSuccess(`Successfully imported ${data.imported} people!`)
      setTimeout(() => {
        router.push('/people')
        router.refresh()
      }, 2000)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/people" className="text-primary-600 hover:text-primary-500 text-sm">
          ← Back to People
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Import People from CSV</h1>
      </div>

      <div className="card space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">CSV Format</h2>
          <p className="text-sm text-gray-600 mb-3">
            Your CSV file should include the following columns:
          </p>
          <code className="block bg-gray-100 p-3 rounded text-xs">
            firstName,lastName,email,phone,tags,notes,status
          </code>
          <p className="mt-2 text-sm text-gray-600">
            <strong>Note:</strong> Tags should be a JSON array like{' '}
            <code>["Volunteer","Music"]</code>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="file" className="label">
              Select CSV File
            </label>
            <input
              id="file"
              type="file"
              accept=".csv"
              required
              className="input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Link href="/people" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading || !file} className="btn-primary">
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
