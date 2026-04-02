'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Palette,
  Megaphone,
  Settings,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { academyApi } from '@/lib/api';
import { Card, Spinner, Badge, ProgressBar, Button } from '@/components/ui';
import type { AcademyTrack, AcademyEnrollment } from '@/types';

const TRACK_ICONS: Record<string, React.ReactNode> = {
  foundation: <BookOpen className="h-6 w-6" />,
  'graphic-design': <Palette className="h-6 w-6" />,
  marketing: <Megaphone className="h-6 w-6" />,
  operations: <Settings className="h-6 w-6" />,
};

const TRACK_COLORS: Record<string, string> = {
  foundation: 'bg-blue-100 text-blue-600',
  'graphic-design': 'bg-pink-100 text-pink-600',
  marketing: 'bg-green-100 text-green-600',
  operations: 'bg-amber-100 text-amber-600',
};

interface TrackWithMeta extends AcademyTrack {
  lesson_count?: number;
  enrollment?: AcademyEnrollment | null;
  is_locked?: boolean;
}

export default function TracksPage() {
  const [tracks, setTracks] = useState<TrackWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const fetchTracks = async () => {
    try {
      const res = await academyApi.get<any>('/tracks');
      setTracks(res.tracks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleEnroll = async (track: TrackWithMeta) => {
    setEnrolling(track.id);
    try {
      await academyApi.post(`/enroll/${track.slug}`);
      await fetchTracks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tracks</h1>
        <p className="mt-1 text-sm text-gray-500">
          Choose a learning track to develop your skills.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {tracks.map((track) => {
          const isLocked = track.is_locked ?? false;
          const isEnrolled = !!track.enrollment;
          const colorClass = TRACK_COLORS[track.slug] ?? 'bg-gray-100 text-gray-600';
          const icon = TRACK_ICONS[track.slug] ?? <BookOpen className="h-6 w-6" />;

          return (
            <Card key={track.id} hover className={isLocked ? 'opacity-60' : ''}>
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">{track.title}</h3>
                      {track.slug === 'foundation' && (
                        <Badge variant="warning">Required</Badge>
                      )}
                      {isLocked && (
                        <Badge variant="default">
                          <Lock className="mr-1 h-3 w-3" />
                          Locked
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{track.description}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{track.duration_weeks} weeks</span>
                  {track.lesson_count !== undefined && (
                    <span>{track.lesson_count} lessons</span>
                  )}
                </div>

                {/* Progress (if enrolled) */}
                {isEnrolled && track.enrollment && (
                  <div>
                    <ProgressBar value={track.enrollment.progress_pct} showLabel />
                  </div>
                )}

                {/* Action */}
                <div>
                  {isLocked ? (
                    <p className="text-xs text-gray-400">
                      Complete the prerequisite track to unlock.
                    </p>
                  ) : isEnrolled ? (
                    <Link href={`/tracks/${track.slug}`}>
                      <Button variant="secondary" size="sm" className="w-full">
                        Continue
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      isLoading={enrolling === track.id}
                      onClick={() => handleEnroll(track)}
                    >
                      Enroll
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
