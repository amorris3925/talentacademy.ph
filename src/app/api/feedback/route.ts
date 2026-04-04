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

// POST /api/feedback — Create a new ticket
export async function POST(req: NextRequest) {
  const user = await getSupabaseUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const learner = await getLearner(user.id)
  if (!learner) return NextResponse.json({ error: 'Learner not found' }, { status: 404 })

  const body = await req.json()
  const { title, description, category, page_url, page_path, context_data } = body

  if (!title?.trim() || !description?.trim()) {
    return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
  }

  const displayName = `${learner.first_name} ${learner.last_name}`.trim()

  const { data: ticket, error } = await supabaseAdmin
    .from('feedback_tickets')
    .insert({
      user_id: user.id,
      user_email: learner.email,
      user_display_name: displayName,
      title: title.trim(),
      description: description.trim(),
      category: category || 'other',
      page_url: page_url || '',
      page_path: page_path || null,
      context_data: context_data || {},
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create ticket:', error)
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 })
  }

  // Trigger AI analysis in background (non-blocking)
  analyzeTicketInBackground(ticket.id, title, description, context_data).catch(console.error)

  return NextResponse.json(ticket, { status: 201 })
}

// GET /api/feedback — List tickets
export async function GET(req: NextRequest) {
  const user = await getSupabaseUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const learner = await getLearner(user.id)
  if (!learner) return NextResponse.json({ error: 'Learner not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  if (learner.role === 'admin') {
    // Admin: query the admin view
    let query = supabaseAdmin
      .from('v_admin_feedback_dashboard')
      .select('*')

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) {
      console.error('Failed to load tickets:', error)
      return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 })
    }
    return NextResponse.json(data)
  } else {
    // User: only their tickets
    let query = supabaseAdmin
      .from('v_feedback_tickets_with_latest')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) {
      console.error('Failed to load tickets:', error)
      return NextResponse.json({ error: 'Failed to load tickets' }, { status: 500 })
    }
    return NextResponse.json(data)
  }
}

// Background AI analysis using Gemini
async function analyzeTicketInBackground(
  ticketId: string,
  title: string,
  description: string,
  contextData: Record<string, unknown>,
) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return

  try {
    const contextSummary = JSON.stringify({
      console_errors: contextData?.console_errors || [],
      recent_api_requests: contextData?.recent_api_requests || [],
      browser: contextData?.browser,
      url: contextData?.url,
    })

    const prompt = `You are analyzing a user feedback ticket for a learning management platform called TalentAcademy.

Title: ${title}
Description: ${description}
Technical Context: ${contextSummary}

Provide two things:
1. PROBLEM DIAGNOSIS: A clear, concise diagnosis of what the user is experiencing. If there are console errors or failed API requests, analyze those.
2. RECOMMENDED FIX: Practical steps to resolve the issue.

Keep both sections under 200 words each. Be specific and actionable.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    )

    if (!response.ok) return

    const result = await response.json()
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Parse the response
    const diagnosisMatch = text.match(/PROBLEM DIAGNOSIS[:\s]*\n?([\s\S]*?)(?=RECOMMENDED FIX|$)/i)
    const fixMatch = text.match(/RECOMMENDED FIX[:\s]*\n?([\s\S]*?)$/i)

    const diagnosis = diagnosisMatch?.[1]?.trim() || text
    const fix = fixMatch?.[1]?.trim() || ''

    await supabaseAdmin
      .from('feedback_tickets')
      .update({
        ai_problem_diagnosis: diagnosis,
        ai_recommended_fix: fix,
        ai_analysis_model: 'gemini-2.0-flash',
        ai_analyzed_at: new Date().toISOString(),
      })
      .eq('id', ticketId)
  } catch (error) {
    console.error('AI analysis failed:', error)
  }
}
