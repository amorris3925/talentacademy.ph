'use client'

import { useState, useEffect } from 'react'
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
  registered: number
  onboarded: number
  foundation_enrolled: number
  foundation_completed: number
  specialty_enrolled: number
  specialty_completed: number
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
  device: string
  count: number
}

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#6366f1',
  mobile: '#10b981',
  tablet: '#f59e0b',
  unknown: '#9ca3af',
}

export default function AdminAnalyticsPage() {
  const [funnel, setFunnel] = useState<FunnelData | null>(null)
  const [scores, setScores] = useState<ScoreDistribution[]>([])
  const [dailyActive, setDailyActive] = useState<DailyActive[]>([])
  const [devices, setDevices] = useState<DeviceEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      academyApi.get<FunnelData>('/admin/analytics/funnel').catch(() => null),
      academyApi.get<ScoreDistribution[]>('/admin/analytics/scores').catch(() => []),
      academyApi
        .get<DailyActive[]>('/admin/analytics/daily-active', {
          from_date: '2026-03-01',
          to_date: '2026-04-03',
        })
        .catch(() => []),
      academyApi.get<DeviceEntry[]>('/admin/analytics/device-breakdown').catch(() => []),
    ])
      .then(([funnelData, scoreData, dauData, deviceData]) => {
        setFunnel(funnelData)
        setScores(scoreData)
        setDailyActive(dauData)
        setDevices(deviceData)
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
        { label: 'Registered', value: funnel.registered },
        { label: 'Onboarded', value: funnel.onboarded },
        { label: 'Foundation Enrolled', value: funnel.foundation_enrolled },
        { label: 'Foundation Completed', value: funnel.foundation_completed },
        { label: 'Specialty Enrolled', value: funnel.specialty_enrolled },
        { label: 'Specialty Completed', value: funnel.specialty_completed },
      ]
    : []

  const maxFunnel = funnelSteps[0]?.value || 1

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
        {dailyActive.length === 0 ? (
          <p className="text-sm text-gray-500">No daily active user data yet.</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyActive}>
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
          {devices.length === 0 ? (
            <p className="text-sm text-gray-500">No device data yet.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={devices}
                    dataKey="count"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    label={(props: any) =>
                      `${props.device} ${((props.percent as number) * 100).toFixed(0)}%`
                    }
                  >
                    {devices.map((entry) => (
                      <Cell
                        key={entry.device}
                        fill={DEVICE_COLORS[entry.device] ?? DEVICE_COLORS.unknown}
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
