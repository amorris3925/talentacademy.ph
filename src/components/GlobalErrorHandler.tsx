'use client'

import { useEffect } from 'react'

export function GlobalErrorHandler() {
  useEffect(() => {
    function onUnhandledRejection(event: PromiseRejectionEvent) {
      // Don't log AbortError — these are intentional cancellations
      if (event.reason?.name === 'AbortError') return
      console.error('[unhandled rejection]', event.reason)
    }

    function onError(event: ErrorEvent) {
      console.error('[uncaught error]', event.error ?? event.message)
    }

    window.addEventListener('unhandledrejection', onUnhandledRejection)
    window.addEventListener('error', onError)
    return () => {
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
      window.removeEventListener('error', onError)
    }
  }, [])

  return null
}
