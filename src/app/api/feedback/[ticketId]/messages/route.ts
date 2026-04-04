import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUser } from '@/lib/auth-helpers'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const FROM_EMAIL = 'TalentAcademy <noreply@talentacademy.ph>'

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
    .select('id, user_id, user_email, user_display_name, title, ticket_number')
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

  // Send email notification (non-blocking)
  if (!internalNote) {
    sendReplyNotification({
      isStaffReply: isStaff,
      ticketTitle: ticket.title,
      ticketNumber: ticket.ticket_number,
      messageText: message.trim(),
      senderName: displayName,
      recipientEmail: isStaff ? ticket.user_email : null,
      recipientName: isStaff ? ticket.user_display_name : null,
    }).catch(console.error)
  }

  return NextResponse.json(msg, { status: 201 })
}

/**
 * Send email notification via Resend when a reply is posted.
 * - Staff reply → email the user who submitted the ticket
 * - User reply → email all admin users
 */
async function sendReplyNotification(opts: {
  isStaffReply: boolean
  ticketTitle: string
  ticketNumber: number
  messageText: string
  senderName: string
  recipientEmail: string | null
  recipientName: string | null
}) {
  if (!RESEND_API_KEY) return

  const { isStaffReply, ticketTitle, ticketNumber, messageText, senderName } = opts

  let toEmails: string[] = []

  if (isStaffReply && opts.recipientEmail) {
    // Staff replied → notify the user
    toEmails = [opts.recipientEmail]
  } else if (!isStaffReply) {
    // User replied → notify all admins
    const { data: admins } = await supabaseAdmin
      .from('academy_learners')
      .select('email')
      .eq('role', 'admin')

    toEmails = (admins || []).map(a => a.email).filter(Boolean)
  }

  if (toEmails.length === 0) return

  const subject = isStaffReply
    ? `Re: Ticket #${ticketNumber} — ${ticketTitle}`
    : `New reply on Ticket #${ticketNumber} — ${ticketTitle}`

  const html = buildNotificationEmail({
    ticketNumber,
    ticketTitle,
    senderName,
    messageText,
    isStaffReply,
    recipientName: opts.recipientName || 'Team',
  })

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: toEmails,
        subject,
        html,
        tags: [
          { name: 'type', value: 'feedback_reply' },
          { name: 'ticket_number', value: String(ticketNumber) },
        ],
      }),
    })
  } catch (error) {
    console.error('Failed to send email notification:', error)
  }
}

function buildNotificationEmail(opts: {
  ticketNumber: number
  ticketTitle: string
  senderName: string
  messageText: string
  isStaffReply: boolean
  recipientName: string
}): string {
  const { ticketNumber, ticketTitle, senderName, messageText, isStaffReply, recipientName } = opts

  const greeting = isStaffReply
    ? `Hi ${recipientName},`
    : `Hi Team,`

  const intro = isStaffReply
    ? `The TalentAcademy team has replied to your feedback ticket.`
    : `${senderName} has replied to their feedback ticket.`

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background:#4f46e5;padding:24px 32px;">
        <h1 style="margin:0;color:white;font-size:18px;font-weight:600;">TalentAcademy Feedback</h1>
      </div>

      <!-- Body -->
      <div style="padding:32px;">
        <p style="margin:0 0 16px;color:#374151;font-size:15px;">${greeting}</p>
        <p style="margin:0 0 24px;color:#374151;font-size:15px;">${intro}</p>

        <!-- Ticket Info -->
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:0 0 24px;">
          <p style="margin:0 0 4px;color:#6b7280;font-size:13px;font-weight:600;">Ticket #${ticketNumber}</p>
          <p style="margin:0;color:#111827;font-size:15px;font-weight:500;">${ticketTitle}</p>
        </div>

        <!-- Message -->
        <div style="border-left:3px solid #4f46e5;padding:12px 16px;margin:0 0 24px;background:#eef2ff;border-radius:0 8px 8px 0;">
          <p style="margin:0 0 4px;color:#6b7280;font-size:13px;font-weight:600;">${senderName}</p>
          <p style="margin:0;color:#374151;font-size:15px;white-space:pre-wrap;">${messageText}</p>
        </div>

        <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
          Log in to TalentAcademy to view the full conversation and reply.
        </p>
      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #e5e7eb;padding:16px 32px;text-align:center;">
        <p style="margin:0;color:#9ca3af;font-size:12px;">TalentAcademy.ph — AI-Powered Learning Platform</p>
      </div>
    </div>
  </div>
</body>
</html>`
}
