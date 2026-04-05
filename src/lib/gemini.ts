import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

function getClient() {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(GEMINI_API_KEY);
}

const VISION_MODEL = 'gemini-2.0-flash';
const IMAGE_GEN_MODEL = 'gemini-2.0-flash-exp-image-generation'; // native image generation model

const DESCRIBE_SYSTEM_PROMPT =
  'You are a visual analysis assistant for an educational platform. ' +
  'Describe images in detail for an AI tutor that cannot see images. ' +
  'Include: visual elements, any text or labels, colors, layout, diagrams, ' +
  'and educational relevance. Be concise but thorough — 2-4 sentences.';

/**
 * Describe a single image using Gemini vision.
 * Accepts either base64 data or a URL (which will be fetched and converted).
 */
export async function describeImage(
  image: { data?: string; media_type?: string; url?: string },
  context?: string,
): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: VISION_MODEL,
    systemInstruction: DESCRIBE_SYSTEM_PROMPT,
  });

  let inlineData: { mimeType: string; data: string };

  if (image.data && image.media_type) {
    inlineData = { mimeType: image.media_type, data: image.data };
  } else if (image.url) {
    const res = await fetch(image.url);
    if (!res.ok) return `[Could not fetch image from ${image.url}]`;
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = res.headers.get('content-type') || 'image/jpeg';
    inlineData = { mimeType, data: base64 };
  } else {
    return '[No image data provided]';
  }

  const prompt = context
    ? `Describe this image. Context: this is from "${context}".`
    : 'Describe this image.';

  const result = await model.generateContent([
    prompt,
    { inlineData },
  ]);

  return result.response.text();
}

/**
 * Describe multiple images in parallel.
 */
export async function describeImages(
  images: { data?: string; media_type?: string; url?: string }[],
  context?: string,
): Promise<string[]> {
  return Promise.all(images.map((img) => describeImage(img, context)));
}

/**
 * Generate an image using Gemini's image generation capability.
 * Returns base64 image data or throws on failure.
 */
export async function generateImageFromPrompt(
  prompt: string,
  style?: string,
): Promise<{ base64: string; media_type: string }> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: IMAGE_GEN_MODEL });

  const fullPrompt = style
    ? `Create an image in ${style} style: ${prompt}`
    : `Create an image: ${prompt}`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'] as unknown as undefined,
    } as Record<string, unknown>,
  });

  const response = result.response;
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('No image generated — empty response from Gemini');
  }

  for (const part of candidates[0].content.parts) {
    if (part.inlineData) {
      return {
        base64: part.inlineData.data,
        media_type: part.inlineData.mimeType,
      };
    }
  }

  throw new Error('No image data in Gemini response');
}
