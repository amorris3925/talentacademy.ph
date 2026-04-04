import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth-helpers'
import { checkRateLimit } from '@/lib/rate-limit'

const HENRY_API_URL = process.env.HENRY_API_URL || process.env.NEXT_PUBLIC_HENRY_API_URL || 'http://localhost:8081'
const ACADEMY_API_KEY = process.env.ACADEMY_API_KEY || ''

async function proxyToHenry(req: NextRequest, method: string) {
  if (!ACADEMY_API_KEY) {
    console.error('[academy-proxy] ACADEMY_API_KEY is not set. Check .env.local.')
    return NextResponse.json(
      { error: 'API not configured', code: 'MISSING_API_KEY' },
      { status: 503 }
    )
  }

  const url = new URL(req.url)
  const pathSegments = url.pathname.replace('/api/academy/', '')

  // SECURITY: Prevent SSRF via path traversal
  if (
    pathSegments.includes('..') ||
    pathSegments.startsWith('/') ||
    pathSegments.includes('\\')
  ) {
    return NextResponse.json(
      { error: 'Invalid path', code: 'INVALID_PATH' },
      { status: 400 }
    )
  }

  // Rate limit registration endpoint
  if (pathSegments === 'register' && method === 'POST') {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!checkRateLimit(`register:${ip}`)) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.', code: 'RATE_LIMITED' },
        { status: 429 }
      )
    }
  }

  const henryUrl = `${HENRY_API_URL}/api/academy/${pathSegments}${url.search}`

  // Public endpoints that don't require auth
  const isPublicPath =
    pathSegments.startsWith('artifacts/public/') ||
    pathSegments === 'register' ||
    pathSegments.startsWith('register/')

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${ACADEMY_API_KEY}`,
  }

  if (!isPublicPath) {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in to use this feature', code: 'NOT_AUTHENTICATED' },
        { status: 401 }
      )
    }
    headers['X-Academy-Auth-User-ID'] = user.id
  }

  // Determine content type and body
  let body: ArrayBuffer | string | undefined
  const contentType = req.headers.get('content-type') || ''

  if (method !== 'GET' && method !== 'HEAD') {
    if (contentType.includes('multipart/form-data')) {
      // Forward multipart as-is
      body = await req.arrayBuffer()
      headers['Content-Type'] = contentType
    } else if (contentType.includes('application/json') || !contentType) {
      try {
        const json = await req.text()
        if (json) {
          body = json
          headers['Content-Type'] = 'application/json'
        }
      } catch {
        // No body
      }
    }
  }

  // Check if this is an SSE streaming request
  const acceptHeader = req.headers.get('accept') || ''
  const isSSE = acceptHeader.includes('text/event-stream')

  try {
    const fetchOptions: RequestInit = {
      method,
      headers,
      body: body as BodyInit | undefined,
    }

    const response = await fetch(henryUrl, fetchOptions)

    if (isSSE && response.ok && response.body) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // SSE request failed — return structured JSON error instead of opaque stream
    if (isSSE && !response.ok) {
      const text = await response.text().catch(() => '')
      return NextResponse.json(
        {
          error: response.status === 401
            ? 'AI service authentication failed'
            : `Generation failed: ${text || response.statusText}`,
          code: response.status === 401 ? 'UPSTREAM_AUTH_FAILED' : 'UPSTREAM_ERROR',
        },
        { status: response.status }
      )
    }

    // Regular JSON response
    const responseBody = await response.text()
    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: 'Our AI service is briefly updating and will be back online momentarily. Please try again in a few seconds.', code: 'SERVICE_UPDATING' },
      { status: 503 }
    )
  }
}

export async function GET(req: NextRequest) {
  return proxyToHenry(req, 'GET')
}

export async function POST(req: NextRequest) {
  return proxyToHenry(req, 'POST')
}

export async function PATCH(req: NextRequest) {
  return proxyToHenry(req, 'PATCH')
}

export async function DELETE(req: NextRequest) {
  return proxyToHenry(req, 'DELETE')
}
