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

// GET /api/feedback/[ticketId] — Get ticket with messages and attachments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const user = await getSupabaseUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const learner = await getLearner(user.id)
  if (!learner) return NextResponse.json({ error: 'Learner not found' }, { status: 404 })

  const { ticketId } = await params

  // Get ticket
  const { data: ticket, error: ticketError } = await supabaseAdmin
    .from('feedback_tickets')
    .select('*')
    .eq('id', ticketId)
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
  }

  // Check access: user can only view own tickets, admin can view all
  if (ticket.user_id !== user.id && learner.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Get messages (exclude internal notes for non-staff)
  let messagesQuery = supabaseAdmin
    .from('feedback_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (learner.role !== 'admin') {
    messagesQuery = messagesQuery.eq('is_internal_note', false)
  }

  const { data: messages } = await messagesQuery

  // Get attachments
  const { data: attachments } = await supabaseAdmin
    .from('feedback_attachments')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  // Mark as read
  if (learner.role === 'admin') {
    await supabaseAdmin
      .from('feedback_tickets')
      .update({ unread_by_admin: false })
      .eq('id', ticketId)
  } else {
    await supabaseAdmin
      .from('feedback_tickets')
      .update({ unread_by_user: false })
      .eq('id', ticketId)
  }

  return NextResponse.json({
    ticket,
    messages: messages || [],
    attachments: attachments || [],
  })
}

// PATCH /api/feedback/[ticketId] — Update ticket (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const user = await getSupabaseUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const learner = await getLearner(user.id)
  if (!learner || learner.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const { ticketId } = await params
  const body = await req.json()
  const updates: Record<string, unknown> = {}

  if (body.status !== undefined) updates.status = body.status
  if (body.priority !== undefined) updates.priority = body.priority
  if (body.resolution_notes !== undefined) updates.resolution_notes = body.resolution_notes

  if (body.assigned_to !== undefined) {
    updates.assigned_to = body.assigned_to || null
    updates.assigned_at = body.assigned_to ? new Date().toISOString() : null
  }

  // Auto-set resolved fields when closing
  if (body.status === 'resolved' || body.status === 'closed') {
    updates.resolved_by = user.id
    updates.resolved_at = new Date().toISOString()
  }

  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('feedback_tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single()

  if (error) {
    console.error('Failed to update ticket:', error)
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
  }

  return NextResponse.json(data)
}
