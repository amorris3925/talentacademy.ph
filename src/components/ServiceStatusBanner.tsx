'use client'

import { useState, useEffect, useCallback } from 'react'

const CHECK_INTERVAL_MS = 30_000 // Check every 30s when down
const HEALTHY_INTERVAL_MS = 120_000 // Check every 2m when up
const HENRY_HEALTH_PATH = '/api/henry-status'

export function ServiceStatusBanner() {
  const [henryDown, setHenryDown] = useState(false)

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(HENRY_HEALTH_PATH, {
        signal: AbortSignal.timeout(5000),
      })
      setHenryDown(!res.ok)
    } catch {
      setHenryDown(true)
    }
  }, [])

  useEffect(() => {
    checkHealth()
    const id = setInterval(checkHealth, henryDown ? CHECK_INTERVAL_MS : HEALTHY_INTERVAL_MS)
    return () => clearInterval(id)
  }, [checkHealth, henryDown])

  if (!henryDown) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm text-amber-800">
      <span className="font-medium">Our AI service is briefly updating</span>
      {' — '}
      lessons and chat will be back online momentarily. Your progress is saved.
    </div>
  )
}
