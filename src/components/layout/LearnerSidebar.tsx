'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Trophy,
  Users,
  Award,
  Rocket,
  User,
  Shield,
  X,
  FileText,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  comingSoon?: boolean
  tooltip?: string
}

const mainNav: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tracks', label: 'Tracks', icon: BookOpen },
  { href: '/studio', label: 'AI Studio', icon: Sparkles },
]

const communityNav: NavItem[] = [
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/certificates', label: 'Certificates', icon: Award },
]

const bottomNav: NavItem[] = [
  {
    href: '/incubator',
    label: 'Incubator',
    icon: Rocket,
    comingSoon: true,
    tooltip: 'App Incubator — Build production web apps, get assigned project briefs, and earn profit-sharing. Available at Expert level (5,000 XP).',
  },
  { href: '/profile', label: 'Profile & Settings', icon: User },
]

interface LearnerSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function LearnerSidebar({ isOpen, onClose }: LearnerSidebarProps) {
  const pathname = usePathname()
  const { learner } = useAuthStore()
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const sidebarRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus close button when mobile overlay opens
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
    }
  }, [isOpen])

  // Escape key to close sidebar
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap for mobile sidebar
  useEffect(() => {
    if (!isOpen || !sidebarRef.current) return
    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !sidebarRef.current) return
      const focusable = sidebarRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  const handleMouseMove = useCallback((e: React.MouseEvent, text: string) => {
    setTooltip({ text, x: e.clientX + 12, y: e.clientY - 8 })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href)

    if (item.comingSoon) {
      return (
        <li key={item.href}>
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed text-gray-600"
            onMouseMove={item.tooltip ? (e) => handleMouseMove(e, item.tooltip!) : undefined}
            onMouseLeave={item.tooltip ? handleMouseLeave : undefined}
          >
            <item.icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            {item.label}
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Soon</span>
          </div>
        </li>
      )
    }

    return (
      <li key={item.href}>
        <Link
          href={item.href}
          onClick={onClose}
          aria-current={active ? 'page' : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            active
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <item.icon className={`h-5 w-5 ${active ? 'text-indigo-600' : 'text-gray-400'}`} aria-hidden="true" />
          {item.label}
        </Link>
      </li>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            <span className="font-bold text-gray-900">AI Academy</span>
          </Link>
          <button ref={closeButtonRef} onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-gray-600" aria-label="Close sidebar">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 flex flex-col">
          {/* Main */}
          <ul className="space-y-0.5">
            {mainNav.map(renderItem)}
          </ul>

          {/* Community section */}
          <div className="mt-5">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Community</p>
            <ul className="space-y-0.5">
              {communityNav.map(renderItem)}
            </ul>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom items */}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <ul className="space-y-0.5">
              {learner?.role === 'admin' && renderItem({ href: '/admin', label: 'Admin', icon: Shield })}
              {bottomNav.map(renderItem)}
            </ul>
          </div>
        </nav>
      </aside>

      {/* Mouse-following tooltip for coming-soon items */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-[100] max-w-xs rounded-lg bg-gray-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  )
}
