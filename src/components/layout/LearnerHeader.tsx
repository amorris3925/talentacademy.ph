'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, Bell, Flame, LogOut, User, Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

interface LearnerHeaderProps {
  onMenuClick: () => void
}

export default function LearnerHeader({ onMenuClick }: LearnerHeaderProps) {
  const learner = useAuthStore((s) => s.learner)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    router.push('/login')
  }

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
          <Link
            href="/profile"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            {learner.xp_total.toLocaleString()} XP
          </Link>
        )}

        {/* Notifications */}
        <button
          className="p-2 text-gray-400 hover:text-gray-600 relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Avatar with dropdown */}
        {learner && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
              aria-label="User menu"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              {learner.first_name?.[0]}
              {learner.last_name?.[0]}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white border border-gray-200 shadow-lg py-1 z-50" role="menu">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
