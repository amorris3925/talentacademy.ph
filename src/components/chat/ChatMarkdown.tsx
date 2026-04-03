'use client';

import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked for compact output
marked.setOptions({
  breaks: true,
  gfm: true,
});

interface ChatMarkdownProps {
  content: string;
  className?: string;
}

export function ChatMarkdown({ content, className = '' }: ChatMarkdownProps) {
  const html = useMemo(() => {
    const raw = marked.parse(content, { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [content]);

  return (
    <div
      className={`chat-markdown text-sm leading-snug ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
