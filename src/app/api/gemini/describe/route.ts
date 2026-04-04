import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/auth-helpers';
import { describeImages } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  const user = await getSupabaseUser();
  if (!user) {
    return NextResponse.json(
      { error: 'You must be signed in', code: 'NOT_AUTHENTICATED' },
      { status: 401 },
    );
  }

  const body = await req.json();
  const { images, context } = body as {
    images?: { data?: string; media_type?: string; url?: string }[];
    context?: string;
  };

  if (!images || images.length === 0) {
    return NextResponse.json(
      { error: 'No images provided', code: 'BAD_REQUEST' },
      { status: 400 },
    );
  }

  // Cap at 5 images per request to control costs
  const capped = images.slice(0, 5);

  try {
    const descriptions = await describeImages(capped, context);
    return NextResponse.json({ descriptions });
  } catch (error) {
    console.error('[gemini/describe] Error:', error);
    return NextResponse.json(
      { error: 'Failed to describe images', code: 'GEMINI_ERROR' },
      { status: 502 },
    );
  }
}
