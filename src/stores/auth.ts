'use client';

import { create } from 'zustand';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase';
import { academyApi } from '@/lib/api';
import { analytics } from '@/lib/analytics';
import { identifyUser, resetUser } from '@/components/tracking/ExternalAnalytics';
import { useChatStore } from '@/stores/chat';
import { useGamificationStore } from '@/stores/gamification';
import { useGenerationStore } from '@/stores/generation';
import { useInteractionStore } from '@/stores/interaction';
import { useLessonStore } from '@/stores/lesson';
import { useSettingsStore } from '@/stores/settings';
import type { AcademyLearner, RegisterPayload } from '@/types';

/** Fetch learner profile directly from Supabase — no Henry dependency. */
async function fetchLearnerProfile(
  supabase: SupabaseClient,
  authUserId: string,
): Promise<AcademyLearner | null> {
  const { data, error } = await supabase
    .from('academy_learners')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();
  if (error || !data) return null;
  return data as AcademyLearner;
}

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
  let initializePromise: Promise<void> | null = null;

  return {
    learner: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,

    async initialize() {
      // Deduplicate concurrent calls — return the in-flight promise
      if (initializePromise) return initializePromise;

      const doInit = async () => {
      set({ isLoading: true });

      // Set up analytics auto-expiry: when the 24h session expires, log the user out
      analytics.setOnSessionExpired(() => {
        get().logout();
      });

      try {
        const supabase = createBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          set({ session });
          const learner = await fetchLearnerProfile(supabase, session.user.id);
          if (learner) {
            set({ learner, isAuthenticated: true });
          } else {
            set({ learner: null, isAuthenticated: false });
          }

          // Rehydrate analytics session from localStorage
          // If the stored session is expired, this returns false and auto-logout fires
          if (!analytics.rehydrate()) {
            // No valid analytics session — start a new one
            await analytics.startSession();
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
              const learner = await fetchLearnerProfile(supabase, newSession.user.id);
              if (learner) {
                set({ learner, isAuthenticated: true });
              } else {
                set({ learner: null, isAuthenticated: false });
              }
            }
          });
          authSubscription = subscription;
        }
      } finally {
        set({ isLoading: false });
        initializePromise = null;
      }
      };

      initializePromise = doInit();
      return initializePromise;
    },

    async login(email: string, password: string) {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          throw new Error('Please verify your email before logging in. Check your inbox for a verification link.');
        }
        throw error;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ session });

      const learner = await fetchLearnerProfile(supabase, session!.user.id);
      if (!learner) throw new Error('Learner profile not found. Please contact support.');
      set({ learner, isAuthenticated: true });

      // Start analytics session after successful login (non-blocking)
      analytics.startSession().then(() => analytics.trackEvent('login'));

      // Identify user in external analytics (PostHog, etc.)
      identifyUser(learner.id, {
        email: learner.email,
        name: `${learner.first_name} ${learner.last_name}`,
        cohort: learner.cohort,
        specialization: learner.specialization,
      });
    },

    async register(data: RegisterPayload) {
      // Let the backend handle auth user creation to avoid double creation
      // User must verify email before they can sign in
      await academyApi.post<{ learner_id: string; auth_user_id: string }>('/register', data);
    },

    async logout() {
      // End analytics session before signing out
      await analytics.endSession();

      // Reset external analytics identity
      resetUser();

      const supabase = createBrowserClient();
      authSubscription?.unsubscribe();
      authSubscription = null;
      listenerSetUp = false;
      await supabase.auth.signOut();
      set({ learner: null, session: null, isAuthenticated: false });
      useChatStore.setState({ messages: [], isStreaming: false, streamingContent: '' });
      useGamificationStore.setState({ xp: 0, level: 'beginner', currentStreak: 0, badges: [], recentXpGains: [] });
      useGenerationStore.getState().cancelPolling();
      useGenerationStore.setState({ generations: [], activeGeneration: null, isGenerating: false, generatingTypes: [] });
      useInteractionStore.getState().reset();
      useLessonStore.setState({ currentLesson: null, currentModule: null, currentTrack: null, progress: null });
      useSettingsStore.setState({ profile: {}, settings: null, isSaving: false, saveStatus: 'idle' });
    },

    async refreshProfile() {
      const session = get().session;
      if (!session) return;
      const supabase = createBrowserClient();
      const learner = await fetchLearnerProfile(supabase, session.user.id);
      if (learner) {
        set({ learner, isAuthenticated: true });
      }
    },
  };
});
