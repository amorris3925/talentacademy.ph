'use client';

import { useMemo, memo } from 'react';
import DOMPurify from 'dompurify';
import { useInteractionStore } from '@/stores/interaction';

interface MarkdownBlockProps {
  content: string;
}

export const MarkdownBlock = memo(function MarkdownBlock({ content }: MarkdownBlockProps) {
  const triggerPrompt = useInteractionStore((s) => s.triggerPrompt);

  const processedContent = useMemo(() => {
    if (typeof window === 'undefined') return content;

    // SECURITY: Replace {{prompt: "text"}} BEFORE sanitization so DOMPurify
    // can sanitize the injected button elements. This prevents post-sanitization XSS.
    let html = content.replace(
      /\{\{prompt:\s*"([^"]+)"\}\}/g,
      (_match: string, p1: string) => {
        // Escape the prompt text for safe HTML attribute/content insertion
        const escaped = p1.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<button type="button" class="inline-prompt-chip" data-prompt="${escaped}">\uD83D\uDCAD ${escaped}</button>`;
      },
    );
    html = DOMPurify.sanitize(html, {
      ADD_TAGS: ['button'],
      ADD_ATTR: ['data-prompt'],
      FORBID_TAGS: ['form', 'input', 'textarea', 'select', 'style', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['style'],
    });
    return html;
  }, [content]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('inline-prompt-chip')) {
      const prompt = target.getAttribute('data-prompt');
      if (prompt) triggerPrompt(prompt);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="lesson-prose prose prose-indigo max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:leading-relaxed prose-p:text-gray-700 prose-a:text-indigo-600 prose-a:font-medium prose-strong:text-gray-900 prose-ul:my-3 prose-ol:my-3 prose-li:text-gray-700 prose-li:leading-relaxed prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-img:rounded-lg [&_.inline-prompt-chip]:inline-flex [&_.inline-prompt-chip]:items-center [&_.inline-prompt-chip]:gap-1 [&_.inline-prompt-chip]:px-2 [&_.inline-prompt-chip]:py-0.5 [&_.inline-prompt-chip]:rounded-full [&_.inline-prompt-chip]:text-sm [&_.inline-prompt-chip]:font-medium [&_.inline-prompt-chip]:bg-indigo-50 [&_.inline-prompt-chip]:text-indigo-700 [&_.inline-prompt-chip]:border [&_.inline-prompt-chip]:border-indigo-200 [&_.inline-prompt-chip]:cursor-pointer [&_.inline-prompt-chip]:hover:bg-indigo-100 [&_.inline-prompt-chip]:transition-colors"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
});
