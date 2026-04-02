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
      const [lessonRes, trackRes] = await Promise.all([
        academyApi.get<any>(`/lessons/${lessonSlug}`),
        academyApi.get<any>(`/tracks/${trackSlug}`),
      ]);
      const mod = (trackRes.modules || []).find((m: any) => m.slug === moduleSlug);
      set({
        currentLesson: lessonRes.lesson,
        currentModule: mod ?? null,
        currentTrack: trackRes.track,
        progress: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  async markComplete() {
    const { currentLesson } = get();
    if (!currentLesson) return;

    const updated = await academyApi.post<LessonProgress>(
      `/learner/progress/${currentLesson.id}`,
      { status: 'completed' },
    );
    set({ progress: updated });
  },

  async updateProgress(data: Partial<LessonProgress>) {
    const { currentLesson } = get();
    if (!currentLesson) return;

    const updated = await academyApi.post<LessonProgress>(
      `/learner/progress/${currentLesson.id}`,
      data,
    );
    set({ progress: updated });
  },

  setActiveTab(tab: ActiveTab) {
    set({ activeTab: tab });
  },
}));
