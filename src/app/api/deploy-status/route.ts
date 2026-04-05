import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const COOLIFY_API = 'http://178.156.208.39:8000/api/v1'
const COOLIFY_TOKEN = process.env.COOLIFY_API_TOKEN || '9|IizQZcH4db9F042kfLP2DLDLb3PvKWDrbCTpsxKTe1d3c1c5'
const APP_UUID = 'vk8s8kkocskcwow0go8ssocg' // talent-academy

interface CoolifyDeployment {
  id: number
  status: string
  created_at: string
  updated_at: string
}

export async function GET() {
  try {
    const res = await fetch(`${COOLIFY_API}/applications/${APP_UUID}/deployments?per_page=3`, {
      headers: {
        Authorization: `Bearer ${COOLIFY_TOKEN}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return NextResponse.json({ status: 'unknown', deploying: false })
    }

    const data = await res.json()
    const deployments: CoolifyDeployment[] = Array.isArray(data) ? data : data.data || []

    // Check if any deployment is actively running
    const activeDeployment = deployments.find(
      (d) => d.status === 'in_progress' || d.status === 'queued' || d.status === 'building'
    )

    if (activeDeployment) {
      return NextResponse.json({
        status: 'deploying',
        deploying: true,
        deployment: {
          id: activeDeployment.id,
          status: activeDeployment.status,
          started_at: activeDeployment.created_at,
        },
      })
    }

    // Check most recent deployment
    const latest = deployments[0]
    return NextResponse.json({
      status: latest?.status === 'finished' ? 'healthy' : (latest?.status || 'unknown'),
      deploying: false,
      last_deployment: latest
        ? {
            id: latest.id,
            status: latest.status,
            finished_at: latest.updated_at,
          }
        : null,
    })
  } catch {
    return NextResponse.json({ status: 'unknown', deploying: false })
  }
}
