'use client';

import { Trophy, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatXp } from '@/lib/utils';

interface LessonCompleteOverlayProps {
  xpReward: number;
  explanation: string;
  onNextLesson: () => void;
}

export function LessonCompleteOverlay({
  xpReward,
  explanation,
  onNextLesson,
}: LessonCompleteOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40 animate-in fade-in duration-500">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="mb-1 text-2xl font-bold text-green-900">
            Lesson Complete!
          </h2>
          <p className="mb-6 text-sm text-green-700">
            Great work finishing this lesson.
          </p>

          {explanation && (
            <div className="mb-6 w-full rounded-lg bg-white/70 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                Key Takeaway
              </p>
              <p className="text-sm leading-relaxed text-gray-700">
                {explanation}
              </p>
            </div>
          )}

          <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-4 py-1.5">
            <span className="text-sm font-semibold text-indigo-700">
              +{formatXp(xpReward)} XP earned
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={onNextLesson}
            className="w-full text-base"
          >
            Next Lesson
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
