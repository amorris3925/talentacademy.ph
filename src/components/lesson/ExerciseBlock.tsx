'use client';

import { useState } from 'react';
import { Play, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';

interface ExerciseBlockProps {
  content: string;
  metadata: {
    language?: string;
    starter_code?: string;
    lesson_id?: string;
  };
}

export function ExerciseBlock({ content, metadata }: ExerciseBlockProps) {
  const [code, setCode] = useState(metadata.starter_code || '');

  const handleReset = () => {
    setCode(metadata.starter_code || '');
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* Instructions */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm font-medium text-gray-900">Exercise</p>
        <p className="mt-1 text-sm text-gray-600">{content}</p>
      </div>

      {/* Code Editor */}
      <div className="relative">
        <div className="absolute right-2 top-2 rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
          {metadata.language || 'python'}
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full resize-y bg-gray-900 p-4 pt-8 font-mono text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          rows={12}
          spellCheck={false}
          aria-label="Code editor"
          placeholder="Write your code here..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
        <Button
          variant="primary"
          size="sm"
          disabled
        >
          <Play className="h-3.5 w-3.5" />
          Run (Coming Soon)
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled
        >
          <Send className="h-3.5 w-3.5" />
          Submit (Coming Soon)
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

    </div>
  );
}
