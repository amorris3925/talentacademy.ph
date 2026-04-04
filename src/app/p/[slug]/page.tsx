'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileText } from 'lucide-react';
import { ArtifactRenderer } from '@/components/artifact/ArtifactRenderer';
import type { AcademyArtifact } from '@/types';

export default function PublicArtifactPage() {
  const params = useParams<{ slug: string }>();
  const [artifact, setArtifact] = useState<AcademyArtifact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.slug) return;

    async function load() {
      try {
        const res = await fetch(`/api/academy/artifacts/public/${params.slug}`);
        if (!res.ok) throw new Error('Artifact not found');
        const data = await res.json();
        setArtifact(data.artifact);
      } catch {
        setError('This artifact is not available or has been removed.');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!artifact || error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <FileText className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">{error || 'Artifact not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Simple header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <p className="text-xs font-medium text-indigo-600">Talent Academy</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{artifact.title}</h1>
          {artifact.summary && (
            <p className="mt-1 text-sm text-gray-500">{artifact.summary}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-600">
              {artifact.artifact_type.replace('_', ' ')}
            </span>
            <span>{new Date(artifact.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        <ArtifactRenderer
          content={artifact.content_markdown}
          sections={artifact.sections}
        />
      </main>
    </div>
  );
}
