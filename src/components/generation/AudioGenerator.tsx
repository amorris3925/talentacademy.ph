'use client';

import { useState } from 'react';
import { Sparkles, Mic } from 'lucide-react';
import { useGenerationStore } from '@/stores/generation';
import { Button, Select } from '@/components/ui';
import { GenerationPreview } from './GenerationPreview';
import type { AcademyGeneration } from '@/types';

const voices = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'nova', label: 'Nova' },
  { value: 'shimmer', label: 'Shimmer' },
];

export function AudioGenerator() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('alloy');
  const [speed, setSpeed] = useState(1.0);
  const [result, setResult] = useState<AcademyGeneration | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { generateAudio, isGenerating } = useGenerationStore();

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setError(null);
    try {
      const gen = await generateAudio(text, {
        voice,
        speed,
        format: null,
      });
      setResult(gen);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    }
  };

  return (
    <div className="space-y-5">
      {/* Text Input */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Text to speak
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the text you want to convert to speech..."
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        />
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Voice"
          options={voices}
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
        />

        {/* Speed Slider */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Speed: {speed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>
      </div>

      {/* Generate */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!text.trim()}
        className="w-full"
      >
        <Sparkles className="h-4 w-4" />
        Generate Audio
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="rounded-xl border border-gray-200 p-4">
          <GenerationPreview generation={result} />
        </div>
      )}

      {!result && !isGenerating && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Mic className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            Your generated audio will appear here
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Enter text and click generate to get started
          </p>
        </div>
      )}
    </div>
  );
}
