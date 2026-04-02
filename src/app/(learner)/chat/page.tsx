'use client';

import { useEffect, useRef } from 'react';
import { Trash2, Bot } from 'lucide-react';
import { useChatStore } from '@/stores/chat';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { Button, Spinner } from '@/components/ui';

export default function ChatPage() {
  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    loadHistory,
    clearHistory,
    setLessonContext,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  // Clear lesson context for general chat + load history once
  useEffect(() => {
    setLessonContext(null);
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadHistory();
    }
  }, [setLessonContext, loadHistory]);

  // Auto-scroll on new messages / streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI Assistant</h1>
            <p className="text-xs text-gray-500">
              Ask anything about AI tools, prompting, or your coursework.
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearHistory}>
          <Trash2 className="h-4 w-4" />
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-1 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                <Bot className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Start a conversation</h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                I am your AI tutor. Ask about AI tools, get help with exercises, or explore ideas.
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
      <div className="border-t border-gray-200 pt-4">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            onSend={sendMessage}
            isStreaming={isStreaming}
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
}
