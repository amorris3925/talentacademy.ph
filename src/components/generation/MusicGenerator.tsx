'use client';

import { useState } from 'react';
import { Sparkles, Music } from 'lucide-react';
import { useGenerationStore } from '@/stores/generation';
import { Button, Select } from '@/components/ui';
import { GenerationPreview } from './GenerationPreview';
import type { AcademyGeneration } from '@/types';

const genres = [
  { value: 'ambient', label: 'Ambient' },
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'classical', label: 'Classical' },
];

const musicDurations = [
  { value: '15', label: '15 seconds' },
  { value: '30', label: '30 seconds' },
  { value: '60', label: '60 seconds' },
];

export function MusicGenerator() {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('ambient');
  const [duration, setDuration] = useState('30');
  const [result, setResult] = useState<AcademyGeneration | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { generateMusic, isGenerating } = useGenerationStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError(null);
    try {
      const gen = await generateMusic(prompt, {
        genre,
        duration: parseInt(duration, 10),
        mood: null,
        instruments: null,
      });
      setResult(gen);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    }
  };

  return (
    <div className="space-y-5">
      {/* Coming Soon Banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm font-semibold text-amber-800">Coming Soon</p>
        <p className="mt-0.5 text-xs text-amber-700">
          Music generation is being integrated with the MiniMax API. Use the Text tab for AI generation in the meantime.
        </p>
      </div>

      {/* Prompt */}
      <div>
        <label htmlFor="music-gen-prompt" className="mb-1.5 block text-sm font-medium text-gray-700">
          Prompt
        </label>
        <textarea
          id="music-gen-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A calming lo-fi track with soft piano and rain sounds..."
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        />
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Duration"
          options={musicDurations}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <Select
          label="Genre"
          options={genres}
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
      </div>

      {/* Generate */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled
        className="w-full opacity-50 cursor-not-allowed"
      >
        <Sparkles className="h-4 w-4" />
        Generate Music (Coming Soon)
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="rounded-xl border border-gray-200 p-4">
          <GenerationPreview generation={result} />
        </div>
      )}

      {!result && !isGenerating && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Music className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            Your generated music will appear here
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Enter a prompt and click generate to get started
          </p>
        </div>
      )}
    </div>
  );
}
