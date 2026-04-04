'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Users as UsersIcon } from 'lucide-react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { academyApi } from '@/lib/api'
import type { AcademyLearner, PaginatedResponse } from '@/types'

type ScatterPoint = {
  x: number
  y: number
  name: string
  id: string
  isTalent: boolean
  isLeader: boolean
}

function getDotColor(point: ScatterPoint) {
  if (point.isTalent && point.isLeader) return '#6366f1' // indigo — both
  if (point.isTalent) return '#f59e0b' // amber — talent only
  if (point.isLeader) return '#3b82f6' // blue — leader only
  return '#9ca3af' // gray — neither
}

export default function AdminTalentPage() {
  const router = useRouter()
  const [learners, setLearners] = useState<AcademyLearner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'everyone' | 'talent' | 'leader'>('everyone')

  const scatterData = useMemo<ScatterPoint[]>(
    () =>
      learners
        .filter((l) => l.talent_score != null && l.management_score != null)
        .map((l) => ({
          x: l.talent_score!,
          y: l.management_score!,
          name: `${l.first_name} ${l.last_name}`,
          id: l.id,
          isTalent: l.is_flagged_talent,
          isLeader: l.is_flagged_leader,
        })),
    [learners],
  )

  useEffect(() => {
    let cancelled = false
    const params: Record<string, string> = { limit: '50' }
    if (filter === 'talent') params.flagged_talent = 'true'
    if (filter === 'leader') params.flagged_leader = 'true'

    async function fetchLearners() {
      try {
        const res = await academyApi.get<
          PaginatedResponse<AcademyLearner> | { learners: AcademyLearner[]; next_cursor?: string | null }
        >('/admin/learners', params)
        if (!cancelled) {
          const items = 'data' in res && Array.isArray(res.data)
            ? res.data
            : Array.isArray((res as { learners?: AcademyLearner[] }).learners)
              ? (res as { learners: AcademyLearner[] }).learners
              : []
          setLearners(items)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchLearners()
    return () => { cancelled = true }
  }, [filter])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Talent Pool</h1>
      <p className="text-gray-600 mb-6">
        Learners flagged for exceptional performance or leadership potential.
      </p>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'everyone', label: 'All Learners' },
          { key: 'talent', label: 'Flagged Talent' },
          { key: 'leader', label: 'Flagged Leaders' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Scatter Plot */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Talent vs Management Score
        </h2>
        {scatterData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Talent Score"
                domain={[0, 100]}
                label={{ value: 'Talent Score', position: 'bottom', offset: 0 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Management Score"
                domain={[0, 100]}
                label={{
                  value: 'Management Score',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const point = payload[0].payload as ScatterPoint
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg">
                      <p className="font-semibold text-gray-900">{point.name}</p>
                      <p className="text-gray-600">Talent Score: {point.x}</p>
                      <p className="text-gray-600">Management Score: {point.y}</p>
                    </div>
                  )
                }}
              />
              <Scatter
                data={scatterData}
                onClick={(_data: unknown, _index: number, e: unknown) => {
                  const point = (_data as { payload?: ScatterPoint })?.payload
                  if (point?.id) router.push(`/admin/learners/${point.id}`)
                }}
                style={{ cursor: 'pointer' }}
              >
                {scatterData.map((entry, index) => (
                  <Cell key={index} fill={getDotColor(entry)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-400">
              No learners with both scores available
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: '#6366f1' }} />
            Both Flags
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            Talent Only
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
            Leader Only
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
            Neither
          </span>
        </div>
      </div>

      {/* Talent Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : learners.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No flagged learners yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {learners.map((l) => (
            <div
              key={l.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                  {l.first_name?.[0] ?? ''}
                  {l.last_name?.[0] ?? ''}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {l.first_name} {l.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{l.cohort}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Talent Score</p>
                  <p className="font-bold text-gray-900">{l.talent_score}</p>
                </div>
                <div>
                  <p className="text-gray-500">Management</p>
                  <p className="font-bold text-gray-900">{l.management_score}</p>
                </div>
                <div>
                  <p className="text-gray-500">Level</p>
                  <p className="font-medium text-gray-700 capitalize">{l.level}</p>
                </div>
                <div>
                  <p className="text-gray-500">XP</p>
                  <p className="font-medium text-gray-700">
                    {(l.xp_total ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {l.is_flagged_talent && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                    <Star className="h-3 w-3" />
                    Top Talent
                  </span>
                )}
                {l.is_flagged_leader && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    <UsersIcon className="h-3 w-3" />
                    Leader
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
