'use client'

import React, { useState, useEffect } from 'react'
import { academyApi } from '@/lib/api'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface FunnelData {
  total_registered?: number
  registered?: number
  onboarded?: number
  total_enrollments?: number
  foundation_enrolled?: number
  total_completions?: number
  foundation_completed?: number
  specialty_enrolled?: number
  specialty_completed?: number
  [key: string]: unknown
}

interface ScoreDistribution {
  range: string
  count: number
}

interface DailyActive {
  day: string
  active_count: number
}

interface DeviceEntry {
  device?: string
  device_type?: string
  count?: number
  session_count?: number
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#6366f1',
  mobile: '#10b981',
  tablet: '#f59e0b',
  unknown: '#9ca3af',
}

class AnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700 font-medium">Something went wrong loading analytics.</p>
            <p className="text-sm text-red-600 mt-1">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function AdminAnalyticsPage() {
  return (
    <AnalyticsErrorBoundary>
      <AdminAnalyticsPageInner />
    </AnalyticsErrorBoundary>
  )
}

function AdminAnalyticsPageInner() {
  const [funnel, setFunnel] = useState<FunnelData | null>(null)
  const [scores, setScores] = useState<ScoreDistribution[]>([])
  const [dailyActive, setDailyActive] = useState<DailyActive[]>([])
  const [devices, setDevices] = useState<DeviceEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      academyApi.get<FunnelData>('/admin/analytics/funnel').catch(() => null),
      academyApi.get<{ talent_scores?: Record<string, number>; management_scores?: Record<string, number> } | ScoreDistribution[]>('/admin/analytics/scores').catch(() => []),
      academyApi
        .get<{ data: DailyActive[] } | DailyActive[]>('/admin/analytics/daily-active', {
          from_date: '2026-03-01',
          to_date: '2026-04-03',
        })
        .catch(() => []),
      academyApi.get<{ breakdown: DeviceEntry[] } | DeviceEntry[]>('/admin/analytics/device-breakdown').catch(() => []),
    ])
      .then(([funnelData, scoreData, dauData, deviceData]) => {
        setFunnel(funnelData)
        if (Array.isArray(scoreData)) {
          setScores(scoreData)
        } else if (scoreData && typeof scoreData === 'object') {
          // Convert { talent_scores: { "0-20": 5, ... }, management_scores: {...} } into ScoreDistribution[]
          const talentScores = (scoreData as { talent_scores?: Record<string, number> }).talent_scores
          if (talentScores && typeof talentScores === 'object') {
            setScores(Object.entries(talentScores).map(([range, count]) => ({ range, count: count ?? 0 })))
          } else {
            setScores([])
          }
        } else {
          setScores([])
        }
        setDailyActive(Array.isArray(dauData) ? dauData : (dauData as { data: DailyActive[] })?.data ?? [])
        const rawDevices = Array.isArray(deviceData) ? deviceData : (deviceData as { breakdown: DeviceEntry[] })?.breakdown ?? []
        setDevices(rawDevices.map((d: DeviceEntry) => ({
          device: d.device ?? d.device_type ?? 'unknown',
          count: d.count ?? d.session_count ?? 0,
        })))
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

  const funnelSteps = funnel
    ? [
        { label: 'Registered', value: Number(funnel.total_registered ?? funnel.registered ?? 0) || 0 },
        { label: 'Onboarded', value: Number(funnel.onboarded ?? 0) || 0 },
        { label: 'Enrolled', value: Number(funnel.total_enrollments ?? funnel.foundation_enrolled ?? 0) || 0 },
        { label: 'Completed', value: Number(funnel.total_completions ?? funnel.foundation_completed ?? 0) || 0 },
        { label: 'Specialty Enrolled', value: Number(funnel.specialty_enrolled ?? 0) || 0 },
        { label: 'Specialty Completed', value: Number(funnel.specialty_completed ?? 0) || 0 },
      ]
    : []

  const maxFunnel = funnelSteps[0]?.value || 1

  // Filter out bad data points for recharts
  const cleanDailyActive = dailyActive.filter(
    (d) => d.day != null && d.active_count != null && !isNaN(Number(d.active_count))
  )
  const cleanDevices = devices.filter(
    (d) => d.device != null && d.count != null && !isNaN(Number(d.count))
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Analytics</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Enrollment Funnel</h2>
          {funnelSteps.length === 0 ? (
            <p className="text-sm text-gray-500">No data yet.</p>
          ) : (
            <div className="space-y-4">
              {funnelSteps.map((step) => {
                const rawPct = (step.value / maxFunnel) * 100
                const pct = isFinite(rawPct) ? Math.round(rawPct) : 0
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

        {/* Score Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Score Distribution</h2>
          {scores.length === 0 ? (
            <p className="text-sm text-gray-500">No scoring data yet.</p>
          ) : (
            <div className="space-y-3">
              {scores.map((s) => {
                const maxCount = Math.max(...scores.map((x) => x.count), 1)
                const pct = Math.round((s.count / maxCount) * 100)
                return (
                  <div key={s.range} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16 text-right">{s.range}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-10">{s.count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Daily Active Users */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Daily Active Users</h2>
        {cleanDailyActive.length === 0 ? (
          <p className="text-sm text-gray-500">No daily active user data yet.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cleanDailyActive}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v)
                    return `${d.getMonth() + 1}/${d.getDate()}`
                  }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="active_count"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#6366f1' }}
                  activeDot={{ r: 5 }}
                  name="Active Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Device Breakdown */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Device Breakdown</h2>
          {cleanDevices.length === 0 ? (
            <p className="text-sm text-gray-500">No device data yet.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cleanDevices}
                    dataKey="count"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label={(props: any) =>
                      `${props.name ?? 'unknown'} ${((props.percent as number) * 100).toFixed(0)}%`
                    }
                  >
                    {cleanDevices.map((entry) => (
                      <Cell
                        key={entry.device ?? 'unknown'}
                        fill={DEVICE_COLORS[entry.device ?? 'unknown'] ?? DEVICE_COLORS.unknown}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '13px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Cohort Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cohort Breakdown</h2>
          <p className="text-sm text-gray-500">
            Cohort-level analytics will be available after the first cohort completes the Foundation Track.
          </p>
        </div>
      </div>
    </div>
  )
}
