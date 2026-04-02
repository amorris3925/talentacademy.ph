'use client';

import { useEffect, useRef } from 'react';
import { MessageSquare, Bot } from 'lucide-react';
import { useChatStore } from '@/stores/chat';
import { ChatMessage } from './ChatMessage';
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
      <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-3">
        <MessageSquare className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-gray-900">AI Tutor</h3>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <Bot className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">AI Tutor</p>
            <p className="mt-1 max-w-xs text-xs text-gray-500">
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
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200">
              <Bot className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-md border border-gray-200 bg-white px-3.5 py-2.5">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                {streamingContent}
              </p>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isStreaming && !streamingContent && (
          <div className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200">
              <Bot className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <div className="rounded-2xl rounded-tl-md border border-gray-200 bg-white px-3.5 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
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
