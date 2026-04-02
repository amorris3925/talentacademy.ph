'use client';

import { Sparkles } from 'lucide-react';
import { GenerationStudio } from '@/components/generation/GenerationStudio';

export default function StudioPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Generation Studio
            </h1>
            <p className="text-sm text-gray-500">
              Generate text, images, videos, audio, and music with AI
            </p>
          </div>
        </div>
      </div>

      <GenerationStudio />
    </div>
  );
}
