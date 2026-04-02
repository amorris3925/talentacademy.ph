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
    const [stats, badges, xpLog] = await Promise.all([
      academyApi.get<{ xp: number; level: string; current_streak: number }>('/learner/stats'),
      academyApi.get<LearnerBadge[]>('/learner/badges'),
      academyApi.get<XpLogEntry[]>('/learner/xp-log'),
    ]);

    set({
      xp: stats.xp,
      level: stats.level,
      currentStreak: stats.current_streak,
      badges,
      recentXpGains: xpLog,
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
