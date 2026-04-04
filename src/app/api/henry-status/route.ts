import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const HENRY_API_URL = process.env.HENRY_API_URL || process.env.NEXT_PUBLIC_HENRY_API_URL || 'http://localhost:8081'

export async function GET() {
  try {
    const res = await fetch(`${HENRY_API_URL}/health`, {
      signal: AbortSignal.timeout(4000),
    })
    if (res.ok) {
      return NextResponse.json({ status: 'ok' })
    }
    return NextResponse.json({ status: 'unavailable' }, { status: 503 })
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503 })
  }
}
