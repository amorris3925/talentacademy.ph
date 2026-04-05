import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const HENRY_API_URL = process.env.NEXT_PUBLIC_HENRY_API_URL || process.env.HENRY_API_URL || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

async function checkSupabase(): Promise<'ok' | 'down'> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return 'down'
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(5000),
    })
    return res.ok ? 'ok' : 'down'
  } catch {
    return 'down'
  }
}

async function checkHenry(): Promise<'ok' | 'down' | 'unconfigured'> {
  if (!HENRY_API_URL) return 'unconfigured'
  try {
    const res = await fetch(`${HENRY_API_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    })
    return res.ok ? 'ok' : 'down'
  } catch {
    return 'down'
  }
}

export async function GET() {
  const [supabase, henry] = await Promise.all([checkSupabase(), checkHenry()])

  const envCheck = {
    SUPABASE_URL: !!SUPABASE_URL,
    SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    ACADEMY_API_KEY: !!process.env.ACADEMY_API_KEY,
  }

  const healthy = supabase === 'ok' && henry !== 'down'
    && envCheck.SUPABASE_SERVICE_ROLE_KEY && envCheck.ACADEMY_API_KEY

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      timestamp: Date.now(),
      checks: { supabase, henry },
      env: envCheck,
    },
    { status: healthy ? 200 : 503 },
  )
}
