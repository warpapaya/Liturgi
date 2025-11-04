'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Tag {
  id: string
  name: string
  color?: string
  description?: string
  category?: {
    id: string
    name: string
  }
  _count: {
    personTags: number
  }
}

interface TagCategory {
  id: string
  name: string
  color?: string
  description?: string
  _count: {
    tags: number
  }
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [categories, setCategories] = useState<TagCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTagModal, setShowNewTagModal] = useState(false)
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/tags').then(r => r.json()),
      fetch('/api/tags/categories').then(r => r.json())
    ])
      .then(([tagsData, categoriesData]) => {
        setTags(tagsData.tags || [])
        setCategories(categoriesData.categories || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCreateTag = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          color: formData.get('color'),
          description: formData.get('description'),
          categoryId: formData.get('categoryId') || null,
        }),
      })

      if (res.ok) {
        const { tag } = await res.json()
        setTags([...tags, tag])
        setShowNewTagModal(false)
      } else {
        alert('Failed to create tag')
      }
    } catch (error) {
      alert('Failed to create tag')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch('/api/tags/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          color: formData.get('color'),
          description: formData.get('description'),
        }),
      })

      if (res.ok) {
        const { category } = await res.json()
        setCategories([...categories, category])
        setShowNewCategoryModal(false)
      } else {
        alert('Failed to create category')
      }
    } catch (error) {
      alert('Failed to create category')
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags & Categories</h1>
          <p className="mt-1 text-gray-600">Organize your people with tags and categories</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => setShowNewCategoryModal(true)} className="btn-secondary">
            New Category
          </button>
          <button onClick={() => setShowNewTagModal(true)} className="btn-primary">
            New Tag
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Categories ({categories.length})</h2>
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No categories yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    )}
                  </div>
                  {category.color && (
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {category._count.tags} tag{category._count.tags !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Tags ({tags.length})</h2>
        {tags.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tags yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">People</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tags.map((tag) => (
                  <tr key={tag.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: tag.color || '#e5e7eb',
                          color: tag.color ? '#fff' : '#374151'
                        }}
                      >
                        {tag.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tag.category?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tag.description || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tag._count.personTags}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Tag Modal */}
      {showNewTagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Create New Tag</h3>
            <form onSubmit={handleCreateTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input type="text" name="name" required className="input mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select name="categoryId" className="input mt-1">
                  <option value="">None</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <input type="color" name="color" className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" className="input mt-1" rows={3} />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowNewTagModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input type="text" name="name" required className="input mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <input type="color" name="color" className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" className="input mt-1" rows={3} />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowNewCategoryModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
