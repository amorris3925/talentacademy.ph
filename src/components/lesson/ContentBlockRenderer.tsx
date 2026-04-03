'use client';

import dynamic from 'next/dynamic';
import type { ContentBlock } from '@/types';
import { MarkdownBlock } from './MarkdownBlock';
import { ImageBlock } from './ImageBlock';
import { CalloutBlock } from './CalloutBlock';
import PromptChips from './PromptChips';
import ProgressiveHints from './ProgressiveHints';
import Checkpoint from './Checkpoint';

const CodeBlock = dynamic(
  () => import('./CodeBlock').then((m) => m.CodeBlock),
  { ssr: false }
);
const VideoBlock = dynamic(
  () => import('./VideoBlock').then((m) => m.VideoBlock),
  { ssr: false }
);
const ExerciseBlock = dynamic(
  () => import('./ExerciseBlock').then((m) => m.ExerciseBlock),
  { ssr: false }
);
const QuizBlock = dynamic(
  () => import('./QuizBlock').then((m) => m.QuizBlock),
  { ssr: false }
);
const GenerationBlock = dynamic(
  () => import('./GenerationBlock').then((m) => m.GenerationBlock),
  { ssr: false }
);

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'markdown':
      return <MarkdownBlock key={`${block.type}-${index}`} content={block.content} />;
    case 'code':
      return (
        <CodeBlock
          key={`${block.type}-${index}`}
          content={block.content}
          metadata={block.metadata as { language: string }}
        />
      );
    case 'video':
      return (
        <VideoBlock
          key={`${block.type}-${index}`}
          content={block.content}
          metadata={block.metadata as { title?: string }}
        />
      );
    case 'image':
      return (
        <ImageBlock
          key={`${block.type}-${index}`}
          content={block.content}
          metadata={block.metadata as { caption?: string; alt?: string }}
        />
      );
    case 'callout':
      return (
        <CalloutBlock
          key={`${block.type}-${index}`}
          content={block.content}
          metadata={block.metadata as { type?: 'info' | 'warning' | 'tip' | 'danger' }}
        />
      );
    case 'exercise':
      return (
        <ExerciseBlock
          key={`${block.type}-${index}`}
          content={block.content}
          metadata={block.metadata as { language?: string; starter_code?: string; lesson_id?: string }}
        />
      );
    case 'quiz':
      return (
        <QuizBlock
          key={`${block.type}-${index}`}
          content={block.content}
          metadata={block.metadata as { options: string[]; correct_index: number; explanation: string }}
        />
      );
    case 'generation':
      return (
        <GenerationBlock
          key={`${block.type}-${index}`}
          metadata={block.metadata as { gen_type: 'image' | 'video' | 'audio' | 'music'; prompt_hint?: string }}
        />
      );
    case 'prompts':
      return (
        <PromptChips
          key={`${block.type}-${index}`}
          prompts={block.metadata.prompts as Array<{ label: string; text: string }>}
        />
      );
    case 'hints':
      return (
        <ProgressiveHints
          key={`${block.type}-${index}`}
          hints={block.metadata.hints as string[]}
          blockId={`${block.type}-${index}`}
        />
      );
    case 'checkpoint':
      return (
        <Checkpoint
          key={`${block.type}-${index}`}
          id={`checkpoint-${index}`}
          title={block.metadata.title as string}
          instructions={block.content}
          keywords={block.metadata.keywords as string[]}
        />
      );
    default:
      return null;
  }
}

export function ContentBlockRenderer({ blocks }: ContentBlockRendererProps) {
  const safeBlocks = Array.isArray(blocks) ? blocks : [];

  if (safeBlocks.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">
        No content available for this lesson.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {safeBlocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
