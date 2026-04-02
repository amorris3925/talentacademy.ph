'use client';

import { create } from 'zustand';
import { academyApi } from '@/lib/api';
import { createBrowserClient } from '@/lib/supabase';
import type { AcademyLearner, LearnerSettings } from '@/types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SettingsState {
  profile: Partial<AcademyLearner>;
  settings: LearnerSettings | null;
  isSaving: boolean;
  saveStatus: SaveStatus;

  loadSettings: () => Promise<void>;
  updateProfile: (updates: Partial<AcademyLearner>) => Promise<void>;
  updateSettings: (updates: Partial<LearnerSettings>) => Promise<void>;
  uploadCv: (file: File) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useSettingsStore = create<SettingsState>((set) => ({
  profile: {},
  settings: null,
  isSaving: false,
  saveStatus: 'idle',

  async loadSettings() {
    try {
      const res = await academyApi.get<{ profile: AcademyLearner; settings: LearnerSettings }>('/settings');
      set({ profile: res.profile, settings: res.settings });
    } catch (err) {
      console.error('Failed to load settings:', err);
      throw err;
    }
  },

  async updateProfile(updates: Partial<AcademyLearner>) {
    set({ isSaving: true, saveStatus: 'saving' });
    try {
      await academyApi.patch<{ updated: boolean }>('/settings', updates);
      set((state) => ({
        profile: { ...state.profile, ...updates },
        isSaving: false,
        saveStatus: 'saved',
      }));
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => set({ saveStatus: 'idle' }), 2000);
    } catch {
      set({ isSaving: false, saveStatus: 'error' });
      throw new Error('Failed to update profile');
    }
  },

  async updateSettings(updates: Partial<LearnerSettings>) {
    set({ isSaving: true, saveStatus: 'saving' });
    try {
      await academyApi.patch<{ updated: boolean }>('/settings', updates);
      set((state) => ({
        settings: state.settings ? { ...state.settings, ...updates } : null,
        isSaving: false,
        saveStatus: 'saved',
      }));
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => set({ saveStatus: 'idle' }), 2000);
    } catch {
      set({ isSaving: false, saveStatus: 'error' });
      throw new Error('Failed to update settings');
    }
  },

  async uploadCv(_file: File) {
    throw new Error('CV upload coming soon');
  },

  async uploadAvatar(_file: File) {
    throw new Error('Avatar upload coming soon');
  },

  async changePassword(newPassword: string) {
    set({ isSaving: true, saveStatus: 'saving' });
    try {
      const sb = createBrowserClient();
      const { error } = await sb.auth.updateUser({ password: newPassword });
      if (error) throw error;
      set({ isSaving: false, saveStatus: 'saved' });
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => set({ saveStatus: 'idle' }), 2000);
    } catch (err) {
      set({ isSaving: false, saveStatus: 'error' });
      throw err instanceof Error ? err : new Error('Failed to change password');
    }
  },

  async deleteAccount() {
    await academyApi.del('/account');
  },
}));
