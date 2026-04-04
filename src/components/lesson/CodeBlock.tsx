'use client';

import { useState, useRef, useEffect } from 'react';
import { Copy, Check, MessageSquare } from 'lucide-react';
import { useInteractionStore } from '@/stores/interaction';
import { useLessonStore } from '@/stores/lesson';

interface CodeBlockProps {
  content: string;
  metadata: { language?: string };
}

const PROMPT_LANGUAGES = new Set(['prompt', 'text', '']);

export function CodeBlock({ content, metadata }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerPrompt = useInteractionStore((s) => s.triggerPrompt);
  const setActiveTab = useLessonStore((s) => s.setActiveTab);

  const isPromptType = PROMPT_LANGUAGES.has(metadata.language?.toLowerCase() ?? '');

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const handleTryInChat = () => {
    triggerPrompt(content, undefined, 'content_prompt');
    setActiveTab('chat');
  };

  return (
    <div className="group relative rounded-lg bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {metadata.language || 'code'}
        </span>
        <div className="flex items-center gap-1">
          {isPromptType && (
            <button
              type="button"
              onClick={handleTryInChat}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Try in chat"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Try in chat
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={copied ? 'Copied' : 'Copy code'}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-4">
        <code className="text-sm leading-relaxed">{content}</code>
      </pre>
    </div>
  );
}
