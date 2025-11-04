'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  role: string
  firstName: string | null
  lastName: string | null
}

interface Organization {
  id: string
  name: string
  subdomain: string
  plan: string
  logoUrl: string | null
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
          setOrg(data.organization)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return null
  }

  if (!user) {
    return null
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/people', label: 'People' },
    { href: '/services', label: 'Service Plans' },
    { href: '/songs', label: 'Songs' },
    { href: '/groups', label: 'Groups' },
    { href: '/settings', label: 'Settings' },
  ]

  return (
    <nav className="bg-primary-600 shadow-sm border-b border-primary-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-white">
                {org?.name || 'Liturgi'}
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold ${
                    pathname.startsWith(item.href)
                      ? 'border-gold-400 text-white'
                      : 'border-transparent text-primary-100 hover:border-primary-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-primary-50">
              {user.firstName} {user.lastName}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-liturgi text-xs font-medium bg-gold-500 text-white">
              {user.role}
            </span>
            <button onClick={handleLogout} className="px-4 py-2 rounded-liturgi text-sm font-semibold text-primary-600 bg-white hover:bg-gray-100 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
