'use client';

import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { ChatMarkdown } from './ChatMarkdown';
import type { AcademyChatMessage } from '@/types';

interface ChatMessageProps {
  message: AcademyChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
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
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-snug">
            {message.content}
          </p>
        ) : (
          <ChatMarkdown content={message.content} />
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
}
