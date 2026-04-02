'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Lock,
  PlayCircle,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { academyApi } from '@/lib/api';
import { Card, Spinner, Badge } from '@/components/ui';
import type { AcademyTrack, AcademyModule, AcademyLesson, LessonStatus } from '@/types';

interface LessonWithStatus extends AcademyLesson {
  status: LessonStatus;
}

interface ModuleWithLessons extends AcademyModule {
  lessons: LessonWithStatus[];
}

const STATUS_ICON: Record<LessonStatus | 'locked', React.ReactNode> = {
  completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  in_progress: <PlayCircle className="h-5 w-5 text-indigo-500" />,
  not_started: <Circle className="h-5 w-5 text-gray-300" />,
  locked: <Lock className="h-5 w-5 text-gray-300" />,
};

export default function ModulePage() {
  const params = useParams<{ trackSlug: string; moduleSlug: string }>();
  const [track, setTrack] = useState<AcademyTrack | null>(null);
  const [module, setModule] = useState<ModuleWithLessons | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModule() {
      try {
        const res = await academyApi.get<any>(`/tracks/${params.trackSlug}`);
        const trackData = res.track as AcademyTrack;
        const modules = (res.modules || []) as ModuleWithLessons[];
        const mod = modules.find((m) => m.slug === params.moduleSlug) ?? null;
        setTrack(trackData);
        setModule(mod);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load module');
      } finally {
        setLoading(false);
      }
    }
    fetchModule();
  }, [params.trackSlug, params.moduleSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (error || !module) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-red-600">{error ?? 'Module not found'}</p>
      </div>
    );
  }

  const completedCount = module.lessons.filter((l) => l.status === 'completed').length;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500">
        <Link href="/tracks" className="hover:text-gray-700">
          Tracks
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <Link href={`/tracks/${params.trackSlug}`} className="hover:text-gray-700">
          {track?.title || 'Track'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <span className="font-medium text-gray-900">{module.title}</span>
      </nav>

      {/* Module Header */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <BookOpen className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{module.title}</h1>
              <Badge variant="default">Week {module.week_number}</Badge>
            </div>
            {module.description && (
              <p className="mt-1 text-sm text-gray-500">{module.description}</p>
            )}
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
              <span>{module.lessons.length} lessons</span>
              <span>{completedCount} / {module.lessons.length} completed</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Lessons */}
      <div className="space-y-2">
        {module.lessons
          .sort((a, b) => a.order - b.order)
          .map((lesson) => {
            const isLocked = (lesson.status as string) === 'locked';
            const statusKey = isLocked ? 'locked' : lesson.status;

            const inner = (
              <div
                className={`flex items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-colors ${
                  isLocked
                    ? 'cursor-not-allowed border-gray-100 opacity-50'
                    : 'cursor-pointer border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/30'
                }`}
              >
                {STATUS_ICON[statusKey]}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                  {lesson.description && (
                    <p className="text-xs text-gray-400 line-clamp-1">{lesson.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{lesson.xp_reward} XP</span>
                  {lesson.status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            );

            if (isLocked) return <div key={lesson.id}>{inner}</div>;

            return (
              <Link
                key={lesson.id}
                href={`/tracks/${params.trackSlug}/${params.moduleSlug}/${lesson.slug}`}
              >
                {inner}
              </Link>
            );
          })}
      </div>
    </div>
  );
}
