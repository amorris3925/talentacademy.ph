import type { GenerationType } from '@/types';

export interface GenerationStage {
  label: string;
  threshold: number; // progress % at which this stage starts
}

export interface GenerationTimingConfig {
  expectedDurationMs: number;
  tau: number; // time constant for exponential curve
  maxProgress: number; // cap before completion (e.g. 95)
  stages: GenerationStage[];
}

export const GENERATION_TIMING: Record<GenerationType, GenerationTimingConfig> = {
  image: {
    expectedDurationMs: 20_000,
    tau: 8_000,
    maxProgress: 95,
    stages: [
      { label: 'Analyzing your prompt...', threshold: 0 },
      { label: 'Generating image...', threshold: 15 },
      { label: 'Adding final details...', threshold: 70 },
      { label: 'Almost there...', threshold: 90 },
    ],
  },
  video: {
    expectedDurationMs: 90_000,
    tau: 30_000,
    maxProgress: 95,
    stages: [
      { label: 'Analyzing your prompt...', threshold: 0 },
      { label: 'Generating video frames...', threshold: 10 },
      { label: 'Rendering video...', threshold: 50 },
      { label: 'Finalizing...', threshold: 80 },
      { label: 'Almost there...', threshold: 92 },
    ],
  },
  audio: {
    expectedDurationMs: 15_000,
    tau: 6_000,
    maxProgress: 95,
    stages: [
      { label: 'Processing text...', threshold: 0 },
      { label: 'Generating speech...', threshold: 20 },
      { label: 'Refining audio...', threshold: 70 },
      { label: 'Almost there...', threshold: 90 },
    ],
  },
  music: {
    expectedDurationMs: 25_000,
    tau: 10_000,
    maxProgress: 95,
    stages: [
      { label: 'Analyzing your prompt...', threshold: 0 },
      { label: 'Composing melody...', threshold: 15 },
      { label: 'Adding instruments...', threshold: 50 },
      { label: 'Mixing and mastering...', threshold: 75 },
      { label: 'Almost there...', threshold: 90 },
    ],
  },
  text: {
    expectedDurationMs: 10_000,
    tau: 4_000,
    maxProgress: 95,
    stages: [
      { label: 'Processing request...', threshold: 0 },
      { label: 'Generating text...', threshold: 20 },
      { label: 'Finishing up...', threshold: 80 },
    ],
  },
};

export const GENERATION_TIPS: Record<GenerationType, string[]> = {
  image: [
    'Adding "cinematic lighting" to your prompt can dramatically improve results.',
    'Specific descriptions like "golden hour sunlight" work better than "nice lighting".',
    'Mentioning art styles like "oil painting" or "digital art" changes the entire feel.',
    'Try including a mood or atmosphere — "mysterious", "serene", "energetic".',
    'Describing the camera angle ("low angle", "bird\'s eye view") adds depth to compositions.',
    'Negative prompts help remove unwanted elements — try "no text, no watermark".',
    'Square images (1024x1024) work best for portraits, while wider ratios suit landscapes.',
    'Combining two unexpected concepts often creates the most striking images.',
    'Details about textures ("rough stone", "smooth glass") make images more realistic.',
    'Color palettes in your prompt ("warm tones", "pastel colors") set the mood instantly.',
  ],
  video: [
    'Keep prompts focused on a single action or scene for best results.',
    'Describing camera movement ("slow pan", "tracking shot") adds cinematic quality.',
    'Shorter videos (5s) tend to have higher quality than longer ones.',
    'Include the setting and lighting for more consistent video output.',
    'Smooth transitions work better than abrupt scene changes in AI video.',
  ],
  audio: [
    'Punctuation affects pacing — commas add pauses, periods add longer breaks.',
    'Different voices have different strengths — try a few to find the best match.',
    'Adjusting speed can make narration feel more natural for different content types.',
    'Short sentences are clearer and more impactful in generated speech.',
  ],
  music: [
    'Specifying tempo ("upbeat", "slow and dreamy") greatly affects the output.',
    'Combining genres like "jazz-electronic fusion" can create unique sounds.',
    'Mentioning specific instruments helps guide the composition.',
    'Mood descriptors ("melancholic", "triumphant") shape the emotional tone.',
    'Referencing a decade ("80s synth", "90s hip hop") gives stylistic direction.',
  ],
  text: [
    'Be specific about the format you want — list, paragraph, dialogue, etc.',
    'Providing context about your audience helps tailor the tone.',
    'Asking for a specific length helps get more focused results.',
  ],
};

/** Get the current stage label based on progress percentage */
export function getStageLabel(type: GenerationType, progress: number): string {
  const stages = GENERATION_TIMING[type].stages;
  let label = stages[0].label;
  for (const stage of stages) {
    if (progress >= stage.threshold) {
      label = stage.label;
    }
  }
  return label;
}
