'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Video, Music, Mic } from 'lucide-react';
import { useGenerationStore } from '@/stores/generation';
import { Button, Select } from '@/components/ui';
import { GenerationPreview } from '@/components/generation/GenerationPreview';
import { ImageEvaluationPanel } from '@/components/generation/ImageEvaluationPanel';
import type { AcademyGeneration, GenerationType } from '@/types';

interface GenerationBlockProps {
  metadata: {
    gen_type: GenerationType;
    prompt_hint?: string;
  };
}

const typeIcons: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  audio: Mic,
  music: Music,
};

const imageStyles = [
  { value: 'realistic', label: 'Realistic' },
  { value: 'anime', label: 'Anime' },
  { value: '3d', label: '3D' },
  { value: 'watercolor', label: 'Watercolor' },
];

const videoStyles = [
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'animation', label: 'Animation' },
  { value: 'documentary', label: 'Documentary' },
];

const voiceOptions = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'nova', label: 'Nova' },
  { value: 'shimmer', label: 'Shimmer' },
];

const musicGenres = [
  { value: 'ambient', label: 'Ambient' },
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'classical', label: 'Classical' },
];

export function GenerationBlock({ metadata }: GenerationBlockProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [voice, setVoice] = useState('alloy');
  const [genre, setGenre] = useState('ambient');
  const [result, setResult] = useState<AcademyGeneration | null>(null);
  const [refineTrigger, setRefineTrigger] = useState(0);

  const { generateImage, generateVideo, generateAudio, generateMusic, isGenerating } =
    useGenerationStore();
  const activeGeneration = useGenerationStore((s) => s.activeGeneration);

  const Icon = typeIcons[metadata.gen_type] || Sparkles;

  // Auto-trigger generation after refinement updates state
  useEffect(() => {
    if (refineTrigger > 0) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refineTrigger]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      let gen: AcademyGeneration;
      switch (metadata.gen_type) {
        case 'image':
          gen = await generateImage(prompt, { style, width: 1024, height: 1024, negative_prompt: null });
          break;
        case 'video':
          gen = await generateVideo(prompt, { style, duration: 5, resolution: null });
          break;
        case 'audio':
          gen = await generateAudio(prompt, { voice, speed: 1.0, format: null });
          break;
        case 'music':
          gen = await generateMusic(prompt, { genre, duration: 30, mood: null, instruments: null });
          break;
        default:
          return;
      }
      setResult(gen);
    } catch {
      // Error handled by store
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3">
        <Icon className="h-4 w-4 text-indigo-600" />
        <span className="text-sm font-medium capitalize text-gray-900">
          {metadata.gen_type} Generation
        </span>
      </div>

      <div className="space-y-3 p-4">
        {/* Prompt */}
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={metadata.prompt_hint || `Describe what you want to generate...`}
            rows={3}
            aria-label="Generation prompt"
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          />
        </div>

        {/* Style Controls */}
        {metadata.gen_type === 'image' && (
          <Select
            label="Style"
            options={imageStyles}
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="Select style"
          />
        )}

        {metadata.gen_type === 'video' && (
          <Select
            label="Style"
            options={videoStyles}
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="Select style"
          />
        )}

        {metadata.gen_type === 'audio' && (
          <Select
            label="Voice"
            options={voiceOptions}
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
          />
        )}

        {metadata.gen_type === 'music' && (
          <Select
            label="Genre"
            options={musicGenres}
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          />
        )}

        {/* Generate Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleGenerate}
          isLoading={isGenerating}
          disabled={!prompt.trim()}
          className="w-full"
        >
          <Sparkles className="h-4 w-4" />
          Generate
        </Button>

        {/* In-progress preview */}
        {isGenerating && activeGeneration && activeGeneration.type === metadata.gen_type && (
          <div className="mt-3 rounded-lg border border-gray-200 p-3">
            <GenerationPreview generation={activeGeneration} />
          </div>
        )}

        {/* Result */}
        {result && !isGenerating && (
          <div className="mt-3 rounded-lg border border-gray-200 p-3">
            <GenerationPreview generation={result} />
          </div>
        )}

        {/* Evaluation panel for completed image generations */}
        {result && result.status === 'completed' && metadata.gen_type === 'image' && !isGenerating && (
          <ImageEvaluationPanel
            generation={result}
            originalPrompt={prompt}
            originalParams={{ style, width: 1024, height: 1024, negative_prompt: null }}
            onRefine={(newPrompt, newParams) => {
              setPrompt(newPrompt);
              if (newParams.style) setStyle(newParams.style);
              setRefineTrigger((t) => t + 1);
            }}
            context="lesson"
          />
        )}
      </div>
    </div>
  );
}
