'use client';

import { RotateCcw, Clock } from 'lucide-react';
import type { ArtifactVersion } from '@/types';

interface ArtifactVersionHistoryProps {
  versions: ArtifactVersion[];
  onRestore: (versionId: string) => void;
}

export function ArtifactVersionHistory({ versions, onRestore }: ArtifactVersionHistoryProps) {
  if (versions.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-500">No previous versions</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          <Clock className="h-4 w-4 text-gray-400" />
          Version History
        </h3>
      </div>
      <div className="divide-y divide-gray-50">
        {versions.map((version) => (
          <div key={version.id} className="flex items-center justify-between px-4 py-2.5">
            <div>
              <p className="text-xs font-medium text-gray-700">
                v{version.version_number}
                {version.title && ` — ${version.title}`}
              </p>
              <p className="text-[10px] text-gray-400">
                {new Date(version.snapshot_at).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRestore(version.id)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-indigo-600 hover:bg-indigo-50"
            >
              <RotateCcw className="h-3 w-3" />
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
