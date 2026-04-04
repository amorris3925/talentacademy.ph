'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/auth'
import { analytics } from '@/lib/analytics'
import LearnerSidebar from '@/components/layout/LearnerSidebar'
import LearnerHeader from '@/components/layout/LearnerHeader'
import { GlobalTrackers } from '@/components/feedback/GlobalTrackers'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'
import { ServiceStatusBanner } from '@/components/ServiceStatusBanner'

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { learner, isLoading, initialize } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!isLoading && !learner) {
      router.push('/login')
    }
  }, [isLoading, learner, router])

  // Track page views on route change
  useEffect(() => {
    if (!learner || pathname === prevPathname.current) return
    prevPathname.current = pathname
    analytics.trackEvent('page_view', undefined, { path: pathname })
  }, [pathname, learner])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!learner) return null

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <LearnerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <LearnerHeader onMenuClick={() => setSidebarOpen(true)} />
        <ServiceStatusBanner />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <GlobalTrackers />
      <FeedbackWidget />
    </div>
  )
}
