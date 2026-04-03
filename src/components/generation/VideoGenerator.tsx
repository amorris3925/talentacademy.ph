'use client';

import { useState, useRef } from 'react';
import { Sparkles, Video, UploadCloud } from 'lucide-react';
import { useGenerationStore } from '@/stores/generation';
import { Button, Select } from '@/components/ui';
import { GenerationPreview } from './GenerationPreview';
import type { AcademyGeneration } from '@/types';

const videoStyles = [
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'animation', label: 'Animation' },
  { value: 'documentary', label: 'Documentary' },
];

const durations = [
  { value: '3', label: '3 seconds' },
  { value: '5', label: '5 seconds' },
  { value: '10', label: '10 seconds' },
];

export function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState('5');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImageName, setSourceImageName] = useState<string | null>(null);
  const [result, setResult] = useState<AcademyGeneration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { generateVideo, isGenerating } = useGenerationStore();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError(null);
    try {
      const gen = await generateVideo(prompt, {
        style,
        duration: parseInt(duration, 10),
        resolution: null,
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
        <label htmlFor="video-gen-prompt" className="mb-1.5 block text-sm font-medium text-gray-700">
          Prompt
        </label>
        <textarea
          id="video-gen-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A drone shot flying over a mountain range at golden hour..."
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        />
      </div>

      {/* Source Image (optional) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Source Image (optional, for image-to-video)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <UploadCloud className="h-5 w-5" />
          {sourceImageName || 'Upload a source image'}
        </button>
        {sourceImage && (
          <div className="mt-2 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sourceImage}
              alt="Source"
              className="h-16 w-16 rounded-md object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setSourceImage(null);
                setSourceImageName(null);
              }}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Duration"
          options={durations}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <Select
          label="Style"
          options={videoStyles}
          value={style}
          onChange={(e) => setStyle(e.target.value)}
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
        {isGenerating ? 'Generating...' : 'Generate Video'}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="rounded-xl border border-gray-200 p-4">
          <GenerationPreview generation={result} />
        </div>
      )}

      {!result && !isGenerating && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Video className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            Your generated videos will appear here
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Enter a prompt and click generate to get started
          </p>
        </div>
      )}
    </div>
  );
}
