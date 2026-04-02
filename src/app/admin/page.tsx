'use client'

import { useState, useEffect } from 'react'
import { Users, BookOpen, Trophy, TrendingUp } from 'lucide-react'
import { academyApi } from '@/lib/api'

interface AdminStats {
  total_learners: number
  active_learners: number
  total_enrollments: number
  completion_rate: number
  flagged_talent: number
  flagged_leaders: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    academyApi
      .get<AdminStats>('/admin/analytics/funnel')
      .then(setStats)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Learners',
      value: stats?.total_learners ?? 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Active This Week',
      value: stats?.active_learners ?? 0,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      label: 'Enrollments',
      value: stats?.total_enrollments ?? 0,
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      label: 'Flagged Talent',
      value: stats?.flagged_talent ?? 0,
      icon: Trophy,
      color: 'bg-amber-500',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}
              >
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600">{card.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-sm text-gray-500">
            Activity feed will appear here once learners begin enrolling.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Completion Funnel</h2>
          <p className="text-sm text-gray-500">
            Funnel visualization will appear here once data is available.
          </p>
        </div>
      </div>
    </div>
  )
}
