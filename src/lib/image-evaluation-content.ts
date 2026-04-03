import type { ImageGenParams } from '@/types';

// --- Follow-up questions ---

const FOLLOW_UP_QUESTIONS = [
  { question: 'How does this compare to what you imagined?', placeholder: 'Describe what matches or differs from your vision...' },
  { question: 'What would you change about this image?', placeholder: 'Think about composition, colors, details...' },
  { question: 'Does the style capture the mood you wanted?', placeholder: 'Consider the overall feel and atmosphere...' },
  { question: 'What emotion does this image evoke for you?', placeholder: 'Does it match the emotion you intended?' },
  { question: 'How could this image better tell your story?', placeholder: 'Think about what narrative the image conveys...' },
  { question: 'Rate the composition — what draws your eye first?', placeholder: 'Consider the focal point and visual flow...' },
  { question: 'If you could change one thing, what would it be?', placeholder: 'Pick the single most important adjustment...' },
  { question: 'Does the level of detail match what you envisioned?', placeholder: 'Too much? Too little? Just right?' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getFollowUpQuestion(prompt: string, style: string): { question: string; placeholder: string } {
  const index = hashString(prompt + style) % FOLLOW_UP_QUESTIONS.length;
  return FOLLOW_UP_QUESTIONS[index];
}

// --- Refinement suggestions ---

export interface RefinementSuggestion {
  id: string;
  label: string;
  category: 'lighting' | 'detail' | 'style' | 'composition' | 'prompt';
  modify: (prompt: string, params: ImageGenParams) => { prompt: string; params: ImageGenParams };
}

const ALL_STYLES = ['realistic', 'anime', '3d', 'pixel', 'watercolor'] as const;

export function getRefinementSuggestions(
  prompt: string,
  style: string,
  width: number,
  height: number,
): RefinementSuggestion[] {
  const suggestions: RefinementSuggestion[] = [];

  // Lighting
  suggestions.push({
    id: 'brighter',
    label: 'Make it brighter',
    category: 'lighting',
    modify: (p, params) => ({ prompt: p + ', bright lighting, well-lit', params }),
  });

  suggestions.push({
    id: 'dramatic_lighting',
    label: 'Dramatic lighting',
    category: 'lighting',
    modify: (p, params) => ({ prompt: p + ', dramatic cinematic lighting, strong shadows', params }),
  });

  // Detail
  suggestions.push({
    id: 'more_detailed',
    label: 'More detailed',
    category: 'detail',
    modify: (p, params) => ({ prompt: 'highly detailed, intricate ' + p, params }),
  });

  // Style changes — suggest 2 styles different from current
  const otherStyles = ALL_STYLES.filter((s) => s !== style);
  const styleIndex = hashString(prompt) % otherStyles.length;
  const suggestedStyles = [
    otherStyles[styleIndex],
    otherStyles[(styleIndex + 1) % otherStyles.length],
  ];
  for (const s of suggestedStyles) {
    const label = s === '3d' ? '3D' : s.charAt(0).toUpperCase() + s.slice(1);
    suggestions.push({
      id: `style_${s}`,
      label: `Try ${label} style`,
      category: 'style',
      modify: (p, params) => ({ prompt: p, params: { ...params, style: s } }),
    });
  }

  // Composition — suggest different aspect ratio if currently square
  if (width === height) {
    suggestions.push({
      id: 'landscape',
      label: 'Landscape format',
      category: 'composition',
      modify: (p, params) => ({ prompt: p, params: { ...params, width: 1024, height: 768 } }),
    });
  } else if (width > height) {
    suggestions.push({
      id: 'portrait',
      label: 'Portrait format',
      category: 'composition',
      modify: (p, params) => ({ prompt: p, params: { ...params, width: 768, height: 1024 } }),
    });
  } else {
    suggestions.push({
      id: 'square',
      label: 'Square format',
      category: 'composition',
      modify: (p, params) => ({ prompt: p, params: { ...params, width: 1024, height: 1024 } }),
    });
  }

  // Prompt enhancers
  suggestions.push({
    id: 'cinematic',
    label: 'Add cinematic feel',
    category: 'prompt',
    modify: (p, params) => ({ prompt: p + ', cinematic, film grain, depth of field', params }),
  });

  return suggestions;
}

// --- Educational hints ---

export function getEducationalHints(): string[] {
  return [
    'Style matters: "Realistic" produces photographic results, while "Anime" creates stylized illustrations. "Watercolor" gives a softer, artistic look. Experiment with different styles on the same prompt to see how they transform your idea.',
    'Write descriptive prompts: Instead of "a cat", try "a fluffy orange tabby cat sitting on a windowsill, afternoon sunlight streaming in, cozy apartment background". The more specific you are, the closer the result matches your vision.',
    'Negative prompts tell the AI what to exclude. If you get unwanted text or watermarks, adding "no text, no watermark" as a negative prompt helps clean up the output.',
    'Aspect ratio affects composition: Square (1024×1024) works well for portraits and centered subjects. Landscape formats (1024×768) suit scenery, while portrait formats (768×1024) are ideal for full-body characters or tall structures.',
    'Prompt modifiers are power words that dramatically change results. Try adding: "bokeh background" for blurred backgrounds, "golden hour" for warm lighting, "wide angle lens" for expansive views, or "macro photography" for extreme close-ups.',
  ];
}
