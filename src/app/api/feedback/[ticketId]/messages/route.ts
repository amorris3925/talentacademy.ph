import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUser } from '@/lib/auth-helpers'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function getLearner(authUserId: string) {
  const { data } = await supabaseAdmin
    .from('academy_learners')
    .select('id, email, first_name, last_name, role')
    .eq('auth_user_id', authUserId)
    .single()
  return data
}

// POST /api/feedback/[ticketId]/messages — Add a message to a ticket
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const user = await getSupabaseUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const learner = await getLearner(user.id)
  if (!learner) return NextResponse.json({ error: 'Learner not found' }, { status: 404 })

  const { ticketId } = await params

  // Verify ticket exists and user has access
  const { data: ticket } = await supabaseAdmin
    .from('feedback_tickets')
    .select('id, user_id')
    .eq('id', ticketId)
    .single()

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  if (ticket.user_id !== user.id && learner.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const body = await req.json()
  const { message, is_internal_note } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Only admins can create internal notes
  const internalNote = learner.role === 'admin' ? (is_internal_note || false) : false
  const isStaff = learner.role === 'admin'
  const displayName = `${learner.first_name} ${learner.last_name}`.trim()

  const { data: msg, error } = await supabaseAdmin
    .from('feedback_messages')
    .insert({
      ticket_id: ticketId,
      user_id: user.id,
      user_email: learner.email,
      user_display_name: displayName,
      is_staff: isStaff,
      message: message.trim(),
      is_internal_note: internalNote,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }

  return NextResponse.json(msg, { status: 201 })
}
