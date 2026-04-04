'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { useGenerationStore } from '@/stores/generation';
import { Button, Select } from '@/components/ui';
import { GenerationPreview } from './GenerationPreview';
import { ImageEvaluationPanel } from './ImageEvaluationPanel';
import type { AcademyGeneration } from '@/types';

const styles = [
  { value: 'realistic', label: 'Realistic' },
  { value: 'anime', label: 'Anime' },
  { value: '3d', label: '3D' },
  { value: 'pixel', label: 'Pixel Art' },
  { value: 'watercolor', label: 'Watercolor' },
];

const sizes = [
  { value: '512', label: '512px' },
  { value: '768', label: '768px' },
  { value: '1024', label: '1024px' },
];

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [width, setWidth] = useState('1024');
  const [height, setHeight] = useState('1024');
  const [result, setResult] = useState<AcademyGeneration | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [refineTrigger, setRefineTrigger] = useState(0);

  const { generateImage, cancelPolling } = useGenerationStore();
  const activeGeneration = useGenerationStore((s) => s.activeGeneration);
  const generatingTypes = useGenerationStore((s) => s.generatingTypes);
  const isGenerating = generatingTypes.includes('image');

  useEffect(() => () => { cancelPolling(); }, [cancelPolling]);

  // Auto-trigger generation after refinement updates state
  useEffect(() => {
    if (refineTrigger > 0) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refineTrigger]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError(null);
    try {
      const gen = await generateImage(prompt, {
        style,
        width: parseInt(width, 10),
        height: parseInt(height, 10),
        negative_prompt: null,
      });
      setResult(gen);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    }
  };

  return (
    <div className="space-y-5">
      {/* Prompt */}
      <div>
        <label htmlFor="image-gen-prompt" className="mb-1.5 block text-sm font-medium text-gray-700">
          Prompt
        </label>
        <textarea
          id="image-gen-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A vibrant sunset over a tropical beach with palm trees..."
          rows={4}
          maxLength={2000}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        />
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Style"
          options={styles}
          value={style}
          onChange={(e) => setStyle(e.target.value)}
        />
        <Select
          label="Width"
          options={sizes}
          value={width}
          onChange={(e) => setWidth(e.target.value)}
        />
        <Select
          label="Height"
          options={sizes}
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
      </div>

      {/* Generate */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!prompt.trim() || isGenerating}
        className="w-full"
      >
        <Sparkles className="h-4 w-4" />
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </Button>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* In-progress preview */}
      {isGenerating && activeGeneration && activeGeneration.type === 'image' && (
        <div className="rounded-xl border border-gray-200 p-4">
          <GenerationPreview generation={activeGeneration} />
        </div>
      )}

      {/* Result */}
      {result && !isGenerating && (
        <div className="rounded-xl border border-gray-200 p-4">
          <GenerationPreview generation={result} />
        </div>
      )}

      {/* Evaluation panel */}
      {result && result.status === 'completed' && result.type === 'image' && !isGenerating && (
        <ImageEvaluationPanel
          generation={result}
          originalPrompt={prompt}
          originalParams={{ style, width: parseInt(width, 10), height: parseInt(height, 10), negative_prompt: null }}
          onRefine={(newPrompt, newParams) => {
            setPrompt(newPrompt);
            if (newParams.style) setStyle(newParams.style);
            if (newParams.width) setWidth(String(newParams.width));
            if (newParams.height) setHeight(String(newParams.height));
            setRefineTrigger((t) => t + 1);
          }}
          context="studio"
        />
      )}

      {/* Empty state */}
      {!result && !isGenerating && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <ImageIcon className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            Your generated images will appear here
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Enter a prompt and click generate to get started
          </p>
        </div>
      )}
    </div>
  );
}
