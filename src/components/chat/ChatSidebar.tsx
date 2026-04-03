'use client';

import { useEffect, useRef } from 'react';
import { MessageSquare, Bot } from 'lucide-react';
import { useChatStore } from '@/stores/chat';
import { ChatMessage } from './ChatMessage';
import { ChatMarkdown } from './ChatMarkdown';
import { ChatInput } from './ChatInput';
import GhostPrompts from './GhostPrompts';
import OutputRating from './OutputRating';

interface ChatSidebarProps {
  lessonId?: string;
}

export function ChatSidebar({ lessonId }: ChatSidebarProps) {
  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    loadHistory,
    setLessonContext,
  } = useChatStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const didLoad = useRef(false);

  // Load chat history and set lesson context
  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;

    if (lessonId) {
      setLessonContext({ lessonId, lessonTitle: '' });
    }
    loadHistory(lessonId).catch(() => {
      // Failed to load history — start fresh
    });
  }, [lessonId, loadHistory, setLessonContext]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, streamingContent]);

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2.5">
        <MessageSquare className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">AI Tutor</h3>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <Bot className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">AI Tutor</p>
            <p className="mt-0.5 max-w-xs text-xs text-gray-500">
              Ask questions about the lesson, request explanations, or get help
              with exercises.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id}>
            <ChatMessage message={msg} />
            {msg.role === 'assistant' && <OutputRating messageId={msg.id} />}
          </div>
        ))}

        {/* Streaming indicator */}
        {isStreaming && streamingContent && (
          <div className="flex gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200">
              <Bot className="h-3 w-3 text-gray-600" />
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-gray-200 bg-white px-3 py-2">
              <ChatMarkdown content={streamingContent} />
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isStreaming && !streamingContent && (
          <div className="flex gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200">
              <Bot className="h-3 w-3 text-gray-600" />
            </div>
            <div className="rounded-2xl rounded-tl-md border border-gray-200 bg-white px-3 py-2.5">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ghost prompts */}
      <GhostPrompts />

      {/* Input */}
      <ChatInput onSend={sendMessage} isStreaming={isStreaming} />
    </div>
  );
}
