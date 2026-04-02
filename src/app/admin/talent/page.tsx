'use client'

import { useState, useEffect } from 'react'
import { Star, Users as UsersIcon } from 'lucide-react'
import { academyApi } from '@/lib/api'
import type { AcademyLearner, PaginatedResponse } from '@/types'

export default function AdminTalentPage() {
  const [learners, setLearners] = useState<AcademyLearner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'talent' | 'leader'>('all')

  useEffect(() => {
    setIsLoading(true)
    const params: Record<string, string> = { limit: '50' }
    if (filter === 'talent') params.flagged_talent = 'true'
    if (filter === 'leader') params.flagged_leader = 'true'

    academyApi
      .get<PaginatedResponse<AcademyLearner>>('/admin/learners', params)
      .then((res) => setLearners(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false))
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
          { key: 'all', label: 'All Flagged' },
          { key: 'talent', label: 'Top Talent (IC)' },
          { key: 'leader', label: 'Leadership Potential' },
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

      {/* Scatter Plot Placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Talent vs Management Score
        </h2>
        <div className="relative h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
          <p className="text-sm text-gray-400">
            2D scatter plot visualization — requires Chart.js or similar
          </p>
          {/* Axis labels */}
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
            Talent Score →
          </span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-400">
            Management Score →
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
                  {l.first_name[0]}
                  {l.last_name[0]}
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
                    {l.xp_total.toLocaleString()}
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
