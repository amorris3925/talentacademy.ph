'use client';

import { create } from 'zustand';
import { toast } from 'sonner';
import { academyApi } from '@/lib/api';
import { formatXp } from '@/lib/utils';
import type { LearnerBadge, XpLogEntry } from '@/types';

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
    const [dashboard, profileRes] = await Promise.all([
      academyApi.get<any>('/learner/dashboard'),
      academyApi.get<any>('/learner/profile'),
    ]);

    set({
      xp: dashboard.xp_total ?? 0,
      level: dashboard.level ?? 'beginner',
      currentStreak: dashboard.current_streak ?? 0,
      badges: profileRes.badges ?? [],
      recentXpGains: (dashboard.recent_xp ?? []).map((x: any, i: number) => ({
        id: String(i),
        learner_id: '',
        amount: x.amount,
        source: x.source,
        source_id: null,
        created_at: x.created_at,
      })),
    });
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
