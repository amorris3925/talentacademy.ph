'use client';

import { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';

interface ImageEducationHintsProps {
  hints: string[];
}

export function ImageEducationHints({ hints }: ImageEducationHintsProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  if (!hints || hints.length === 0) return null;

  const remaining = hints.length - revealedCount;

  return (
    <div className="rounded-lg border-l-4 border-amber-400 bg-amber-50 p-4">
      {/* Revealed hints */}
      {revealedCount > 0 && (
        <div className="mb-3 space-y-2" aria-live="polite">
          {hints.slice(0, revealedCount).map((hint, i) => (
            <div key={i} className="flex gap-2 text-sm text-amber-900">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
                {i + 1}
              </span>
              <span>{hint}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reveal button */}
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setRevealedCount((c) => c + 1)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 transition-colors hover:text-amber-900"
        >
          <Lightbulb className="h-4 w-4" />
          {revealedCount === 0 ? 'Show me tips' : `Show next tip (${remaining} remaining)`}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}

      {remaining === 0 && revealedCount > 0 && (
        <p className="mt-1 text-xs text-amber-600">All tips revealed</p>
      )}
    </div>
  );
}
