'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface ServicePlan {
  id: string
  name: string
  date: string
  campus: string | null
  _count: {
    items: number
    assignments: number
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServicePlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => setServices(data.servicePlans || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Plans</h1>
          <p className="mt-1 text-body text-gray-600">Plan and manage your worship services</p>
        </div>
        <Link href="/services/new" className="btn-primary">
          Create Service Plan
        </Link>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-body text-gray-600">Looks quiet here — try adding your first service plan.</p>
            <Link href="/services/new" className="mt-4 inline-block btn-primary">
              Create Service Plan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="block p-4 border border-ash rounded-liturgi hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(service.date), 'EEEE, MMMM d, yyyy')}
                      {service.campus && ` • ${service.campus}`}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{service._count.items} items</div>
                    <div>{service._count.assignments} assignments</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
