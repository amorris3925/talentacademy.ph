import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUser } from '@/lib/auth-helpers'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

// GET /api/feedback/team-members — Get admin users who can be assigned tickets
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

  // Get all admin users
  const { data: admins, error } = await supabaseAdmin
    .from('academy_learners')
    .select('auth_user_id, email, first_name, last_name')
    .eq('role', 'admin')

  if (error) {
    console.error('Failed to load team members:', error)
    return NextResponse.json({ error: 'Failed to load team members' }, { status: 500 })
  }

  const members = (admins || []).map((a) => ({
    id: a.auth_user_id,
    email: a.email,
    display_name: `${a.first_name} ${a.last_name}`.trim(),
  }))

  return NextResponse.json(members)
}
