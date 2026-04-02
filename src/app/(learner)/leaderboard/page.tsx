'use client';

import { useEffect, useState, useCallback } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { academyApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { formatXp, getLevelColor } from '@/lib/utils';
import { Card, Spinner, Avatar, Badge, Button, Select } from '@/components/ui';
import type { LeaderboardEntry, LeaderboardResponse } from '@/types';

const RANK_STYLES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Gold' },
  2: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Silver' },
  3: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Bronze' },
};

export default function LeaderboardPage() {
  const { learner } = useAuthStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cohortFilter, setCohortFilter] = useState('');
  const [trackFilter, setTrackFilter] = useState('');

  const fetchLeaderboard = useCallback(
    async (reset: boolean = false) => {
      if (reset) {
        setLoading(true);
        setEntries([]);
      } else {
        setLoadingMore(true);
      }

      try {
        const params: Record<string, string | number | boolean | undefined> = {
          limit: 20,
        };
        if (!reset && cursor) params.cursor = cursor;
        if (cohortFilter) params.cohort = cohortFilter;
        if (trackFilter) params.track = trackFilter;

        const res = await academyApi.get<LeaderboardResponse>(
          '/leaderboard',
          params,
        );

        setEntries((prev) => (reset ? res.leaderboard : [...prev, ...res.leaderboard]));
        setCursor(res.next_cursor);
        setHasMore(!!res.next_cursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cursor, cohortFilter, trackFilter],
  );

  useEffect(() => {
    fetchLeaderboard(true);
  }, [cohortFilter, trackFilter]);

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
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500">See how you rank among fellow learners.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-48">
          <Select
            placeholder="All Cohorts"
            value={cohortFilter}
            onChange={(e) => setCohortFilter(e.target.value)}
            options={[
              { value: '', label: 'All Cohorts' },
              { value: 'cohort-1', label: 'Cohort 1' },
              { value: 'cohort-2', label: 'Cohort 2' },
              { value: 'cohort-3', label: 'Cohort 3' },
            ]}
          />
        </div>
        <div className="w-48">
          <Select
            placeholder="All Tracks"
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            options={[
              { value: '', label: 'All Tracks' },
              { value: 'foundation', label: 'Foundation' },
              { value: 'graphic-design', label: 'Graphic Design' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'operations', label: 'Operations' },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3 w-16">Rank</th>
                <th className="px-4 py-3">Learner</th>
                <th className="px-4 py-3 w-28">Level</th>
                <th className="px-4 py-3 w-28 text-right">XP</th>
                <th className="px-4 py-3 w-24 text-right">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {entries.map((entry, index) => {
                const rank = index + 1;
                const isMe = entry.id === learner?.id;
                const rankStyle = RANK_STYLES[rank];

                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isMe
                        ? 'bg-indigo-50/50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      {rankStyle ? (
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${rankStyle.bg} ${rankStyle.text}`}
                        >
                          {rank}
                        </span>
                      ) : (
                        <span className="inline-flex h-7 w-7 items-center justify-center text-sm font-medium text-gray-500">
                          {rank}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={entry.avatar_url}
                          alt={`${entry.first_name} ${entry.last_name}`}
                          fallback={`${entry.first_name[0]}${entry.last_name[0]}`}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {entry.first_name} {entry.last_name}
                            {isMe && (
                              <Badge variant="info" className="ml-2">
                                You
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium capitalize ${getLevelColor(entry.level)}`}>
                        {entry.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatXp(entry.xp_total)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1 text-sm text-gray-600">
                        <Flame className="h-3.5 w-3.5 text-orange-400" />
                        {entry.current_streak}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {entries.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-500">
            No learners found for the selected filters.
          </p>
        )}
      </Card>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            isLoading={loadingMore}
            onClick={() => fetchLeaderboard(false)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
