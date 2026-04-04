'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, Filter } from 'lucide-react';
import { useArtifactStore } from '@/stores/artifact';
import { ArtifactCard } from '@/components/artifact/ArtifactCard';
import { Button, Spinner } from '@/components/ui';

const TYPE_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'blog_post', label: 'Blog Posts' },
  { value: 'seo_article', label: 'SEO Articles' },
  { value: 'marketing_plan', label: 'Marketing Plans' },
  { value: 'design_brief', label: 'Design Briefs' },
  { value: 'workflow', label: 'Workflows' },
  { value: 'document', label: 'Documents' },
];

export default function ArtifactsPage() {
  const { artifacts, isLoading, loadArtifacts } = useArtifactStore();
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadArtifacts(typeFilter ? { artifact_type: typeFilter } : undefined);
  }, [loadArtifacts, typeFilter]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Artifacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Content you've created through lessons and the AI Tutor
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <div className="flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setTypeFilter(f.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === f.value
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && artifacts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">No artifacts yet</h3>
          <p className="mt-1 max-w-xs text-center text-xs text-gray-500">
            Start creating content in your lessons — ask the AI Tutor to write a blog post,
            build a campaign, or design a workflow.
          </p>
        </div>
      )}

      {/* Artifact grid */}
      {!isLoading && artifacts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {artifacts.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} />
          ))}
        </div>
      )}
    </div>
  );
}
