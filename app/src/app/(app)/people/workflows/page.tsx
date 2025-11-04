'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Workflow {
  id: string
  name: string
  description?: string
  status: string
  _count: {
    instances: number
  }
  createdAt: string
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/workflows')
      .then(r => r.json())
      .then(data => setWorkflows(data.workflows || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="mt-1 text-gray-600">Automate your people processes</p>
        </div>
        <button className="btn-primary">New Workflow</button>
      </div>

      <div className="card">
        {workflows.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No workflows yet</p>
            <button className="btn-primary">Create your first workflow</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-4 hover:border-primary-500 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg">{workflow.name}</h3>
                  <span className={`badge badge-sm ${
                    workflow.status === 'active' ? 'badge-success' :
                    workflow.status === 'paused' ? 'badge-warning' :
                    'badge'
                  }`}>
                    {workflow.status}
                  </span>
                </div>
                {workflow.description && (
                  <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {workflow._count.instances} instance{workflow._count.instances !== 1 ? 's' : ''}
                  </span>
                  <Link href={`/people/workflows/${workflow.id}`} className="text-primary-600 hover:text-primary-900">
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
