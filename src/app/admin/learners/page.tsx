'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronRight } from 'lucide-react'
import { academyApi } from '@/lib/api'
import type { AcademyLearner, PaginatedResponse } from '@/types'

export default function AdminLearnersPage() {
  const router = useRouter()
  const [learners, setLearners] = useState<AcademyLearner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadLearners()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadLearners(loadMore = false) {
    setIsLoading(true)
    try {
      const params: Record<string, string> = { limit: '20' }
      if (loadMore && cursor) params.cursor = cursor
      if (search) params.search = search

      const res = await academyApi.get<PaginatedResponse<AcademyLearner>>(
        '/admin/learners',
        params
      )
      setLearners(loadMore ? [...learners, ...res.data] : res.data)
      setCursor(res.cursor)
      setHasMore(res.has_more)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const levelColors: Record<string, string> = {
    beginner: 'bg-gray-100 text-gray-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-purple-100 text-purple-700',
    expert: 'bg-amber-100 text-amber-700',
    master: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Learners</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadLearners()}
            className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search learners..."
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Learner
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Level
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                XP
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Talent
              </th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                Cohort
              </th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {learners.map((l) => (
              <tr key={l.id} onClick={() => router.push(`/admin/learners/${l.id}`)} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                      {l.first_name[0]}
                      {l.last_name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {l.first_name} {l.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{l.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      levelColors[l.level] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {l.level}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {l.xp_total.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{l.talent_score}</span>
                    {l.is_flagged_talent && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" title="Flagged talent" />
                    )}
                    {l.is_flagged_leader && (
                      <span className="w-2 h-2 rounded-full bg-blue-400" title="Leadership potential" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{l.cohort}</td>
                <td className="px-6 py-4">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
          </div>
        )}

        {!isLoading && learners.length === 0 && (
          <div className="text-center py-12 text-gray-500">No learners found.</div>
        )}

        {hasMore && !isLoading && (
          <div className="p-4 border-t border-gray-200 text-center">
            <button
              onClick={() => loadLearners(true)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
