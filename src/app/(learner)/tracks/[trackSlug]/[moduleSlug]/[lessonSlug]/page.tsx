'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
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
import { useChatStore } from '@/stores/chat';
import { ContentBlockRenderer } from '@/components/lesson/ContentBlockRenderer';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { Button, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatXp } from '@/lib/utils';
import { academyApi } from '@/lib/api';
import type { AcademyLesson } from '@/types';

interface SiblingLessons {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export default function LessonPage() {
  const params = useParams<{
    trackSlug: string;
    moduleSlug: string;
    lessonSlug: string;
  }>();

  const {
    currentLesson,
    currentModule,
    currentTrack,
    progress,
    isLoading,
    activeTab,
    loadLesson,
    markComplete,
    setActiveTab,
  } = useLessonStore();

  const { clearHistory } = useChatStore();

  useEffect(() => {
    if (!params.trackSlug || !params.moduleSlug || !params.lessonSlug) return;
    clearHistory();
    loadLesson(params.trackSlug, params.moduleSlug, params.lessonSlug);
  }, [params.trackSlug, params.moduleSlug, params.lessonSlug, loadLesson, clearHistory]);

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
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
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
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

  const handleMarkComplete = async () => {
    await markComplete();
  };

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      {/* Breadcrumb + Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 md:px-6">
        <nav className="flex items-center gap-1 text-sm">
          <span className="text-gray-500 hover:text-gray-700">
            {currentTrack?.title || 'Track'}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-gray-500 hover:text-gray-700">
            {currentModule?.title || 'Module'}
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-medium text-gray-900">
            {currentLesson.title}
          </span>
        </nav>

        {/* Desktop nav buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <NavButton direction="prev" params={params} />
          <NavButton direction="next" params={params} />
        </div>
      </div>

      {/* Mobile Tab Toggle */}
      <div className="flex border-b border-gray-200 bg-white md:hidden">
        <button
          type="button"
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
      <div className="flex min-h-0 flex-1">
        {/* Lesson Content Panel */}
        <div
          className={cn(
            'flex flex-col overflow-y-auto',
            'md:w-[60%] md:border-r md:border-gray-200',
            activeTab === 'lesson' ? 'flex w-full' : 'hidden md:flex',
          )}
        >
          <div className="flex-1 px-4 py-6 md:px-8">
            {/* Lesson Title */}
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              {currentLesson.title}
            </h1>
            {currentLesson.description && (
              <p className="mb-6 text-sm text-gray-600">
                {currentLesson.description}
              </p>
            )}

            {/* Content Blocks */}
            <ContentBlockRenderer blocks={currentLesson.content_blocks} />
          </div>

          {/* Bottom Bar */}
          <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 md:px-8">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <div className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Completed</span>
                </div>
              ) : (
                <Button variant="primary" size="md" onClick={handleMarkComplete}>
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Complete
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Star className="h-4 w-4 text-amber-500" />
              <span>{formatXp(currentLesson.xp_reward)} reward</span>
            </div>
          </div>

          {/* Mobile nav buttons */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3 md:hidden">
            <NavButton direction="prev" params={params} />
            <NavButton direction="next" params={params} />
          </div>
        </div>

        {/* Chat Panel */}
        <div
          className={cn(
            'md:w-[40%]',
            activeTab === 'chat' ? 'flex w-full flex-col' : 'hidden md:flex md:flex-col',
          )}
        >
          <ChatSidebar lessonId={currentLesson.id} />
        </div>
      </div>
    </div>
  );
}

// --- Nav Button Helper ---

function NavButton({
  direction,
  params,
}: {
  direction: 'prev' | 'next';
  params: { trackSlug: string; moduleSlug: string; lessonSlug: string };
}) {
  const isPrev = direction === 'prev';

  const handleClick = () => {
    // Navigate via API to get sibling lesson slugs
    academyApi
      .get<SiblingLessons>(
        `/tracks/${params.trackSlug}/modules/${params.moduleSlug}/lessons/${params.lessonSlug}/siblings`,
      )
      .then((siblings) => {
        const target = isPrev ? siblings.prev : siblings.next;
        if (target) {
          window.location.href = `/tracks/${params.trackSlug}/${params.moduleSlug}/${target.slug}`;
        }
      })
      .catch(() => {
        // Silently fail
      });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      {isPrev && <ChevronLeft className="h-3.5 w-3.5" />}
      {isPrev ? 'Previous' : 'Next'}
      {!isPrev && <ChevronRight className="h-3.5 w-3.5" />}
    </Button>
  );
}
