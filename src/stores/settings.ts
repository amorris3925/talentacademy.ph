'use client';

import { create } from 'zustand';
import { academyApi } from '@/lib/api';
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
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  profile: {},
  settings: null,
  isSaving: false,
  saveStatus: 'idle',

  async loadSettings() {
    const [profile, settings] = await Promise.all([
      academyApi.get<AcademyLearner>('/learner/profile'),
      academyApi.get<LearnerSettings>('/learner/settings'),
    ]);

    set({ profile, settings });
  },

  async updateProfile(updates: Partial<AcademyLearner>) {
    set({ isSaving: true, saveStatus: 'saving' });
    try {
      const updated = await academyApi.patch<AcademyLearner>('/learner/profile', updates);
      set({ profile: updated, isSaving: false, saveStatus: 'saved' });
      setTimeout(() => set({ saveStatus: 'idle' }), 2000);
    } catch {
      set({ isSaving: false, saveStatus: 'error' });
      throw new Error('Failed to update profile');
    }
  },

  async updateSettings(updates: Partial<LearnerSettings>) {
    set({ isSaving: true, saveStatus: 'saving' });
    try {
      const updated = await academyApi.patch<LearnerSettings>('/learner/settings', updates);
      set({ settings: updated, isSaving: false, saveStatus: 'saved' });
      setTimeout(() => set({ saveStatus: 'idle' }), 2000);
    } catch {
      set({ isSaving: false, saveStatus: 'error' });
      throw new Error('Failed to update settings');
    }
  },

  async uploadCv(file: File) {
    set({ isSaving: true, saveStatus: 'saving' });
    try {
      const result = await academyApi.upload<{ cv_url: string }>('/learner/upload-cv', file, 'cv');
      set((state) => ({
        profile: { ...state.profile, cv_url: result.cv_url },
        isSaving: false,
        saveStatus: 'saved',
      }));
      setTimeout(() => set({ saveStatus: 'idle' }), 2000);
    } catch {
      set({ isSaving: false, saveStatus: 'error' });
      throw new Error('Failed to upload CV');
    }
  },

  async uploadAvatar(file: File) {
    set({ isSaving: true, saveStatus: 'saving' });
    try {
      const result = await academyApi.upload<{ avatar_url: string }>(
        '/learner/upload-avatar',
        file,
        'avatar',
      );
      set((state) => ({
        profile: { ...state.profile, avatar_url: result.avatar_url },
        isSaving: false,
        saveStatus: 'saved',
      }));
      setTimeout(() => set({ saveStatus: 'idle' }), 2000);
    } catch {
      set({ isSaving: false, saveStatus: 'error' });
      throw new Error('Failed to upload avatar');
    }
  },

  async changePassword(oldPassword: string, newPassword: string) {
    set({ isSaving: true, saveStatus: 'saving' });
    try {
      await academyApi.post('/learner/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      set({ isSaving: false, saveStatus: 'saved' });
      setTimeout(() => set({ saveStatus: 'idle' }), 2000);
    } catch {
      set({ isSaving: false, saveStatus: 'error' });
      throw new Error('Failed to change password');
    }
  },

  async deleteAccount() {
    await academyApi.del('/learner/account');
  },
}));
