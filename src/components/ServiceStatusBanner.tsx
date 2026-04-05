'use client'

import { useState, useEffect, useCallback } from 'react'

const DEPLOY_CHECK_INTERVAL_MS = 5_000 // Poll every 5s during deployment
const HEALTH_CHECK_INTERVAL_MS = 30_000 // Check every 30s when healthy
const HEALTHY_INTERVAL_MS = 120_000 // Check every 2m when all is well
const HENRY_HEALTH_PATH = '/api/henry-status'
const DEPLOY_STATUS_PATH = '/api/deploy-status'

interface DeployStatus {
  status: string
  deploying: boolean
  deployment?: {
    id: number
    status: string
    started_at: string
  }
}

export function ServiceStatusBanner() {
  const [henryDown, setHenryDown] = useState(false)
  const [deployStatus, setDeployStatus] = useState<DeployStatus | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

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

  const checkDeployStatus = useCallback(async () => {
    try {
      const res = await fetch(DEPLOY_STATUS_PATH, {
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const data: DeployStatus = await res.json()
        setDeployStatus(data)
      }
    } catch {
      // Silently fail — deployment check is optional
    }
  }, [])

  // Health check polling
  useEffect(() => {
    checkHealth()
    const interval = henryDown ? HEALTH_CHECK_INTERVAL_MS : HEALTHY_INTERVAL_MS
    const id = setInterval(checkHealth, interval)
    return () => clearInterval(id)
  }, [checkHealth, henryDown])

  // Deploy status polling — more frequent when deploying
  useEffect(() => {
    checkDeployStatus()
    const interval = deployStatus?.deploying ? DEPLOY_CHECK_INTERVAL_MS : HEALTHY_INTERVAL_MS
    const id = setInterval(checkDeployStatus, interval)
    return () => clearInterval(id)
  }, [checkDeployStatus, deployStatus?.deploying])

  // Elapsed time counter during deployment
  useEffect(() => {
    if (!deployStatus?.deploying || !deployStatus.deployment?.started_at) {
      setElapsedSeconds(0)
      return
    }

    const startTime = new Date(deployStatus.deployment.started_at).getTime()
    const updateElapsed = () => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000))
    }

    updateElapsed()
    const id = setInterval(updateElapsed, 1000)
    return () => clearInterval(id)
  }, [deployStatus?.deploying, deployStatus?.deployment?.started_at])

  const isDeploying = deployStatus?.deploying
  const showBanner = henryDown || isDeploying

  if (!showBanner) return null

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <div className={`border-b px-4 py-2.5 text-center text-sm ${
      isDeploying
        ? 'bg-blue-50 border-blue-200 text-blue-800'
        : 'bg-amber-50 border-amber-200 text-amber-800'
    }`}>
      {isDeploying ? (
        <span className="flex items-center justify-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
          </span>
          <span>
            <span className="font-medium">Deploying update</span>
            {' — '}
            {deployStatus?.deployment?.status === 'queued' ? 'queued' : 'building'}
            {elapsedSeconds > 0 && (
              <span className="ml-1 text-blue-600">({formatElapsed(elapsedSeconds)})</span>
            )}
            {'. '}
            The app will restart shortly.
          </span>
        </span>
      ) : (
        <span>
          <span className="font-medium">Our AI service is briefly updating</span>
          {' — '}
          lessons and chat will be back online momentarily. Your progress is saved.
        </span>
      )}
    </div>
  )
}
