'use client'

import { useState, useEffect } from 'react'
import { Plus, BookOpen, ChevronRight } from 'lucide-react'
import { academyApi } from '@/lib/api'
import type { AcademyTrack } from '@/types'

export default function AdminContentPage() {
  const [tracks, setTracks] = useState<AcademyTrack[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    academyApi
      .get<AcademyTrack[]>('/tracks')
      .then(setTracks)
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
        <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
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
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
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
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
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
