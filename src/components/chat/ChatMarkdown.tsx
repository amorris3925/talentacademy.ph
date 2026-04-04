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
    // Strip artifact XML blocks before rendering markdown
    const cleaned = content
      .replace(/<artifact_create>[\s\S]*?<\/artifact_create>/g, '')
      .replace(/<artifact_update>[\s\S]*?<\/artifact_update>/g, '')
      .trim();
    const raw = marked.parse(cleaned, { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [content]);

  return (
    <div
      className={`chat-markdown text-sm leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
