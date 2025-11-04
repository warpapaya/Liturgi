'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface TemplateItem {
  type: 'song' | 'element' | 'note'
  title: string
  durationSec?: number
  notes?: string
}

interface Template {
  id: string
  name: string
  description: string | null
  template: TemplateItem[]
  isDefault: boolean
}

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: [] as TemplateItem[],
  })
  const [showItemForm, setShowItemForm] = useState(false)

  useEffect(() => {
    fetchTemplate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const fetchTemplate = async () => {
    try {
      const res = await fetch(`/api/templates/${params.id}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load template')
      }

      setTemplate(data.template)
      setFormData({
        name: data.template.name,
        description: data.template.description || '',
        items: data.template.template || [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/templates/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          template: formData.items,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update template')
      }

      router.push('/templates')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template')
    } finally {
      setSaving(false)
    }
  }

  const addItem = (item: TemplateItem) => {
    setFormData({
      ...formData,
      items: [...formData.items, item],
    })
    setShowItemForm(false)
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...formData.items]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex < 0 || newIndex >= newItems.length) return

    const temp = newItems[index]
    newItems[index] = newItems[newIndex]
    newItems[newIndex] = temp

    setFormData({ ...formData, items: newItems })
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'song': return '🎵'
      case 'element': return '📖'
      case 'note': return '📝'
      default: return '•'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading template...</div>
      </div>
    )
  }

  if (error && !template) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Link href="/templates" className="btn-primary">
          Back to Templates
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/templates" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          ← Back to Templates
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Edit Template</h1>
        <p className="mt-1 text-body text-gray-600">Customize your service template</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="card space-y-6">
        <div>
          <label htmlFor="name" className="label">
            Template Name *
          </label>
          <input
            type="text"
            id="name"
            className="input"
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
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe when to use this template..."
          />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Template Items</h2>
          <button
            onClick={() => setShowItemForm(true)}
            className="btn-primary"
          >
            Add Item
          </button>
        </div>

        {formData.items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No items yet. Add items to define your template structure.
          </div>
        ) : (
          <div className="space-y-2">
            {formData.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="text-2xl">{getItemIcon(item.type)}</div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  {item.notes && (
                    <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDuration(item.durationSec)}
                </div>
                <div className="text-xs text-gray-400 uppercase">
                  {item.type}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="text-gray-600 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === formData.items.length - 1}
                    className="text-gray-600 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showItemForm && (
          <AddItemForm
            onAdd={addItem}
            onCancel={() => setShowItemForm(false)}
          />
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !formData.name}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Template'}
        </button>
        <Link href="/templates" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </div>
  )
}

// Add Item Form Component
function AddItemForm({
  onAdd,
  onCancel,
}: {
  onAdd: (item: TemplateItem) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<TemplateItem>({
    type: 'song',
    title: '',
    durationSec: 0,
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      type: formData.type,
      title: formData.title,
      durationSec: formData.durationSec,
      notes: formData.notes || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border-2 border-primary-200 rounded-lg bg-primary-50 space-y-4">
      <h3 className="font-semibold text-gray-900">Add Template Item</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="label">
            Type *
          </label>
          <select
            id="type"
            className="input"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            required
          >
            <option value="song">Song</option>
            <option value="element">Element</option>
            <option value="note">Note</option>
          </select>
        </div>

        <div>
          <label htmlFor="duration" className="label">
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            className="input"
            min="0"
            value={Math.floor((formData.durationSec || 0) / 60)}
            onChange={(e) => setFormData({ ...formData, durationSec: parseInt(e.target.value || '0') * 60 })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="title" className="label">
          Title *
        </label>
        <input
          type="text"
          id="title"
          className="input"
          placeholder="e.g., Opening Song, Scripture Reading, Offering"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label htmlFor="notes" className="label">
          Notes
        </label>
        <textarea
          id="notes"
          className="input"
          rows={2}
          placeholder="Any notes or instructions for this item..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          Add Item
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
