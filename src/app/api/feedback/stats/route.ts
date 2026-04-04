import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUser } from '@/lib/auth-helpers'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// GET /api/feedback/stats — Admin stats
export async function GET() {
  const user = await getSupabaseUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Check admin
  const { data: learner } = await supabaseAdmin
    .from('academy_learners')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (!learner || learner.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  // Get all tickets for stats
  const { data: tickets, error } = await supabaseAdmin
    .from('feedback_tickets')
    .select('status, category, unread_by_admin')

  if (error) {
    console.error('Failed to load stats:', error)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }

  const byStatus: Record<string, number> = {}
  const byCategory: Record<string, number> = {}
  let unreadCount = 0

  for (const t of tickets || []) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1
    if (t.category) byCategory[t.category] = (byCategory[t.category] || 0) + 1
    if (t.unread_by_admin) unreadCount++
  }

  return NextResponse.json({
    total_tickets: tickets?.length || 0,
    by_status: byStatus,
    by_category: byCategory,
    unread_count: unreadCount,
  })
}
