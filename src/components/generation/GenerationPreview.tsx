'use client';

import { Download, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import type { AcademyGeneration } from '@/types';

interface GenerationPreviewProps {
  generation: AcademyGeneration;
}

export function GenerationPreview({ generation }: GenerationPreviewProps) {
  if (generation.status === 'pending' || generation.status === 'processing') {
    return (
      <div className="flex items-center justify-center rounded-lg bg-gray-50 py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <p className="text-sm text-gray-500">
            {generation.status === 'pending'
              ? 'Queued...'
              : 'Processing...'}
          </p>
        </div>
      </div>
    );
  }

  if (generation.status === 'failed') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
        <p className="text-sm text-red-700">
          {generation.error || 'Generation failed. Please try again.'}
        </p>
      </div>
    );
  }

  // --- Completed ---

  const handleDownload = () => {
    if (!generation.result_url) return;
    const a = document.createElement('a');
    a.href = generation.result_url;
    a.download = `generation-${generation.id}.${getExtension(generation.type)}`;
    a.target = '_blank';
    a.click();
  };

  switch (generation.type) {
    case 'image':
      return (
        <div className="space-y-2">
          {generation.result_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={generation.result_url}
              alt={generation.prompt}
              className="w-full rounded-lg"
              loading="lazy"
            />
          )}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="space-y-2">
          {generation.result_url && (
            <video
              src={generation.result_url}
              controls
              className="w-full rounded-lg"
              preload="metadata"
            />
          )}
        </div>
      );

    case 'audio':
    case 'music':
      return (
        <div className="space-y-3">
          {generation.result_url && (
            <audio
              src={generation.result_url}
              controls
              className="w-full"
              preload="metadata"
            />
          )}
          {/* Simple waveform visualization */}
          <div className="flex h-12 items-end justify-center gap-0.5">
            {Array.from({ length: 40 }).map((_, i) => {
              const height = 20 + Math.random() * 80;
              return (
                <div
                  key={i}
                  className="w-1 rounded-full bg-indigo-300"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="whitespace-pre-wrap text-sm text-gray-800">
            {generation.result_text || 'No text generated.'}
          </p>
        </div>
      );

    default:
      return (
        <p className="text-sm text-gray-500">
          Unknown generation type: {generation.type}
        </p>
      );
  }
}

function getExtension(type: string): string {
  switch (type) {
    case 'image':
      return 'png';
    case 'video':
      return 'mp4';
    case 'audio':
      return 'mp3';
    case 'music':
      return 'mp3';
    default:
      return 'bin';
  }
}
