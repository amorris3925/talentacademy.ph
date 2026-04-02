'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  BookOpen,
  Sparkles,
  Users,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import { academyApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { formatXp, formatDate, getLevelColor } from '@/lib/utils';
import { Card, Spinner, Badge, ProgressBar, Avatar } from '@/components/ui';
import type { DashboardData } from '@/types';

const XP_THRESHOLDS: Record<string, number> = {
  beginner: 0,
  intermediate: 500,
  advanced: 2000,
  expert: 5000,
  master: 10000,
};

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];

function getNextLevel(currentLevel: string): string | null {
  const idx = LEVEL_ORDER.indexOf(currentLevel.toLowerCase());
  if (idx < 0 || idx >= LEVEL_ORDER.length - 1) return null;
  return LEVEL_ORDER[idx + 1];
}

function getXpProgress(xp: number, level: string): { current: number; target: number; pct: number } {
  const nextLevel = getNextLevel(level);
  if (!nextLevel) return { current: xp, target: xp, pct: 100 };
  const currentThreshold = XP_THRESHOLDS[level.toLowerCase()] ?? 0;
  const nextThreshold = XP_THRESHOLDS[nextLevel] ?? 10000;
  const progress = xp - currentThreshold;
  const range = nextThreshold - currentThreshold;
  return {
    current: progress,
    target: range,
    pct: Math.min(100, Math.round((progress / range) * 100)),
  };
}

export default function DashboardPage() {
  const { learner } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await academyApi.get<DashboardData>('/learner/dashboard');
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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

  const xpProgress = getXpProgress(data.xp, data.level);
  const nextLevel = getNextLevel(data.level);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {learner?.first_name ?? 'Learner'}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">Here is your learning overview.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* XP Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">XP Progress</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatXp(data.xp)}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 ${getLevelColor(data.level)}`}>
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar value={xpProgress.pct} showLabel />
            {nextLevel && (
              <p className="mt-1 text-xs text-gray-400">
                {xpProgress.current} / {xpProgress.target} XP to{' '}
                <span className="capitalize">{nextLevel}</span>
              </p>
            )}
          </div>
          <Badge variant="info" className="mt-2 capitalize">{data.level}</Badge>
        </Card>

        {/* Streak Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Current Streak</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{data.streak} days</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-500">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Keep learning daily to grow your streak!</p>
        </Card>

        {/* Level Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Level</p>
              <p className={`mt-1 text-2xl font-bold capitalize ${getLevelColor(data.level)}`}>
                {data.level}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          {nextLevel ? (
            <p className="mt-3 text-xs text-gray-400">
              Reach {formatXp(XP_THRESHOLDS[nextLevel])} to unlock{' '}
              <span className="capitalize">{nextLevel}</span>
            </p>
          ) : (
            <p className="mt-3 text-xs text-gray-400">You have reached the highest level!</p>
          )}
        </Card>
      </div>

      {/* Enrolled Tracks */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Your Tracks</h2>
          <Link href="/tracks" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            View all
          </Link>
        </div>
        {data.enrolled_tracks.length === 0 ? (
          <Card>
            <p className="py-6 text-center text-sm text-gray-500">
              You are not enrolled in any tracks yet.{' '}
              <Link href="/tracks" className="font-medium text-indigo-600 hover:underline">
                Browse tracks
              </Link>
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.enrolled_tracks.map((enrollment) => {
              const summary = data.progress_summary.find(
                (s) => s.track_slug === enrollment.track_id,
              );
              return (
                <Card key={enrollment.id} hover>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 capitalize">
                        {summary?.track_slug?.replace(/-/g, ' ') ?? 'Track'}
                      </h3>
                      <Badge variant={enrollment.status === 'active' ? 'success' : 'default'}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    <ProgressBar value={enrollment.progress_pct} showLabel />
                    {summary && (
                      <p className="text-xs text-gray-400">
                        {summary.completed} / {summary.total} lessons completed
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Badges */}
      {data.recent_badges.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Badges</h2>
          <div className="flex flex-wrap gap-4">
            {data.recent_badges.slice(0, 5).map((lb) => (
              <div
                key={lb.id}
                className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50 text-2xl">
                  {lb.badge.icon ?? '🏅'}
                </div>
                <span className="text-xs font-semibold text-gray-800">{lb.badge.title}</span>
                <span className="text-[10px] text-gray-400">{formatDate(lb.earned_at)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/tracks">
            <Card hover className="group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Continue Learning</p>
                  <p className="text-xs text-gray-500">Pick up where you left off</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
          <Link href="/studio">
            <Card hover className="group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">AI Studio</p>
                  <p className="text-xs text-gray-500">Create with AI tools</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
          <Link href="/community">
            <Card hover className="group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Community</p>
                  <p className="text-xs text-gray-500">Ask questions &amp; connect</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
