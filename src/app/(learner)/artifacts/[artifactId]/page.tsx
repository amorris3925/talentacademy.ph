'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Edit3,
  Eye,
  Clock,
  Share2,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { useArtifactStore } from '@/stores/artifact';
import { ArtifactRenderer } from '@/components/artifact/ArtifactRenderer';
import { ArtifactEditor } from '@/components/artifact/ArtifactEditor';
import { ArtifactVersionHistory } from '@/components/artifact/ArtifactVersionHistory';
import { Button, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function ArtifactDetailPage() {
  const params = useParams<{ artifactId: string }>();
  const {
    activeArtifact,
    versions,
    isLoading,
    error,
    loadArtifact,
    updateArtifact,
    loadVersions,
    restoreVersion,
  } = useArtifactStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (params.artifactId) {
      loadArtifact(params.artifactId);
      loadVersions(params.artifactId);
    }
  }, [params.artifactId, loadArtifact, loadVersions]);

  useEffect(() => {
    if (activeArtifact) {
      setEditContent(activeArtifact.content_markdown);
    }
  }, [activeArtifact]);

  const handleSave = async () => {
    if (!activeArtifact) return;
    await updateArtifact(activeArtifact.id, { content_markdown: editContent } as Partial<typeof activeArtifact>);
    setIsEditing(false);
  };

  const handleRestore = async (versionId: string) => {
    if (!activeArtifact) return;
    await restoreVersion(activeArtifact.id, versionId);
    setShowVersions(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (!activeArtifact) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">{error || 'Artifact not found'}</p>
      </div>
    );
  }

  const TYPE_COLORS: Record<string, string> = {
    blog_post: 'bg-emerald-100 text-emerald-700',
    seo_article: 'bg-blue-100 text-blue-700',
    marketing_plan: 'bg-purple-100 text-purple-700',
    design_brief: 'bg-pink-100 text-pink-700',
    workflow: 'bg-amber-100 text-amber-700',
    document: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/artifacts"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to artifacts
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{activeArtifact.title}</h1>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium',
                TYPE_COLORS[activeArtifact.artifact_type] || TYPE_COLORS.document,
              )}>
                {activeArtifact.artifact_type.replace('_', ' ')}
              </span>
            </div>
            {activeArtifact.summary && (
              <p className="mt-1 text-sm text-gray-500">{activeArtifact.summary}</p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(activeArtifact.created_at).toLocaleDateString()}
              </span>
              {activeArtifact.status === 'evaluated' && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Evaluated
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersions(!showVersions)}
            >
              <Clock className="h-3.5 w-3.5" />
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
              {isEditing ? 'Preview' : 'Edit'}
            </Button>
            {isEditing && (
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            )}
          </div>
        </div>

        {/* Scores */}
        {activeArtifact.quality_score != null && (
          <div className="mt-3 flex items-center gap-4">
            {[
              { label: 'Quality', score: activeArtifact.quality_score },
              { label: 'Creativity', score: activeArtifact.creativity_score },
              { label: 'Completeness', score: activeArtifact.completeness_score },
            ].map((s) => s.score != null && (
              <div key={s.label} className="flex items-center gap-1.5">
                <Star className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-gray-500">{s.label}:</span>
                <span className="text-xs font-semibold text-gray-700">
                  {Math.round((s.score ?? 0) * 100)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content area */}
      <div className="flex gap-6">
        <div className={cn('flex-1 min-w-0', showVersions && 'max-w-[70%]')}>
          {isEditing ? (
            <ArtifactEditor
              content={editContent}
              onChange={setEditContent}
            />
          ) : (
            <ArtifactRenderer
              content={activeArtifact.content_markdown}
              sections={activeArtifact.sections}
            />
          )}
        </div>

        {showVersions && (
          <div className="w-[30%] shrink-0">
            <ArtifactVersionHistory
              versions={versions}
              onRestore={handleRestore}
            />
          </div>
        )}
      </div>
    </div>
  );
}
