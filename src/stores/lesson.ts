'use client';

import { create } from 'zustand';
import { academyApi } from '@/lib/api';
import type { AcademyLesson, AcademyModule, AcademyTrack, LessonProgress } from '@/types';

type ActiveTab = 'lesson' | 'chat';

interface LessonState {
  currentLesson: AcademyLesson | null;
  currentModule: AcademyModule | null;
  currentTrack: AcademyTrack | null;
  progress: LessonProgress | null;
  isLoading: boolean;
  activeTab: ActiveTab;

  loadLesson: (trackSlug: string, moduleSlug: string, lessonSlug: string) => Promise<void>;
  markComplete: () => Promise<void>;
  updateProgress: (data: Partial<LessonProgress>) => Promise<void>;
  setActiveTab: (tab: ActiveTab) => void;
}

export const useLessonStore = create<LessonState>((set, get) => ({
  currentLesson: null,
  currentModule: null,
  currentTrack: null,
  progress: null,
  isLoading: false,
  activeTab: 'lesson',

  async loadLesson(trackSlug: string, moduleSlug: string, lessonSlug: string) {
    set({ isLoading: true });
    try {
      const data = await academyApi.get<{
        lesson: AcademyLesson;
        module: AcademyModule;
        track: AcademyTrack;
        progress: LessonProgress | null;
      }>(`/tracks/${trackSlug}/modules/${moduleSlug}/lessons/${lessonSlug}`);

      set({
        currentLesson: data.lesson,
        currentModule: data.module,
        currentTrack: data.track,
        progress: data.progress,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  async markComplete() {
    const { currentLesson, progress } = get();
    if (!currentLesson) return;

    const updated = await academyApi.post<LessonProgress>(
      `/lessons/${currentLesson.id}/complete`,
    );
    set({ progress: updated });
  },

  async updateProgress(data: Partial<LessonProgress>) {
    const { currentLesson } = get();
    if (!currentLesson) return;

    const updated = await academyApi.patch<LessonProgress>(
      `/lessons/${currentLesson.id}/progress`,
      data,
    );
    set({ progress: updated });
  },

  setActiveTab(tab: ActiveTab) {
    set({ activeTab: tab });
  },
}));
