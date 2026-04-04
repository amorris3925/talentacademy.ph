'use client'

import { useState, useEffect } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Check initial state (only in browser)
    setIsOffline(!navigator.onLine)

    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="bg-gray-900 px-4 py-2.5 text-center text-sm text-white flex items-center justify-center gap-2">
      <WifiOff className="h-4 w-4" />
      <span>You are offline. Some features may be unavailable until your connection is restored.</span>
    </div>
  )
}
