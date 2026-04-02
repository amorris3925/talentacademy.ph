'use client';

import type { ContentBlock } from '@/types';
import { MarkdownBlock } from './MarkdownBlock';
import { CodeBlock } from './CodeBlock';
import { VideoBlock } from './VideoBlock';
import { ImageBlock } from './ImageBlock';
import { CalloutBlock } from './CalloutBlock';
import { ExerciseBlock } from './ExerciseBlock';
import { QuizBlock } from './QuizBlock';
import { GenerationBlock } from './GenerationBlock';

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'markdown':
      return <MarkdownBlock key={index} content={block.content} />;
    case 'code':
      return (
        <CodeBlock
          key={index}
          content={block.content}
          metadata={block.metadata as { language: string }}
        />
      );
    case 'video':
      return (
        <VideoBlock
          key={index}
          content={block.content}
          metadata={block.metadata as { title?: string }}
        />
      );
    case 'image':
      return (
        <ImageBlock
          key={index}
          content={block.content}
          metadata={block.metadata as { caption?: string; alt?: string }}
        />
      );
    case 'callout':
      return (
        <CalloutBlock
          key={index}
          content={block.content}
          metadata={block.metadata as { type?: 'info' | 'warning' | 'tip' | 'danger' }}
        />
      );
    case 'exercise':
      return (
        <ExerciseBlock
          key={index}
          content={block.content}
          metadata={block.metadata as { language?: string; starter_code?: string; lesson_id?: string }}
        />
      );
    case 'quiz':
      return (
        <QuizBlock
          key={index}
          content={block.content}
          metadata={block.metadata as { options: string[]; correct_index: number; explanation: string }}
        />
      );
    case 'generation':
      return (
        <GenerationBlock
          key={index}
          metadata={block.metadata as { gen_type: 'image' | 'video' | 'audio' | 'music'; prompt_hint?: string }}
        />
      );
    default:
      return null;
  }
}

export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        No content available for this lesson.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
