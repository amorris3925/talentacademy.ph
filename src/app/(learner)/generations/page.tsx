'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Image as ImageIcon,
  Video,
  AudioLines,
  Music,
  FileText,
  X,
  Layers,
} from 'lucide-react';
import { academyApi } from '@/lib/api';
import { formatDate, truncate } from '@/lib/utils';
import { Card, Spinner, Badge, Button, Tabs, EmptyState } from '@/components/ui';
import type { AcademyGeneration, GenerationType, PaginatedResponse } from '@/types';

const TYPE_TABS = [
  { key: 'all', label: 'All', icon: <Layers className="h-4 w-4" /> },
  { key: 'image', label: 'Images', icon: <ImageIcon className="h-4 w-4" /> },
  { key: 'video', label: 'Videos', icon: <Video className="h-4 w-4" /> },
  { key: 'audio', label: 'Audio', icon: <AudioLines className="h-4 w-4" /> },
  { key: 'music', label: 'Music', icon: <Music className="h-4 w-4" /> },
];

const TYPE_BADGE_VARIANT: Record<GenerationType, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
  image: 'info',
  video: 'success',
  audio: 'warning',
  music: 'danger',
  text: 'default',
};

const TYPE_ICON: Record<GenerationType, React.ReactNode> = {
  image: <ImageIcon className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  audio: <AudioLines className="h-5 w-5" />,
  music: <Music className="h-5 w-5" />,
  text: <FileText className="h-5 w-5" />,
};

export default function GenerationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [items, setItems] = useState<AcademyGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [preview, setPreview] = useState<AcademyGeneration | null>(null);

  const fetchGenerations = useCallback(
    async (reset: boolean = false) => {
      if (reset) {
        setLoading(true);
        setItems([]);
      } else {
        setLoadingMore(true);
      }

      try {
        const params: Record<string, string | number | boolean | undefined> = {
          limit: 20,
        };
        if (activeTab !== 'all') params.type = activeTab;
        if (!reset && cursor) params.cursor = cursor;

        const res = await academyApi.get<any>(
          '/learner/generations',
          params,
        );

        const generations = (res.generations || []).map((g: any) => ({
          ...g,
          id: g.generation_id ?? g.id,
        })) as AcademyGeneration[];
        setItems((prev) => (reset ? generations : [...prev, ...generations]));
        setCursor(res.next_cursor ?? null);
        setHasMore(!!res.next_cursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load generations');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab, cursor],
  );

  useEffect(() => {
    fetchGenerations(true);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generation Gallery</h1>
        <p className="mt-1 text-sm text-gray-500">Browse everything you have created with AI.</p>
      </div>

      {/* Filter Tabs */}
      <Tabs tabs={TYPE_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No generations yet"
          description="Create images, videos, audio, and more in your lessons or AI Studio."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((gen) => (
              <Card
                key={gen.id}
                hover
                padding="sm"
                className="cursor-pointer"
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setPreview(gen)}
                >
                  {/* Thumbnail */}
                  <div className="relative mb-3 flex h-40 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    {gen.result_url && (gen.type === 'image' || gen.type === 'video') ? (
                      gen.type === 'image' ? (
                        <img
                          src={gen.result_url}
                          alt={truncate(gen.prompt, 60)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video
                          src={gen.result_url}
                          className="h-full w-full object-cover"
                          muted
                        />
                      )
                    ) : (
                      <div className="text-gray-300">{TYPE_ICON[gen.type]}</div>
                    )}
                    <div className="absolute right-2 top-2">
                      <Badge variant={TYPE_BADGE_VARIANT[gen.type]} size="sm" className="capitalize">
                        {gen.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Info */}
                  <p className="text-sm text-gray-700 line-clamp-2">{truncate(gen.prompt, 100)}</p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(gen.created_at)}</p>
                </button>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="secondary"
                isLoading={loadingMore}
                onClick={() => fetchGenerations(false)}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}

      {/* Full-size Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              onClick={() => setPreview(null)}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <Badge variant={TYPE_BADGE_VARIANT[preview.type]} className="capitalize">
                {preview.type}
              </Badge>

              {/* Media */}
              {preview.result_url && preview.type === 'image' && (
                <img
                  src={preview.result_url}
                  alt={preview.prompt}
                  className="w-full rounded-lg"
                />
              )}
              {preview.result_url && preview.type === 'video' && (
                <video
                  src={preview.result_url}
                  controls
                  className="w-full rounded-lg"
                />
              )}
              {preview.result_url && (preview.type === 'audio' || preview.type === 'music') && (
                <audio src={preview.result_url} controls className="w-full" />
              )}
              {preview.result_text && (
                <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {preview.result_text}
                </div>
              )}

              {/* Prompt */}
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-gray-500">Prompt</p>
                <p className="text-sm text-gray-700">{preview.prompt}</p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                {preview.model && <span>Model: {preview.model}</span>}
                {preview.duration_ms && <span>Duration: {(preview.duration_ms / 1000).toFixed(1)}s</span>}
                <span>{formatDate(preview.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
