'use client'

import { useState, useEffect } from 'react'
import { Users, BookOpen, Trophy, TrendingUp, AlertTriangle } from 'lucide-react'
import { academyApi } from '@/lib/api'

interface AdminStats {
  // Backend returns these fields
  total_registered?: number
  total_learners?: number
  active_learners?: number
  total_enrollments?: number
  total_completions?: number
  completion_rate?: number
  total_flagged_talent?: number
  flagged_talent?: number
  total_flagged_leaders?: number
  flagged_leaders?: number
  // Funnel fields (may or may not exist)
  registered?: number
  onboarded?: number
  foundation_enrolled?: number
  foundation_completed?: number
  specialty_enrolled?: number
  specialty_completed?: number
}

interface ActivityEvent {
  timestamp?: string
  created_at?: string
  client_ts?: string
  event_type: string
  learner_name: string
  metadata?: Record<string, unknown>
}

const EVENT_COLORS: Record<string, string> = {
  page_view: 'bg-gray-100 text-gray-700',
  lesson_start: 'bg-blue-100 text-blue-700',
  lesson_complete: 'bg-green-100 text-green-700',
  quiz_submit: 'bg-amber-100 text-amber-700',
  chat_send: 'bg-indigo-100 text-indigo-700',
  hint_reveal: 'bg-purple-100 text-purple-700',
  login: 'bg-emerald-100 text-emerald-700',
  logout: 'bg-red-100 text-red-700',
}

function getEventTime(event: ActivityEvent): string {
  return event.created_at || event.client_ts || event.timestamp || ''
}

function relativeTime(timestamp: string): string {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      academyApi.get<AdminStats>('/admin/analytics/funnel').catch(() => null),
      academyApi
        .get<{ events: ActivityEvent[] }>('/admin/analytics/recent-activity', { limit: '20' })
        .catch(() => ({ events: [] })),
    ])
      .then(([statsData, activityData]) => {
        setStats(statsData)
        setActivity(Array.isArray(activityData) ? activityData : activityData?.events ?? [])
      })
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
      value: stats?.total_registered ?? stats?.total_learners ?? 0,
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
      value: stats?.total_flagged_talent ?? stats?.flagged_talent ?? 0,
      icon: Trophy,
      color: 'bg-amber-500',
    },
    {
      label: 'Flagged Leaders',
      value: stats?.total_flagged_leaders ?? stats?.flagged_leaders ?? 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
  ]

  const funnelSteps = stats
    ? [
        { label: 'Registered', value: stats.total_registered ?? stats.registered ?? 0 },
        { label: 'Onboarded', value: stats.onboarded ?? 0 },
        { label: 'Enrolled', value: stats.total_enrollments ?? stats.foundation_enrolled ?? 0 },
        { label: 'Completed', value: stats.total_completions ?? stats.foundation_completed ?? 0 },
        { label: 'Specialty Enrolled', value: stats.specialty_enrolled ?? 0 },
        { label: 'Specialty Completed', value: stats.specialty_completed ?? 0 },
      ]
    : []

  const maxFunnel = funnelSteps[0]?.value || 1

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-500">
              Activity feed will appear here once learners begin enrolling.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activity.map((event, i) => (
                <div
                  key={`${getEventTime(event)}-${i}`}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <span className="text-xs text-gray-400 w-16 shrink-0">
                    {relativeTime(getEventTime(event))}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${EVENT_COLORS[event.event_type] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {event.event_type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {event.learner_name}
                  </span>
                  {typeof event.metadata?.lesson_name === 'string' && (
                    <span className="text-xs text-gray-400 truncate ml-auto">
                      {String(event.metadata.lesson_name)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Completion Funnel</h2>
          {funnelSteps.length === 0 || maxFunnel === 0 ? (
            <p className="text-sm text-gray-500">
              Funnel visualization will appear here once data is available.
            </p>
          ) : (
            <div className="space-y-4">
              {funnelSteps.map((step) => {
                const pct = Math.round((step.value / maxFunnel) * 100)
                return (
                  <div key={step.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{step.label}</span>
                      <span className="text-gray-500">
                        {step.value.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
