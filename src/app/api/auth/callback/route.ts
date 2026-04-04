import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const HENRY_API_URL = process.env.HENRY_API_URL || process.env.NEXT_PUBLIC_HENRY_API_URL || 'http://localhost:8081'
const ACADEMY_API_KEY = process.env.ACADEMY_API_KEY || ''

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const rawNext = searchParams.get('next') || '/dashboard'
  const safeNext = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If this is a signup email confirmation, trigger welcome email via Henry
      if (type === 'signup' && ACADEMY_API_KEY) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Fire-and-forget — don't block the redirect
          fetch(`${HENRY_API_URL}/api/academy/send-welcome-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${ACADEMY_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              auth_user_id: user.id,
              email: user.email,
            }),
          }).catch(() => {
            // Welcome email failure should not block the user
          })
        }
      }

      return NextResponse.redirect(new URL(safeNext, req.url))
    }
  }

  return NextResponse.redirect(new URL('/login', req.url))
}
