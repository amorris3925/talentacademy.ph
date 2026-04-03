'use client';

import { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { useChatStore } from '@/stores/chat';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';

/**
 * Text generation tab — uses the centralized chat store (same as lesson chat).
 * This ensures one consistent AI chat experience everywhere.
 */
export function TextGenerator() {
  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    setLessonContext,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clear lesson context — this is general-purpose generation
  useEffect(() => {
    setLessonContext(null);
  }, [setLessonContext]);

  // Auto-scroll on new messages / streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex h-[calc(100vh-20rem)] flex-col rounded-xl border border-gray-200 bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                <Bot className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">AI Assistant</h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Ask anything — generate text, get help with prompts, brainstorm ideas, or explore AI tools.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Streaming content */}
          {isStreaming && streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
                {streamingContent}
                <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-indigo-500" />
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isStreaming && !streamingContent && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        isStreaming={isStreaming}
        placeholder="Type your message..."
      />
    </div>
  );
}
