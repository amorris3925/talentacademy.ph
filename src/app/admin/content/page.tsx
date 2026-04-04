'use client'

import { useState, useEffect } from 'react'
import { Plus, BookOpen, ChevronRight, ChevronDown, Loader2 } from 'lucide-react'
import { academyApi } from '@/lib/api'
import type { AcademyTrack, AcademyModule, AcademyLesson } from '@/types'

interface TrackDetail {
  modules: (AcademyModule & { lessons?: AcademyLesson[] })[]
}

export default function AdminContentPage() {
  const [tracks, setTracks] = useState<AcademyTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)
  const [trackDetails, setTrackDetails] = useState<Record<string, TrackDetail>>({})
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null)

  const handleTrackClick = async (slug: string) => {
    if (expandedTrack === slug) {
      setExpandedTrack(null)
      return
    }
    setExpandedTrack(slug)
    if (trackDetails[slug]) return
    setLoadingTrack(slug)
    try {
      const data = await academyApi.get<AcademyTrack & { modules?: (AcademyModule & { lessons?: AcademyLesson[] })[] }>(
        `/tracks/${slug}`
      )
      setTrackDetails((prev) => ({
        ...prev,
        [slug]: { modules: data?.modules ?? [] },
      }))
    } catch {
      setTrackDetails((prev) => ({
        ...prev,
        [slug]: { modules: [] },
      }))
    } finally {
      setLoadingTrack(null)
    }
  }

  useEffect(() => {
    academyApi
      .get<{ tracks: AcademyTrack[] } | AcademyTrack[]>('/tracks')
      .then((res) => setTracks(Array.isArray(res) ? res : res?.tracks ?? []))
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage tracks, modules, and lessons.</p>
        </div>
        <button
          disabled
          title="Coming soon"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white opacity-50 cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Track
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 mb-4">No tracks created yet.</p>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Create your first track
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tracks.map((track) => {
            const isExpanded = expandedTrack === track.slug
            const detail = trackDetails[track.slug]
            const isLoadingDetail = loadingTrack === track.slug
            return (
              <div key={track.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  onClick={() => handleTrackClick(track.slug)}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{track.title}</h3>
                        <p className="text-sm text-gray-500">{track.description}</p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-400">
                          <span>{track.duration_weeks} weeks</span>
                          <span>Slug: {track.slug}</span>
                          {track.is_invite_only && (
                            <span className="text-amber-600 font-medium">Invite only</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                    {isLoadingDetail ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                      </div>
                    ) : !detail || detail.modules.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">No modules found for this track.</p>
                    ) : (
                      <div className="space-y-3">
                        {detail.modules
                          .sort((a, b) => (a.week_number ?? a.order) - (b.week_number ?? b.order))
                          .map((mod) => (
                          <div key={mod.id} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-gray-900">{mod.title}</h4>
                              <div className="flex gap-3 text-xs text-gray-500">
                                <span>Week {mod.week_number}</span>
                                <span>{mod.lessons?.length ?? 0} lessons</span>
                              </div>
                            </div>
                            {mod.description && (
                              <p className="text-sm text-gray-500 mb-2">{mod.description}</p>
                            )}
                            {mod.lessons && mod.lessons.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {mod.lessons
                                  .sort((a, b) => a.order - b.order)
                                  .map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between py-1.5 px-3 rounded bg-gray-50 text-sm"
                                  >
                                    <span className="text-gray-700">
                                      <span className="text-gray-400 mr-2">#{lesson.order}</span>
                                      {lesson.title}
                                    </span>
                                    <span className="text-xs text-indigo-600 font-medium">
                                      {lesson.xp_reward} XP
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Seed Content Section */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Bulk Import</h2>
        <p className="text-sm text-gray-600 mb-4">
          Seed lesson content from a JSON file. Useful for AI-generated content.
        </p>
        <label className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
          <Plus className="h-4 w-4" />
          Upload JSON
          <input type="file" accept=".json" className="hidden" />
        </label>
      </div>
    </div>
  )
}
