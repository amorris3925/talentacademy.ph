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
  error: string | null;
  activeTab: ActiveTab;
  showCompletionOverlay: boolean;
  completedQuizIndices: number[];

  loadLesson: (trackSlug: string, moduleSlug: string, lessonSlug: string) => Promise<void>;
  markComplete: () => Promise<void>;
  updateProgress: (data: Partial<LessonProgress>) => Promise<void>;
  setActiveTab: (tab: ActiveTab) => void;
  setShowCompletionOverlay: (val: boolean) => void;
  addCompletedQuiz: (index: number) => void;
}

export const useLessonStore = create<LessonState>((set, get) => {
  let currentRequestId = 0;

  return {
  currentLesson: null,
  currentModule: null,
  currentTrack: null,
  progress: null,
  isLoading: false,
  error: null,
  activeTab: 'lesson',
  showCompletionOverlay: false,
  completedQuizIndices: [],

  async loadLesson(trackSlug: string, moduleSlug: string, lessonSlug: string) {
    const requestId = ++currentRequestId;
    set({ isLoading: true, error: null, showCompletionOverlay: false, completedQuizIndices: [] });
    try {
      const [lessonRes, trackRes] = await Promise.all([
        academyApi.get<{ lesson: AcademyLesson }>(`/lessons/${lessonSlug}`),
        academyApi.get<{ track: AcademyTrack; modules: AcademyModule[] }>(`/tracks/${trackSlug}`),
      ]);
      // Discard result if a newer request was started
      if (requestId !== currentRequestId) return;

      // Parse content_blocks if it's a string (DB stores as JSON string via json.dumps)
      const lesson = lessonRes.lesson;
      if (typeof lesson.content_blocks === 'string') {
        try { lesson.content_blocks = JSON.parse(lesson.content_blocks) }
        catch { lesson.content_blocks = [] }
      }
      if (!Array.isArray(lesson.content_blocks)) {
        lesson.content_blocks = []
      }

      const mod = (trackRes.modules || []).find((m: AcademyModule) => m.slug === moduleSlug);
      set({
        currentLesson: lesson,
        currentModule: mod ?? null,
        currentTrack: { ...trackRes.track, modules: trackRes.modules || [] },
        isLoading: false,
      });

      // Fetch progress for this lesson (non-blocking)
      try {
        const progressRes = await academyApi.get<LessonProgress>(`/learner/progress/${lesson.id}`);
        if (requestId !== currentRequestId) return;
        set({ progress: progressRes ?? null });
      } catch {
        // No progress yet — that's fine, user hasn't started
        if (requestId !== currentRequestId) return;
        set({ progress: null });
      }
    } catch {
      if (requestId !== currentRequestId) return;
      set({ error: 'Failed to load lesson', isLoading: false });
    }
  },

  async markComplete() {
    const { currentLesson } = get();
    if (!currentLesson) return;
    set({ error: null });

    try {
      const updated = await academyApi.post<LessonProgress>(
        `/learner/progress/${currentLesson.id}`,
        { status: 'completed' },
      );
      set({ progress: updated, showCompletionOverlay: true });
    } catch (err) {
      console.error('Failed to mark complete:', err);
      set({ error: 'Failed to mark lesson complete' });
    }
  },

  async updateProgress(data: Partial<LessonProgress>) {
    const { currentLesson } = get();
    if (!currentLesson) return;
    set({ error: null });

    try {
      const updated = await academyApi.post<LessonProgress>(
        `/learner/progress/${currentLesson.id}`,
        data,
      );
      set({ progress: updated });
    } catch (err) {
      console.error('Failed to update progress:', err);
      set({ error: 'Failed to update progress' });
    }
  },

  setActiveTab(tab: ActiveTab) {
    set({ activeTab: tab });
  },

  setShowCompletionOverlay(val: boolean) {
    set({ showCompletionOverlay: val });
  },

  addCompletedQuiz(index: number) {
    const { completedQuizIndices } = get();
    if (!completedQuizIndices.includes(index)) {
      set({ completedQuizIndices: [...completedQuizIndices, index] });
    }
  },
};
});
