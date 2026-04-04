'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Star,
  AlertCircle,
} from 'lucide-react';
import { useLessonStore } from '@/stores/lesson';
import { useChatStore, summarizeContentBlocks, summarizeContentBlocksWithVision } from '@/stores/chat';
import { useInteractionStore } from '@/stores/interaction';
import { ContentBlockRenderer } from '@/components/lesson/ContentBlockRenderer';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { LessonCompleteOverlay } from '@/components/lesson/LessonCompleteOverlay';
import { useBlockObserver } from '@/hooks/useBlockObserver';
import { Button, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatXp } from '@/lib/utils';
import type { AcademyLesson, AcademyModule } from '@/types';

export default function LessonPage() {
  const params = useParams<{
    trackSlug: string;
    moduleSlug: string;
    lessonSlug: string;
  }>();
  const router = useRouter();

  const {
    currentLesson,
    currentModule,
    currentTrack,
    progress,
    isLoading,
    activeTab,
    showCompletionOverlay,
    loadLesson,
    markComplete,
    setActiveTab,
    setShowCompletionOverlay,
  } = useLessonStore();

  const { clearHistory, sendMessage, setLessonContext } = useChatStore();
  const { pendingPrompt, reset: resetInteraction, clearPendingPrompt, setSelectedText } = useInteractionStore();
  const contentScrollRef = useRef<HTMLDivElement>(null);
  useBlockObserver(contentScrollRef, currentLesson?.id);

  // Reset interaction store on mount
  useEffect(() => {
    resetInteraction();
  }, [resetInteraction]);

  useEffect(() => {
    if (!params.trackSlug || !params.moduleSlug || !params.lessonSlug) return;
    clearHistory();
    loadLesson(params.trackSlug, params.moduleSlug, params.lessonSlug);
  }, [params.trackSlug, params.moduleSlug, params.lessonSlug, loadLesson, clearHistory]);

  // Set full lesson context for the chat once lesson loads.
  // Uses Gemini vision to describe lesson images so Henry gets text descriptions.
  // Falls back to sync summary immediately, then enriches with vision async.
  useEffect(() => {
    if (!currentLesson) return;
    let cancelled = false;

    // Set sync summary immediately so chat is usable right away
    const syncSummary = summarizeContentBlocks(currentLesson.content_blocks);
    setLessonContext({
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      lessonDescription: currentLesson.description,
      contentSummary: syncSummary,
      availableTools: currentLesson.ai_tools_enabled,
      trackSlug: params.trackSlug,
    });

    // Then enrich with vision descriptions async
    const hasImages = currentLesson.content_blocks.some((b) => b.type === 'image');
    if (hasImages) {
      summarizeContentBlocksWithVision(currentLesson.content_blocks).then(
        (visionSummary) => {
          if (cancelled) return;
          setLessonContext({
            lessonId: currentLesson.id,
            lessonTitle: currentLesson.title,
            lessonDescription: currentLesson.description,
            contentSummary: visionSummary,
            availableTools: currentLesson.ai_tools_enabled,
            trackSlug: params.trackSlug,
          });
        },
      );
    }

    return () => { cancelled = true; };
  }, [currentLesson, setLessonContext, params.trackSlug]);

  // Watch pendingPrompt and auto-send to chat (+ switch to chat tab on mobile)
  useEffect(() => {
    if (!pendingPrompt) return;
    clearPendingPrompt();
    setActiveTab('chat');
    sendMessage(pendingPrompt);
  }, [pendingPrompt, clearPendingPrompt, sendMessage, setActiveTab]);

  // Highlight-to-Ask: capture text selection within lesson content
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (rect) {
        setSelectedText(text, { top: rect.top, left: rect.left, bottom: rect.bottom });
      }
    } else {
      setSelectedText(null);
    }
  }, [setSelectedText]);

  // Sibling lesson navigation
  const navigateLesson = useCallback(
    (direction: 'prev' | 'next') => {
      if (!currentModule || !currentTrack) return;

      // Find current lesson index within the module's lessons
      const allLessons: Array<{ slug: string; moduleSlug: string }> = [];
      const modules = currentTrack.modules || [];

      for (const mod of modules) {
        const modLessons = (mod as AcademyModule & { lessons?: AcademyLesson[] }).lessons || [];
        for (const l of modLessons) {
          allLessons.push({ slug: l.slug, moduleSlug: mod.slug });
        }
      }

      const currentIdx = allLessons.findIndex((l) => l.slug === params.lessonSlug);
      if (currentIdx === -1) return;

      const targetIdx = direction === 'prev' ? currentIdx - 1 : currentIdx + 1;

      if (targetIdx >= allLessons.length) {
        // Last lesson in track — go to tracks page to pick next track
        router.push('/tracks');
        return;
      }
      if (targetIdx < 0) return;

      const target = allLessons[targetIdx];
      router.push(`/tracks/${params.trackSlug}/${target.moduleSlug}/${target.slug}`);
    },
    [currentModule, currentTrack, params, router],
  );

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-indigo-600" />
          <p className="text-sm text-gray-500">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // --- Error / not found ---
  if (!currentLesson) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Lesson not found
          </h2>
          <p className="max-w-sm text-sm text-gray-500">
            The lesson you are looking for does not exist or you do not have
            access.
          </p>
        </div>
      </div>
    );
  }

  const isCompleted = progress?.status === 'completed';

  // Get the last quiz explanation for the completion overlay
  const lastQuizBlock = [...(currentLesson.content_blocks || [])].reverse().find((b) => b.type === 'quiz');
  const lastQuizExplanation = (lastQuizBlock?.metadata as { explanation?: string })?.explanation || '';

  const handleMarkComplete = async () => {
    await markComplete();
  };

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 flex h-[calc(100vh-4rem)] flex-col">
      {/* Breadcrumb + Navigation */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 md:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
          <Link href={`/tracks/${params.trackSlug}`} className="text-gray-500 hover:text-gray-700">
            {currentTrack?.title || 'Track'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <Link href={`/tracks/${params.trackSlug}/${params.moduleSlug}`} className="text-gray-500 hover:text-gray-700">
            {currentModule?.title || 'Module'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-medium text-gray-900">
            {currentLesson.title}
          </span>
        </nav>

        {/* Desktop nav buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="outline" size="sm" onClick={() => navigateLesson('prev')}>
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateLesson('next')}>
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Mobile Tab Toggle */}
      <div role="tablist" className="flex shrink-0 border-b border-gray-200 bg-white md:hidden">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'lesson'}
          onClick={() => setActiveTab('lesson')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'lesson'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500',
          )}
        >
          <BookOpen className="h-4 w-4" />
          Lesson
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'chat'}
          onClick={() => setActiveTab('chat')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'chat'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500',
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Chat
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Lesson Content Panel */}
        <div
          className={cn(
            'flex flex-col',
            'md:w-[60%] md:border-r md:border-gray-200',
            activeTab === 'lesson' ? 'flex w-full' : 'hidden md:flex',
          )}
        >
          <div ref={contentScrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8" onMouseUp={handleMouseUp}>
            {/* Lesson Title */}
            <h1 className="mb-2 text-lg font-bold text-gray-900">
              {currentLesson.title}
            </h1>
            {currentLesson.description && (
              <p className="mb-6 text-sm text-gray-600">
                {currentLesson.description}
              </p>
            )}

            {/* Content Blocks */}
            <ContentBlockRenderer blocks={currentLesson.content_blocks} onContinue={() => navigateLesson('next')} />
          </div>

          {/* Bottom Bar */}
          <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-4 py-3 md:px-8">
            <div className="flex items-center gap-2">
              {isCompleted && (
                <div className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Star className="h-4 w-4 text-amber-500" />
              <span>{formatXp(currentLesson.xp_reward)} reward</span>
            </div>
          </div>

          {/* Mobile nav buttons */}
          <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 md:hidden">
            <Button variant="outline" size="sm" onClick={() => navigateLesson('prev')}>
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateLesson('next')}>
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Chat Panel */}
        <div
          className={cn(
            'md:w-[40%]',
            activeTab === 'chat' ? 'flex w-full flex-col' : 'hidden md:flex md:flex-col',
          )}
        >
          <ChatSidebar
            lessonId={currentLesson.id}
            lessonTitle={currentLesson.title}
            availableTools={currentLesson.ai_tools_enabled}
            trackSlug={params.trackSlug}
          />
        </div>
      </div>

      {/* Lesson Complete Overlay */}
      {showCompletionOverlay && (
        <LessonCompleteOverlay
          xpReward={currentLesson.xp_reward}
          explanation={lastQuizExplanation}
          onNextLesson={() => {
            setShowCompletionOverlay(false);
            navigateLesson('next');
          }}
        />
      )}
    </div>
  );
}
