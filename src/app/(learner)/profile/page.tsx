'use client';

import { useEffect, useState } from 'react';
import {
  Flame,
  Trophy,
  Star,
  Award,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { academyApi } from '@/lib/api';
import { formatXp, formatDate, getLevelColor } from '@/lib/utils';
import { Card, Spinner, Avatar, Badge, ProgressBar, EmptyState } from '@/components/ui';
import type {
  AcademyLearner,
  LearnerBadge,
  AcademyEnrollment,
} from '@/types';

interface ProfileResponse {
  learner: AcademyLearner;
  badges: LearnerBadge[];
}

interface ProfileData {
  learner: AcademyLearner;
  badges: LearnerBadge[];
  enrollments: (AcademyEnrollment & { track_title?: string; track_slug?: string })[];
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profileRes, enrollmentsRes] = await Promise.all([
          academyApi.get<ProfileResponse>('/learner/profile'),
          academyApi.get<any>('/enrollments'),
        ]);
        if (!cancelled) setData({ ...profileRes, enrollments: enrollmentsRes.enrollments || [] });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-red-600">{error ?? 'Something went wrong'}</p>
      </div>
    );
  }

  const { learner, badges, enrollments } = data;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Profile Header */}
      <Card>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Avatar
            src={learner.avatar_url}
            alt={`${learner.first_name} ${learner.last_name}`}
            fallback={`${learner.first_name[0]}${learner.last_name[0]}`}
            size="xl"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">
                {learner.first_name} {learner.last_name}
              </h1>
              <Link
                href="/settings"
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>
            {learner.bio && (
              <p className="mt-1 text-sm text-gray-500">{learner.bio}</p>
            )}
            <div className="mt-2">
              <Badge variant="info" className="capitalize">{learner.level}</Badge>
              {learner.cohort && (
                <Badge variant="default" className="ml-2">{learner.cohort}</Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="text-center">
          <div className="flex flex-col items-center gap-1">
            <Trophy className={`h-5 w-5 ${getLevelColor(learner.level)}`} />
            <span className="text-lg font-bold text-gray-900">{formatXp(learner.xp_total)}</span>
            <span className="text-xs text-gray-500">XP</span>
          </div>
        </Card>
        <Card className="text-center">
          <div className="flex flex-col items-center gap-1">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-lg font-bold text-gray-900">{learner.current_streak}</span>
            <span className="text-xs text-gray-500">Streak</span>
          </div>
        </Card>
        <Card className="text-center">
          <div className="flex flex-col items-center gap-1">
            <Star className="h-5 w-5 text-amber-500" />
            <span className="text-lg font-bold text-gray-900">
              {learner.talent_score ?? '--'}
            </span>
            <span className="text-xs text-gray-500">Talent Score</span>
          </div>
        </Card>
        <Card className="text-center">
          <div className="flex flex-col items-center gap-1">
            <Award className="h-5 w-5 text-purple-500" />
            <span className="text-lg font-bold text-gray-900">{badges.length}</span>
            <span className="text-xs text-gray-500">Badges</span>
          </div>
        </Card>
      </div>

      {/* Enrolled Tracks */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Enrolled Tracks</h2>
        {enrollments.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-sm text-gray-500">Not enrolled in any tracks yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {enrollments.map((e) => (
              <Card key={e.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {e.track_title ?? e.track_slug ?? e.track_id}
                    </p>
                    <div className="mt-2">
                      <ProgressBar value={e.progress_pct} showLabel size="sm" />
                    </div>
                  </div>
                  <Badge variant={e.status === 'active' ? 'success' : 'default'}>
                    {e.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Badge Collection */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Badges</h2>
        {badges.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No badges yet"
            description="Complete lessons and challenges to earn badges."
          />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
            {badges.map((lb) => (
              <div
                key={lb.id}
                className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50 text-xl">
                  {lb.badge.icon ?? '🏅'}
                </div>
                <span className="text-center text-[10px] font-semibold text-gray-800 leading-tight">
                  {lb.badge.title}
                </span>
                <span className="text-[9px] text-gray-400">{formatDate(lb.earned_at)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
