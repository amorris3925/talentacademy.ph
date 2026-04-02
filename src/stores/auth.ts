'use client';

import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase';
import { academyApi } from '@/lib/api';
import { useChatStore } from '@/stores/chat';
import { useGamificationStore } from '@/stores/gamification';
import { useGenerationStore } from '@/stores/generation';
import { useLessonStore } from '@/stores/lesson';
import { useSettingsStore } from '@/stores/settings';
import type { AcademyLearner, RegisterPayload } from '@/types';

interface AuthState {
  learner: AcademyLearner | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  let listenerSetUp = false;
  let authSubscription: { unsubscribe: () => void } | null = null;

  return {
    learner: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,

    async initialize() {
      set({ isLoading: true });
      try {
        const supabase = createBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          set({ session });
          try {
            const res = await academyApi.get<{ learner: AcademyLearner; badges: unknown[] }>('/learner/profile');
            set({ learner: res.learner, isAuthenticated: true });
          } catch {
            set({ learner: null, isAuthenticated: false });
          }
        } else {
          set({ session: null, learner: null, isAuthenticated: false });
        }

        // Set up auth state listener once
        if (!listenerSetUp) {
          listenerSetUp = true;
          // Unsubscribe previous listener if any (safety net)
          authSubscription?.unsubscribe();
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            set({ session: newSession });
            if (event === 'SIGNED_OUT' || !newSession) {
              set({ learner: null, isAuthenticated: false });
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              try {
                const res = await academyApi.get<{ learner: AcademyLearner; badges: unknown[] }>('/learner/profile');
                set({ learner: res.learner, isAuthenticated: true });
              } catch {
                set({ learner: null, isAuthenticated: false });
              }
            }
          });
          authSubscription = subscription;
        }
      } finally {
        set({ isLoading: false });
      }
    },

    async login(email: string, password: string) {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ session });

      const res = await academyApi.get<{ learner: AcademyLearner; badges: unknown[] }>('/learner/profile');
      set({ learner: res.learner, isAuthenticated: true });
    },

    async register(data: RegisterPayload) {
      // Let the backend handle auth user creation to avoid double creation
      await academyApi.post<{ learner_id: string; auth_user_id: string }>('/register', data);

      // Establish session by signing in with the credentials
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;

      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ session });

      const res = await academyApi.get<{ learner: AcademyLearner; badges: unknown[] }>('/learner/profile');
      set({ learner: res.learner, isAuthenticated: true });
    },

    async logout() {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      set({ learner: null, session: null, isAuthenticated: false });
      useChatStore.setState({ messages: [], isStreaming: false, streamingContent: '' });
      useGamificationStore.setState({ xp: 0, level: 'beginner', currentStreak: 0, badges: [], recentXpGains: [] });
      useGenerationStore.setState({ generations: [], activeGeneration: null, isGenerating: false });
      useLessonStore.setState({ currentLesson: null, currentModule: null, currentTrack: null, progress: null });
      useSettingsStore.setState({ profile: {}, settings: null, isSaving: false, saveStatus: 'idle' });
    },

    async refreshProfile() {
      if (!get().session) return;
      try {
        const res = await academyApi.get<{ learner: AcademyLearner; badges: unknown[] }>('/learner/profile');
        set({ learner: res.learner, isAuthenticated: true });
      } catch {
        // Profile fetch failed — leave current state
      }
    },
  };
});
