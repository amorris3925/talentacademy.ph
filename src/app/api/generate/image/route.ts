import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_IMAGE_API_KEY || process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = 'gemini-2.0-flash-preview-image-generation'

async function getSupabaseUser() {
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
            try {
              cookieStore.set(name, value, options)
            } catch {
              // Server component — ignore
            }
          })
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

interface GeminiPart {
  text?: string
  inlineData?: { mimeType: string; data: string }
}

interface GeminiCandidate {
  content: { parts: GeminiPart[] }
}

interface GeminiResponse {
  candidates?: GeminiCandidate[]
  error?: { message: string; code: number }
}

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Image generation not configured (missing Gemini API key)', status: 'failed' },
      { status: 503 }
    )
  }

  const user = await getSupabaseUser()
  if (!user) {
    return NextResponse.json(
      { error: 'You must be signed in to use this feature', status: 'failed' },
      { status: 401 }
    )
  }

  let body: { prompt?: string; style?: string; width?: number; height?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body', status: 'failed' },
      { status: 400 }
    )
  }

  const { prompt, style, width, height } = body
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json(
      { error: 'Prompt is required', status: 'failed' },
      { status: 400 }
    )
  }

  // Build the image prompt with style context
  const styleMap: Record<string, string> = {
    realistic: 'photorealistic, high quality photograph',
    anime: 'anime art style, vibrant colors',
    '3d': '3D rendered, high quality CGI',
    pixel: 'pixel art style, retro game aesthetic',
    watercolor: 'watercolor painting style, soft colors',
  }
  const styleHint = style && styleMap[style] ? `, in ${styleMap[style]}` : ''
  const sizeHint = width && height ? ` (${width}x${height} resolution)` : ''
  const fullPrompt = `Generate an image: ${prompt}${styleHint}${sizeHint}`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      }),
      signal: AbortSignal.timeout(120000),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => '')
      console.error('[image-gen] Gemini API error:', geminiRes.status, errText)
      return NextResponse.json(
        { error: `Image generation failed (${geminiRes.status})`, status: 'failed' },
        { status: 502 }
      )
    }

    const data: GeminiResponse = await geminiRes.json()

    if (data.error) {
      console.error('[image-gen] Gemini error:', data.error.message)
      return NextResponse.json(
        { error: data.error.message, status: 'failed' },
        { status: 502 }
      )
    }

    // Extract image from response
    const parts = data.candidates?.[0]?.content?.parts
    if (!parts) {
      return NextResponse.json(
        { error: 'No image generated — try a different prompt', status: 'failed' },
        { status: 502 }
      )
    }

    const imagePart = parts.find((p) => p.inlineData?.mimeType?.startsWith('image/'))
    if (!imagePart?.inlineData) {
      return NextResponse.json(
        { error: 'No image in response — try a different prompt', status: 'failed' },
        { status: 502 }
      )
    }

    const { mimeType, data: base64Data } = imagePart.inlineData
    const resultUrl = `data:${mimeType};base64,${base64Data}`

    return NextResponse.json({
      id: crypto.randomUUID(),
      type: 'image',
      prompt,
      status: 'completed',
      result_url: resultUrl,
      error: null,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[image-gen] Unexpected error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Image generation failed: ${message}`, status: 'failed' },
      { status: 500 }
    )
  }
}
