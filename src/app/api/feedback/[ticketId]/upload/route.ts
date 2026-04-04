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

// POST /api/feedback/[ticketId]/upload — Upload an attachment
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const user = await getSupabaseUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const learner = await getLearner(user.id)
  if (!learner) return NextResponse.json({ error: 'Learner not found' }, { status: 404 })

  const { ticketId } = await params

  // Verify ticket exists
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

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  // Upload to Supabase Storage
  const timestamp = Date.now()
  const randomHex = Math.random().toString(16).slice(2, 10)
  const ext = file.name.split('.').pop() || 'bin'
  const storagePath = `${ticketId}/${timestamp}_${randomHex}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabaseAdmin.storage
    .from('feedback-attachments')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('Upload failed:', uploadError)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from('feedback-attachments')
    .getPublicUrl(storagePath)

  // Save attachment record
  const { data: attachment, error: insertError } = await supabaseAdmin
    .from('feedback_attachments')
    .insert({
      ticket_id: ticketId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
      storage_url: urlData.publicUrl,
      uploaded_by: user.id,
      uploaded_by_email: learner.email,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Failed to save attachment record:', insertError)
    return NextResponse.json({ error: 'Failed to save attachment' }, { status: 500 })
  }

  return NextResponse.json(attachment, { status: 201 })
}
