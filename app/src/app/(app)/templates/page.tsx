'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Template {
  id: string
  name: string
  description: string | null
  template: any[]
  isDefault: boolean
  _count?: {
    servicePlans: number
  }
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates')
      const data = await res.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the template "${name}"?`)) return

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete template')
      }

      fetchTemplates()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete template')
    }
  }

  const setDefaultTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to set default template')
      }

      fetchTemplates()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to set default template')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Templates</h1>
          <p className="mt-1 text-body text-gray-600">
            Create reusable templates for your services
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          Create Template
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-body text-gray-600">
              No templates yet. Create your first template to speed up service planning.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 inline-block btn-primary"
            >
              Create Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      {template.isDefault && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                          Default
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span>{template.template.length} items</span>
                      {template._count && (
                        <span>Used {template._count.servicePlans} times</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!template.isDefault && (
                      <button
                        onClick={() => setDefaultTemplate(template.id)}
                        className="text-sm text-primary-600 hover:text-primary-700 px-2 py-1"
                      >
                        Set as Default
                      </button>
                    )}
                    <Link
                      href={`/templates/${template.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 px-2 py-1"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteTemplate(template.id, template.name)}
                      className="text-sm text-red-600 hover:text-red-700 px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateForm && (
        <CreateTemplateForm
          onSuccess={() => {
            setShowCreateForm(false)
            fetchTemplates()
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  )
}

// Create Template Form Component
function CreateTemplateForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          description: formData.description || null,
          template: [], // Start with empty template
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create template')
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Template</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="label">
              Template Name *
            </label>
            <input
              type="text"
              id="name"
              className="input"
              placeholder="Sunday Morning Service"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              className="input"
              rows={3}
              placeholder="Describe this template..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Create Template'}
            </button>
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
