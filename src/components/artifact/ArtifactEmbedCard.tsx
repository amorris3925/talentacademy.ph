'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';
import { useArtifactStore } from '@/stores/artifact';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<string, string> = {
  blog_post: 'bg-emerald-100 text-emerald-700',
  seo_article: 'bg-blue-100 text-blue-700',
  marketing_plan: 'bg-purple-100 text-purple-700',
  design_brief: 'bg-pink-100 text-pink-700',
  workflow: 'bg-amber-100 text-amber-700',
  document: 'bg-gray-100 text-gray-700',
};

interface ArtifactEmbedCardProps {
  artifactData: {
    title: string;
    artifact_type: string;
    content_markdown: string;
    sections?: Array<{ label: string; content: string }>;
    summary?: string;
  };
  lessonId?: string;
  trackId?: string;
}

export function ArtifactEmbedCard({ artifactData, lessonId, trackId }: ArtifactEmbedCardProps) {
  const { createArtifact } = useArtifactStore();
  const [artifactId, setArtifactId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const didCreate = useRef(false);

  // Auto-persist the artifact on first render
  useEffect(() => {
    if (didCreate.current) return;
    didCreate.current = true;

    async function persist() {
      setIsCreating(true);
      const artifact = await createArtifact({
        title: artifactData.title,
        artifact_type: artifactData.artifact_type,
        content_markdown: artifactData.content_markdown,
        sections: artifactData.sections,
        summary: artifactData.summary || artifactData.content_markdown.slice(0, 200),
        lesson_id: lessonId,
        track_id: trackId,
      });
      if (artifact) {
        setArtifactId(artifact.id);
      }
      setIsCreating(false);
    }

    persist();
  }, [artifactData, createArtifact, lessonId, trackId]);

  const href = artifactId ? `/artifacts/${artifactId}` : '#';

  return (
    <div className="my-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          ) : (
            <FileText className="h-4 w-4 text-indigo-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold text-gray-900 truncate">{artifactData.title}</p>
            <span className={cn(
              'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              TYPE_COLORS[artifactData.artifact_type] || TYPE_COLORS.document,
            )}>
              {artifactData.artifact_type.replace('_', ' ')}
            </span>
          </div>
          {artifactData.summary && (
            <p className="mt-0.5 text-[11px] text-gray-500 line-clamp-2">{artifactData.summary}</p>
          )}
        </div>
        {artifactId && (
          <Link
            href={href}
            className="flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-indigo-700"
          >
            Open
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Parse `<artifact_create>` blocks from assistant message content.
 * Returns array of parsed artifact data objects.
 */
export function parseArtifactBlocks(content: string): Array<{
  title: string;
  artifact_type: string;
  content_markdown: string;
  sections?: Array<{ label: string; content: string }>;
  summary?: string;
}> {
  const blocks: Array<{
    title: string;
    artifact_type: string;
    content_markdown: string;
    sections?: Array<{ label: string; content: string }>;
    summary?: string;
  }> = [];

  const regex = /<artifact_create>([\s\S]*?)<\/artifact_create>/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed.title && parsed.content_markdown) {
        blocks.push({
          title: parsed.title,
          artifact_type: parsed.artifact_type || 'document',
          content_markdown: parsed.content_markdown,
          sections: parsed.sections,
          summary: parsed.summary,
        });
      }
    } catch {
      // Invalid JSON in artifact block — skip
    }
  }

  return blocks;
}
