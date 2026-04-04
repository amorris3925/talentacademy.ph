'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { ServiceStatusBanner } from '@/components/ServiceStatusBanner'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import {
  LayoutDashboard,
  Users,
  Star,
  BookOpen,
  BarChart3,
  Activity,
  Sparkles,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react'
import { useTicketUnreadCount } from '@/components/feedback/useTicketUnreadCount'

const adminNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/learners', label: 'Learners', icon: Users },
  { href: '/admin/talent', label: 'Talent Pool', icon: Star },
  { href: '/admin/content', label: 'Content', icon: BookOpen },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/activity', label: 'Activity', icon: Activity },
  { href: '/admin/tickets', label: 'Tickets', icon: MessageSquare },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { learner, isLoading, initialize } = useAuthStore()
  const ticketUnreadCount = useTicketUnreadCount()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isLoading && !learner) {
      router.push('/login')
    }
    if (!isLoading && learner && learner.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [isLoading, learner, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!learner) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <span className="font-bold">Admin Panel</span>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Academy
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {adminNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.href === '/admin/tickets' && ticketUnreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                      {ticketUnreadCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <ServiceStatusBanner />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
    </div>
  )
}
