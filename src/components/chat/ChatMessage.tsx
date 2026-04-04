'use client';

import { memo } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { ChatMarkdown } from './ChatMarkdown';
import { ToolCallIndicator } from './ToolCallIndicator';
import { StructuredBlockRenderer } from './StructuredBlockRenderer';
import type { AcademyChatMessage } from '@/types';

interface ChatMessageProps {
  message: AcademyChatMessage;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

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
          <p className="whitespace-pre-wrap text-sm leading-snug">
            {message.content}
          </p>
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
