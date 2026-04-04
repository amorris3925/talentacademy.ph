'use client';

import { useEffect, useState } from 'react';
import { FileText, Filter } from 'lucide-react';
import { useArtifactStore } from '@/stores/artifact';
import { ArtifactCard } from '@/components/artifact/ArtifactCard';
import { Spinner } from '@/components/ui';

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'blog_post', label: 'Blog Posts' },
  { value: 'seo_article', label: 'SEO Articles' },
  { value: 'marketing_plan', label: 'Marketing Plans' },
  { value: 'design_brief', label: 'Design Briefs' },
  { value: 'document', label: 'Documents' },
];

export function ArtifactsTab() {
  const { artifacts, isLoading, loadArtifacts } = useArtifactStore();
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadArtifacts(typeFilter ? { artifact_type: typeFilter } : undefined);
  }, [loadArtifacts, typeFilter]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-gray-400" />
        <div className="flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setTypeFilter(f.value)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
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

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      )}

      {!isLoading && artifacts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">No artifacts yet</h3>
          <p className="mt-1 max-w-xs text-center text-xs text-gray-500">
            Artifacts are created when the AI Tutor generates substantial content like blog posts, marketing plans, or SEO articles during lessons.
          </p>
        </div>
      )}

      {!isLoading && artifacts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {artifacts.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} />
          ))}
        </div>
      )}
    </div>
  );
}
