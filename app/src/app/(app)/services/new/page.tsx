'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { showToast } from '@/components/Toast'

interface Template {
  id: string
  name: string
  description: string | null
  template: any[]
  isDefault: boolean
}

export default function NewServicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    campus: '',
    notes: '',
  })

  useEffect(() => {
    // Load templates
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
      .catch((err) => console.error('Failed to load templates:', err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Convert datetime-local to ISO string
      const date = new Date(formData.date).toISOString()

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          date,
          campus: formData.campus || null,
          notes: formData.notes || null,
          templateId: selectedTemplate || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create service plan')
      }

      showToast('Service plan created successfully!', 'success')
      router.push(`/services/${data.servicePlan.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/services" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          ← Back to Service Plans
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Create Service Plan</h1>
        <p className="mt-1 text-body text-gray-600">Plan a new worship service or event</p>
      </div>

      {/* Template Selector */}
      {templates.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Start from a template (optional)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Blank option */}
            <button
              type="button"
              onClick={() => setSelectedTemplate(null)}
              className={`p-4 border-2 rounded-liturgi text-left transition-all ${
                selectedTemplate === null
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-ash hover:border-primary-300'
              }`}
            >
              <div className="font-semibold text-gray-900">Start from scratch</div>
              <div className="text-sm text-gray-600 mt-1">Build your own service plan</div>
            </button>

            {/* Template options */}
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 border-2 rounded-liturgi text-left transition-all ${
                  selectedTemplate === template.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-ash hover:border-primary-300'
                }`}
              >
                <div className="font-semibold text-gray-900">{template.name}</div>
                {template.description && (
                  <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {template.template.length} items
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="label">
            Service Name *
          </label>
          <input
            type="text"
            id="name"
            className="input"
            placeholder="Sunday Morning Service"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value })
              if (error) setError('')
            }}
            required
          />
        </div>

        <div>
          <label htmlFor="date" className="label">
            Date & Time *
          </label>
          <input
            type="datetime-local"
            id="date"
            className="input"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="campus" className="label">
            Campus / Location
          </label>
          <input
            type="text"
            id="campus"
            className="input"
            placeholder="Main Campus"
            value={formData.campus}
            onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="notes" className="label">
            Notes
          </label>
          <textarea
            id="notes"
            className="input"
            rows={4}
            placeholder="Any special notes or instructions..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Service Plan'}
          </button>
          <Link href="/services" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
