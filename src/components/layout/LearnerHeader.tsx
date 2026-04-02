'use client'

import { Menu, Bell, Flame } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

interface LearnerHeaderProps {
  onMenuClick: () => void
}

export default function LearnerHeader({ onMenuClick }: LearnerHeaderProps) {
  const learner = useAuthStore((s) => s.learner)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 text-gray-400 hover:text-gray-600 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        {/* Streak */}
        {learner && learner.current_streak > 0 && (
          <div className="flex items-center gap-1.5 text-sm font-medium text-orange-600">
            <Flame className="h-4 w-4" />
            {learner.current_streak}
          </div>
        )}

        {/* XP */}
        {learner && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full text-sm font-semibold text-indigo-700">
            {learner.xp_total.toLocaleString()} XP
          </div>
        )}

        {/* Notifications */}
        <button
          className="p-2 text-gray-400 hover:text-gray-600 relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Avatar */}
        {learner && (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
            {learner.first_name?.[0]}
            {learner.last_name?.[0]}
          </div>
        )}
      </div>
    </header>
  )
}
