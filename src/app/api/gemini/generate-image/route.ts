import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/auth-helpers';
import { generateImageFromPrompt } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json(
      { error: 'You must be signed in', code: 'NOT_AUTHENTICATED' },
      { status: 401 },
    );
  }

  const body = await req.json();
  const { prompt, style } = body as {
    prompt?: string;
    style?: string;
  };

  if (!prompt) {
    return NextResponse.json(
      { error: 'No prompt provided', code: 'BAD_REQUEST' },
      { status: 400 },
    );
  }

  try {
    const result = await generateImageFromPrompt(prompt, style);
    return NextResponse.json({
      base64: result.base64,
      media_type: result.media_type,
    });
  } catch (error) {
    console.error('[gemini/generate-image] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image', code: 'GEMINI_ERROR' },
      { status: 502 },
    );
  }
}
