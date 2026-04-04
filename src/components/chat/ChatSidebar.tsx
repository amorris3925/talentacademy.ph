'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Bot, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useChatStore } from '@/stores/chat';
import { useInteractionStore } from '@/stores/interaction';
import { ChatMessage } from './ChatMessage';
import { ChatMarkdown } from './ChatMarkdown';
import { ChatInput } from './ChatInput';
import { LessonTriggers } from './LessonTriggers';
import { cn } from '@/lib/utils';

import OutputRating from './OutputRating';

interface ChatSidebarProps {
  lessonId?: string;
  lessonTitle?: string;
  availableTools?: string[];
  trackSlug?: string;
}

const TOOL_DISPLAY: Record<string, { label: string; color: string }> = {
  generate_image: { label: 'Image Gen', color: 'bg-pink-100 text-pink-700' },
  analyze_style: { label: 'Style Analysis', color: 'bg-purple-100 text-purple-700' },
  extract_color_palette: { label: 'Color Palette', color: 'bg-amber-100 text-amber-700' },
  compare_images: { label: 'Compare', color: 'bg-orange-100 text-orange-700' },
  generate_article: { label: 'Article Gen', color: 'bg-emerald-100 text-emerald-700' },
  analyze_seo: { label: 'SEO Analysis', color: 'bg-blue-100 text-blue-700' },
  research_keywords: { label: 'Keywords', color: 'bg-cyan-100 text-cyan-700' },
  check_readability: { label: 'Readability', color: 'bg-teal-100 text-teal-700' },
  build_campaign_brief: { label: 'Campaign', color: 'bg-green-100 text-green-700' },
  analyze_audience: { label: 'Audience', color: 'bg-violet-100 text-violet-700' },
  ab_copy_test: { label: 'A/B Copy', color: 'bg-rose-100 text-rose-700' },
  social_post_gen: { label: 'Social Posts', color: 'bg-fuchsia-100 text-fuchsia-700' },
  build_workflow: { label: 'Workflow', color: 'bg-sky-100 text-sky-700' },
  test_api_endpoint: { label: 'API Test', color: 'bg-lime-100 text-lime-700' },
  generate_automation_template: { label: 'Automation', color: 'bg-indigo-100 text-indigo-700' },
};

export function ChatSidebar({ lessonId, lessonTitle, availableTools, trackSlug }: ChatSidebarProps) {
  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    loadHistory,
    setLessonContext,
    imageCreationEnabled,
    setImageCreationEnabled,
  } = useChatStore();

  const activeBlockType = useInteractionStore((s) => s.activeBlockType);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didLoad = useRef(false);
  const [showGlowTip, setShowGlowTip] = useState(false);
  const glowTipDismissed = useRef(false);

  const shouldGlow = activeBlockType === 'generation';

  // Show tooltip when glow activates (once per session)
  useEffect(() => {
    if (shouldGlow && !glowTipDismissed.current) {
      setShowGlowTip(true);
      const timer = setTimeout(() => {
        setShowGlowTip(false);
        glowTipDismissed.current = true;
      }, 4000);
      return () => clearTimeout(timer);
    } else if (!shouldGlow) {
      setShowGlowTip(false);
    }
  }, [shouldGlow]);

  // Reset didLoad when lessonId changes so history re-fetches
  useEffect(() => {
    didLoad.current = false;
  }, [lessonId]);

  // Load chat history and set lesson context
  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;

    if (lessonId) {
      setLessonContext({
        lessonId,
        lessonTitle: lessonTitle || '',
        availableTools,
        trackSlug,
      });
    }
    loadHistory(lessonId).catch(() => {
      // Failed to load history — start fresh
    });
  }, [lessonId, lessonTitle, loadHistory, setLessonContext]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, streamingContent]);

  return (
    <div className={cn(
      'flex h-full flex-col bg-gray-50 transition-shadow duration-500',
      shouldGlow && 'animate-chat-glow',
    )}>
      {/* Header */}
      <div className="relative border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-900">AI Tutor</h3>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Image creation toggle */}
            <button
              type="button"
              onClick={() => setImageCreationEnabled(!imageCreationEnabled)}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors',
                imageCreationEnabled
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
              )}
              title={imageCreationEnabled ? 'Image creation enabled' : 'Enable image creation'}
            >
              <ImageIcon className="h-3 w-3" />
              <span className="hidden sm:inline">{imageCreationEnabled ? 'On' : 'Off'}</span>
            </button>
          </div>

          {/* Contextual glow tooltip */}
          {showGlowTip && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg whitespace-nowrap">
                <Sparkles className="h-3 w-3" />
                Try it out here!
              </div>
            </div>
          )}
        </div>

        {/* Available tools pills */}
        {availableTools && availableTools.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {availableTools.map((tool) => {
              const display = TOOL_DISPLAY[tool];
              if (!display) return null;
              return (
                <span
                  key={tool}
                  className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-medium', display.color)}
                >
                  {display.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} role="log" aria-live="polite" className="flex-1 space-y-2 overflow-y-auto p-3">
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

      {/* Lesson-triggered suggestions */}
      <LessonTriggers />

      {/* Input */}
      <ChatInput onSend={sendMessage} isStreaming={isStreaming} />
    </div>
  );
}
