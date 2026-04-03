'use client';

import { create } from 'zustand';
import { toast } from 'sonner';
import { academyApi } from '@/lib/api';
import { formatXp } from '@/lib/utils';
import type { DashboardData, LearnerBadge, XpLogEntry } from '@/types';

interface GamificationState {
  xp: number;
  level: string;
  currentStreak: number;
  badges: LearnerBadge[];
  recentXpGains: XpLogEntry[];

  loadStats: () => Promise<void>;
  showXpToast: (amount: number, source: string) => void;
}

export const useGamificationStore = create<GamificationState>((set) => ({
  xp: 0,
  level: 'beginner',
  currentStreak: 0,
  badges: [],
  recentXpGains: [],

  async loadStats() {
    try {
      const dashboard = await academyApi.get<DashboardData>('/learner/dashboard');

      set({
        xp: dashboard.xp_total ?? 0,
        level: dashboard.level ?? 'beginner',
        currentStreak: dashboard.current_streak ?? 0,
        badges: dashboard.recent_badges ?? [],
        recentXpGains: (dashboard.recent_xp ?? []).map((x: { amount: number; source: string; created_at: string }, i: number) => ({
          id: String(i),
          learner_id: '',
          amount: x.amount,
          source: x.source,
          source_id: null,
          created_at: x.created_at,
        })),
      });
    } catch (err) {
      console.error('Failed to load gamification stats:', err);
    }
  },

  showXpToast(amount: number, source: string) {
    toast.success(`+${formatXp(amount)}`, {
      description: source,
      duration: 3000,
    });

    // Also update local XP optimistically
    set((state) => ({ xp: state.xp + amount }));
  },
}));
