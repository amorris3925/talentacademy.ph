'use client';

import Link from 'next/link';
import { FileText, Clock, Star, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AcademyArtifact } from '@/types';

const TYPE_COLORS: Record<string, string> = {
  blog_post: 'bg-emerald-100 text-emerald-700',
  seo_article: 'bg-blue-100 text-blue-700',
  marketing_plan: 'bg-purple-100 text-purple-700',
  design_brief: 'bg-pink-100 text-pink-700',
  workflow: 'bg-amber-100 text-amber-700',
  campaign: 'bg-green-100 text-green-700',
  report: 'bg-orange-100 text-orange-700',
  document: 'bg-gray-100 text-gray-700',
};

interface ArtifactCardProps {
  artifact: AcademyArtifact;
}

export function ArtifactCard({ artifact }: ArtifactCardProps) {
  return (
    <Link
      href={`/artifacts/${artifact.id}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
          <FileText className="h-4.5 w-4.5 text-indigo-600" />
        </div>
        <span className={cn(
          'rounded-full px-2 py-0.5 text-[10px] font-medium',
          TYPE_COLORS[artifact.artifact_type] || TYPE_COLORS.document,
        )}>
          {artifact.artifact_type.replace('_', ' ')}
        </span>
      </div>

      <h3 className="mt-3 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-700">
        {artifact.title}
      </h3>

      {artifact.summary && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{artifact.summary}</p>
      )}

      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="flex items-center gap-1 text-[10px] text-gray-400">
          <Clock className="h-3 w-3" />
          {new Date(artifact.created_at).toLocaleDateString()}
        </span>

        {artifact.quality_score != null && (
          <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
            <Star className="h-3 w-3" />
            {Math.round(artifact.quality_score * 100)}%
          </span>
        )}
      </div>
    </Link>
  );
}
