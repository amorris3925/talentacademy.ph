'use client';

import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { AcademyChatMessage } from '@/types';

interface ChatMessageProps {
  message: AcademyChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-2.5',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-indigo-600' : 'bg-gray-200',
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-white" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-gray-600" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3.5 py-2.5',
          isUser
            ? 'rounded-tr-md bg-indigo-600 text-white'
            : 'rounded-tl-md border border-gray-200 bg-white text-gray-800',
        )}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
        <p
          className={cn(
            'mt-1 text-right text-xs',
            isUser ? 'text-indigo-200' : 'text-gray-400',
          )}
        >
          {formatDate(message.created_at)}
        </p>
      </div>
    </div>
  );
}
