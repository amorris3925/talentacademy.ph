'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { academyApi } from '@/lib/api'

interface ActivityEvent {
  timestamp: string
  event_type: string
  learner_name: string
  metadata?: Record<string, string>
}

const EVENT_TYPES = [
  'all',
  'page_view',
  'lesson_start',
  'lesson_complete',
  'quiz_submit',
  'chat_send',
  'hint_reveal',
  'login',
  'logout',
] as const

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

function formatTime(timestamp: string): string {
  const d = new Date(timestamp)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function AdminActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [filterDate, setFilterDate] = useState('')

  const fetchActivity = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string> = { limit: '100' }
      if (filterType !== 'all') params.event_type = filterType
      if (filterDate) params.date = filterDate
      const data = await academyApi.get<ActivityEvent[]>(
        '/admin/analytics/recent-activity',
        params
      )
      setEvents(data)
    } catch {
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }, [filterType, filterDate])

  useEffect(() => {
    fetchActivity()
  }, [fetchActivity])

  const filtered = events

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <button
          onClick={fetchActivity}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Event Types' : type.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {filterDate && (
          <button
            onClick={() => setFilterDate('')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear date
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">No activity events found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Learner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Event Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((event, i) => (
                <tr key={`${event.timestamp}-${i}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatTime(event.timestamp)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700">
                    {event.learner_name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${EVENT_COLORS[event.event_type] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {event.event_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {event.metadata?.lesson_name && (
                      <span>{event.metadata.lesson_name}</span>
                    )}
                    {event.metadata?.score !== undefined && (
                      <span className="ml-2 text-xs text-gray-400">
                        Score: {event.metadata.score}
                      </span>
                    )}
                    {!event.metadata?.lesson_name && !event.metadata?.score && (
                      <span className="text-gray-400">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
