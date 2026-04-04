'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ChatMarkdown } from '@/components/chat/ChatMarkdown';
import { cn } from '@/lib/utils';
import type { ArtifactSection } from '@/types';

interface ArtifactRendererProps {
  content: string;
  sections?: ArtifactSection[] | null;
}

export function ArtifactRenderer({ content, sections }: ArtifactRendererProps) {
  return (
    <div className="space-y-6">
      {/* Main markdown content */}
      {content && (
        <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-indigo-600">
          <ChatMarkdown content={content} />
        </div>
      )}

      {/* Structured sections */}
      {sections && sections.length > 0 && (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <CollapsibleSection key={i} section={section} defaultOpen={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({ section, defaultOpen }: { section: ArtifactSection; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
        <span className="text-sm font-medium text-gray-900">{section.label}</span>
        {section.status && (
          <span className={cn(
            'ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium',
            section.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
          )}>
            {section.status}
          </span>
        )}
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="prose prose-sm max-w-none">
            <ChatMarkdown content={section.content} />
          </div>
        </div>
      )}
    </div>
  );
}
