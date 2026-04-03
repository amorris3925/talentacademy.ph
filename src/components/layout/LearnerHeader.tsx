'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, Flame, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

interface LearnerHeaderProps {
  onMenuClick: () => void
}

export default function LearnerHeader({ onMenuClick }: LearnerHeaderProps) {
  const learner = useAuthStore((s) => s.learner)
  const logout = useAuthStore((s) => s.logout)
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  // Auto-focus first menu item when dropdown opens
  useEffect(() => {
    if (dropdownOpen && menuRef.current) {
      const first = menuRef.current.querySelector<HTMLElement>('[role="menuitem"]')
      first?.focus()
    }
  }, [dropdownOpen])

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setDropdownOpen(false)
      triggerRef.current?.focus()
      return
    }

    const items = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')
    if (!items || items.length === 0) return

    const currentIndex = Array.from(items).findIndex((el) => el === document.activeElement)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (currentIndex + 1) % items.length
      items[next].focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = (currentIndex - 1 + items.length) % items.length
      items[prev].focus()
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 text-gray-400 hover:text-gray-600 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
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
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-full text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            {learner.xp_total.toLocaleString()} XP
          </Link>
        )}

        {/* Profile Dropdown */}
        {learner && (
          <div className="relative" ref={menuRef} onKeyDown={handleMenuKeyDown}>
            <button
              ref={triggerRef}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              className="flex items-center gap-1.5 rounded-full p-1 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
                {learner.first_name?.[0] ?? 'U'}
              </div>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-48 rounded-lg bg-white border border-gray-200 shadow-lg py-1 z-50"
              >
                <button
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => { setDropdownOpen(false); router.push('/profile'); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  Profile & Settings
                </button>
                <button
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => { setDropdownOpen(false); logout(); router.push('/login'); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
