'use client';

import { useEffect, useState } from 'react';
import { Clock, Image as ImageIcon, Video, FileText, AlertCircle } from 'lucide-react';
import { useGenerationStore } from '@/stores/generation';
import { GenerationPreview } from './GenerationPreview';
import { Spinner } from '@/components/ui';
import type { AcademyGeneration } from '@/types';

const TYPE_ICON: Record<string, React.ReactNode> = {
  image: <ImageIcon className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  text: <FileText className="h-4 w-4" />,
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export function GenerationHistory() {
  const { generations, loadHistory } = useGenerationStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await loadHistory();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        setLoading(false);
      }
    })();
  }, [loadHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
        <Clock className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">No generations yet</p>
        <p className="mt-1 text-xs text-gray-400">
          Your generated images, videos, and text will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {generations.map((gen: AcademyGeneration) => (
        <div
          key={gen.id}
          className="rounded-lg border border-gray-200 bg-white overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setExpanded(expanded === gen.id ? null : gen.id)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              {TYPE_ICON[gen.type] || <FileText className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {gen.prompt}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 capitalize">{gen.type}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">{formatTime(gen.created_at)}</span>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                gen.status === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : gen.status === 'failed'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {gen.status}
            </span>
          </button>

          {expanded === gen.id && (
            <div className="border-t border-gray-100 p-4">
              <GenerationPreview generation={gen} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
