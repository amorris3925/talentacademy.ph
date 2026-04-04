'use client';

import { memo, useMemo } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { ChatMarkdown } from './ChatMarkdown';
import { ToolCallIndicator } from './ToolCallIndicator';
import { StructuredBlockRenderer } from './StructuredBlockRenderer';
import { ArtifactEmbedCard, parseArtifactBlocks } from '@/components/artifact/ArtifactEmbedCard';
import type { AcademyChatMessage } from '@/types';

interface ChatMessageProps {
  message: AcademyChatMessage;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const artifactBlocks = useMemo(
    () => (!isUser ? parseArtifactBlocks(message.content) : []),
    [isUser, message.content],
  );

  return (
    <div
      className={cn(
        'flex gap-2',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-indigo-600' : 'bg-gray-200',
        )}
      >
        {isUser ? (
          <User className="h-3 w-3 text-white" />
        ) : (
          <Bot className="h-3 w-3 text-gray-600" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-3 py-2',
          isUser
            ? 'rounded-tr-md bg-indigo-600 text-white'
            : 'rounded-tl-md border border-gray-200 bg-white text-gray-800',
        )}
      >
        {/* User-attached images */}
        {isUser && message.images && message.images.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {message.images.map((img, i) => (
              <img
                key={i}
                src={img.url || `data:${img.media_type};base64,${img.data}`}
                alt={`Attachment ${i + 1}`}
                className="h-24 w-24 rounded-lg object-cover border border-indigo-400/30"
              />
            ))}
          </div>
        )}

        {isUser ? (
          <div>
            {message.is_image_request && (
              <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-200">
                <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                IMAGE
              </span>
            )}
            <p className="whitespace-pre-wrap text-sm leading-snug">
              {message.content}
            </p>
          </div>
        ) : (
          <>
            {/* Tool call indicators */}
            {message.tool_calls && message.tool_calls.length > 0 && (
              <div className="mb-2 space-y-1.5">
                {message.tool_calls.map((tc) => (
                  <ToolCallIndicator key={tc.tool_call_id} toolCall={tc} />
                ))}
              </div>
            )}

            <ChatMarkdown content={message.content} />

            {/* Artifact embed cards (from <artifact_create> blocks) */}
            {artifactBlocks.length > 0 && (
              <div className="mt-2 space-y-2">
                {artifactBlocks.map((ab, i) => (
                  <ArtifactEmbedCard key={i} artifactData={ab} />
                ))}
              </div>
            )}

            {/* Structured blocks (images, tables, charts, artifact embeds) */}
            {message.structured_blocks && message.structured_blocks.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.structured_blocks.map((block, i) => (
                  <StructuredBlockRenderer key={i} block={block} />
                ))}
              </div>
            )}
          </>
        )}
        <p
          className={cn(
            'mt-0.5 text-right text-[10px]',
            isUser ? 'text-indigo-200' : 'text-gray-400',
          )}
        >
          {formatDate(message.created_at)}
        </p>
      </div>
    </div>
  );
});
