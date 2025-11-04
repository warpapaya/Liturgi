'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Person {
  id: string
  firstName: string
  lastName: string
  birthDate?: string
  anniversary?: string
  photoUrl?: string
}

export default function BirthdaysPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'birthdays' | 'anniversaries'>('birthdays')

  useEffect(() => {
    fetch('/api/people')
      .then(r => r.json())
      .then(data => setPeople(data.people || []))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date()
  const thisMonth = today.getMonth()
  const thisDay = today.getDate()

  const upcomingBirthdays = people
    .filter(p => p.birthDate)
    .map(p => {
      const birthDate = new Date(p.birthDate!)
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return { ...p, birthDate: p.birthDate!, daysUntil, date: thisYearBirthday }
    })
    .filter(p => p.daysUntil >= 0 && p.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  const upcomingAnniversaries = people
    .filter(p => p.anniversary)
    .map(p => {
      const anniversary = new Date(p.anniversary!)
      const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate())
      const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return { ...p, anniversary: p.anniversary!, daysUntil, date: thisYearAnniversary }
    })
    .filter(p => p.daysUntil >= 0 && p.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)

  const todaysBirthdays = upcomingBirthdays.filter(p => p.daysUntil === 0)
  const todaysAnniversaries = upcomingAnniversaries.filter(p => p.daysUntil === 0)

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Birthdays & Anniversaries</h1>
        <p className="mt-1 text-gray-600">Celebrate special occasions with your people</p>
      </div>

      {/* Today's Celebrations */}
      {(todaysBirthdays.length > 0 || todaysAnniversaries.length > 0) && (
        <div className="card bg-primary-50 border-primary-200">
          <h2 className="text-xl font-semibold text-primary-900 mb-4">🎉 Today's Celebrations</h2>
          <div className="space-y-2">
            {todaysBirthdays.map((person) => (
              <Link
                key={person.id}
                href={`/people/${person.id}`}
                className="block p-3 bg-white rounded-lg hover:bg-primary-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-semibold">
                    {person.firstName[0]}{person.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium">{person.firstName} {person.lastName}</p>
                    <p className="text-sm text-gray-600">🎂 Birthday today!</p>
                  </div>
                </div>
              </Link>
            ))}
            {todaysAnniversaries.map((person) => (
              <Link
                key={person.id}
                href={`/people/${person.id}`}
                className="block p-3 bg-white rounded-lg hover:bg-primary-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-semibold">
                    {person.firstName[0]}{person.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium">{person.firstName} {person.lastName}</p>
                    <p className="text-sm text-gray-600">💍 Anniversary today!</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex space-x-2">
        <button
          onClick={() => setView('birthdays')}
          className={`px-4 py-2 rounded-lg font-medium ${
            view === 'birthdays'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Birthdays ({upcomingBirthdays.length})
        </button>
        <button
          onClick={() => setView('anniversaries')}
          className={`px-4 py-2 rounded-lg font-medium ${
            view === 'anniversaries'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Anniversaries ({upcomingAnniversaries.length})
        </button>
      </div>

      {/* Upcoming List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">
          Upcoming {view === 'birthdays' ? 'Birthdays' : 'Anniversaries'} (Next 30 Days)
        </h2>
        {(view === 'birthdays' ? upcomingBirthdays : upcomingAnniversaries).length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No upcoming {view === 'birthdays' ? 'birthdays' : 'anniversaries'} in the next 30 days
          </p>
        ) : (
          <div className="space-y-2">
            {(view === 'birthdays' ? upcomingBirthdays : upcomingAnniversaries).map((person) => (
              <Link
                key={person.id}
                href={`/people/${person.id}`}
                className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                      {person.firstName[0]}{person.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium">{person.firstName} {person.lastName}</p>
                      <p className="text-sm text-gray-600">
                        {person.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {person.daysUntil === 0 ? 'Today' :
                       person.daysUntil === 1 ? 'Tomorrow' :
                       `In ${person.daysUntil} days`}
                    </p>
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
