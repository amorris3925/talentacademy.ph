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
} from 'lucide-react';
import { academyApi } from '@/lib/api';
import { Card, Spinner, Badge, ProgressBar, Button } from '@/components/ui';
import type { AcademyTrack, AcademyModule, AcademyLesson, AcademyEnrollment, LessonStatus } from '@/types';

interface LessonWithStatus extends AcademyLesson {
  status: LessonStatus;
}

interface ModuleWithLessons extends AcademyModule {
  lessons: LessonWithStatus[];
}

interface TrackDetail extends AcademyTrack {
  modules: ModuleWithLessons[];
  enrollment: AcademyEnrollment | null;
}

const STATUS_ICON: Record<LessonStatus | 'locked', React.ReactNode> = {
  completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  in_progress: <PlayCircle className="h-5 w-5 text-indigo-500" />,
  not_started: <Circle className="h-5 w-5 text-gray-300" />,
  locked: <Lock className="h-5 w-5 text-gray-300" />,
};

export default function TrackDetailPage() {
  const params = useParams<{ trackSlug: string }>();
  const [track, setTrack] = useState<TrackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  const fetchTrack = async () => {
    try {
      const res = await academyApi.get<{ track: AcademyTrack; modules: ModuleWithLessons[] }>(`/tracks/${params.trackSlug}`);
      setTrack({ ...res.track, modules: res.modules || [] } as TrackDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load track');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.trackSlug]);

  const handleEnroll = async () => {
    if (!track) return;
    setEnrolling(true);
    try {
      await academyApi.post(`/enroll/${track.slug}`);
      await fetchTrack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-red-600">{error ?? 'Track not found'}</p>
      </div>
    );
  }

  const isEnrolled = !!track.enrollment;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Track Header */}
      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <BookOpen className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{track.title}</h1>
              <p className="mt-1 text-sm text-gray-500">{track.description}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                <span>{track.duration_weeks} weeks</span>
                <span>
                  {track.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons
                </span>
              </div>
            </div>
          </div>

          {isEnrolled && track.enrollment && (
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span>{Math.round(track.enrollment.progress_pct)}%</span>
              </div>
              <ProgressBar value={track.enrollment.progress_pct} />
            </div>
          )}

          {!isEnrolled && (
            <Button
              variant="primary"
              isLoading={enrolling}
              onClick={handleEnroll}
            >
              Enroll in this Track
            </Button>
          )}
        </div>
      </Card>

      {/* Modules & Lessons */}
      <div className="space-y-6">
        {track.modules
          .sort((a, b) => a.week_number - b.week_number)
          .map((mod) => (
            <div key={mod.id}>
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="default">Week {mod.week_number}</Badge>
                <h2 className="text-base font-semibold text-gray-900">{mod.title}</h2>
              </div>
              {mod.description && (
                <p className="mb-3 text-sm text-gray-500">{mod.description}</p>
              )}

              <div className="space-y-2">
                {mod.lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson) => {
                    const isLocked = !isEnrolled && lesson.status === 'not_started';
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
                        <span className="text-xs text-gray-400">{lesson.xp_reward} XP</span>
                      </div>
                    );

                    if (isLocked) return <div key={lesson.id}>{inner}</div>;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/tracks/${params.trackSlug}/${mod.slug}/${lesson.slug}`}
                      >
                        {inner}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
