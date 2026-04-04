'use client';

import { create } from 'zustand';
import { academyApi } from '@/lib/api';
import type {
  AcademyGeneration,
  ImageGenParams,
  VideoGenParams,
  AudioGenParams,
  MusicGenParams,
} from '@/types';

interface GenerationState {
  generations: AcademyGeneration[];
  activeGeneration: AcademyGeneration | null;
  isGenerating: boolean;
  generatingTypes: string[];
  cancelPolling: () => void;

  generateImage: (prompt: string, params?: ImageGenParams) => Promise<AcademyGeneration>;
  generateVideo: (prompt: string, params?: VideoGenParams) => Promise<AcademyGeneration>;
  generateAudio: (text: string, params?: AudioGenParams) => Promise<AcademyGeneration>;
  generateMusic: (prompt: string, params?: MusicGenParams) => Promise<AcademyGeneration>;
  pollStatus: (generationId: string) => Promise<AcademyGeneration>;
  loadHistory: (type?: string) => Promise<void>;
}

async function startGeneration(
  genType: string,
  prompt: string,
  params?: Record<string, unknown>,
): Promise<AcademyGeneration> {
  const body: Record<string, unknown> =
    genType === 'audio' ? { text: prompt, ...params } : { prompt, ...params };
  const res = await academyApi.post<AcademyGeneration & { generation_id?: string }>(`/generate/${genType}`, body);
  // Map generation_id to id for consistency with frontend type
  return { ...res, id: res.generation_id ?? res.id } as AcademyGeneration;
}

export const useGenerationStore = create<GenerationState>((set, get) => {
  const pollControllers = new Map<string, AbortController>();

  function addGeneratingType(type: string) {
    set((state) => {
      if (state.generatingTypes.includes(type)) return state;
      const next = [...state.generatingTypes, type];
      return { generatingTypes: next, isGenerating: true };
    });
  }

  function removeGeneratingType(type: string) {
    set((state) => {
      const next = state.generatingTypes.filter((t) => t !== type);
      return { generatingTypes: next, isGenerating: next.length > 0 };
    });
  }

  return {
  generations: [],
  activeGeneration: null,
  isGenerating: false,
  generatingTypes: [],

  cancelPolling() {
    pollControllers.forEach((c) => c.abort());
    pollControllers.clear();
  },

  async generateImage(prompt: string, params?: ImageGenParams) {
    addGeneratingType('image');
    try {
      // Route image generation through Gemini instead of Henry
      const placeholder: AcademyGeneration = {
        id: `gemini-${Date.now()}`,
        learner_id: '',
        type: 'image',
        prompt,
        model: 'gemini',
        params: params as unknown as Record<string, unknown>,
        result_url: null,
        result_text: null,
        status: 'processing',
        error: null,
        lesson_id: null,
        tokens_used: null,
        duration_ms: null,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        activeGeneration: placeholder,
        generations: [placeholder, ...state.generations],
      }));

      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: params?.style }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
        const failed: AcademyGeneration = {
          ...placeholder,
          status: 'failed',
          error: errData.error || 'Image generation failed',
        };
        set((state) => ({
          activeGeneration: failed,
          generations: state.generations.map((g) => (g.id === failed.id ? failed : g)),
        }));
        return failed;
      }

      const data = await res.json();
      const resultUrl = data.url || (data.base64 && data.media_type
        ? `data:${data.media_type};base64,${data.base64}`
        : null);

      const completed: AcademyGeneration = {
        ...placeholder,
        status: resultUrl ? 'completed' : 'failed',
        result_url: resultUrl,
        error: resultUrl ? null : 'No image data returned',
      };
      set((state) => ({
        activeGeneration: completed,
        generations: state.generations.map((g) => (g.id === completed.id ? completed : g)),
      }));
      return completed;
    } finally {
      removeGeneratingType('image');
    }
  },

  async generateVideo(prompt: string, params?: VideoGenParams) {
    addGeneratingType('video');
    try {
      const gen = await startGeneration('video', prompt, params as unknown as Record<string, unknown>);
      set((state) => ({
        activeGeneration: gen,
        generations: [gen, ...state.generations],
      }));
      const final = await get().pollStatus(gen.id);
      return final;
    } finally {
      removeGeneratingType('video');
    }
  },

  async generateAudio(text: string, params?: AudioGenParams) {
    addGeneratingType('audio');
    try {
      const gen = await startGeneration('audio', text, params as unknown as Record<string, unknown>);
      set((state) => ({
        activeGeneration: gen,
        generations: [gen, ...state.generations],
      }));
      const final = await get().pollStatus(gen.id);
      return final;
    } finally {
      removeGeneratingType('audio');
    }
  },

  async generateMusic(prompt: string, params?: MusicGenParams) {
    addGeneratingType('music');
    try {
      const gen = await startGeneration('music', prompt, params as unknown as Record<string, unknown>);
      set((state) => ({
        activeGeneration: gen,
        generations: [gen, ...state.generations],
      }));
      const final = await get().pollStatus(gen.id);
      return final;
    } finally {
      removeGeneratingType('music');
    }
  },

  async pollStatus(generationId: string): Promise<AcademyGeneration> {
    const POLL_INTERVAL = 2000;
    const MAX_POLLS = 150; // 5 minutes max

    // Cancel any previous polling for this generation
    pollControllers.get(generationId)?.abort();
    const controller = new AbortController();
    pollControllers.set(generationId, controller);

    for (let i = 0; i < MAX_POLLS; i++) {
      if (controller.signal.aborted) {
        throw new Error('Polling cancelled');
      }

      const res = await academyApi.get<AcademyGeneration & { generation_id?: string }>(`/generate/${generationId}/status`);
      const gen = { ...res, id: res.generation_id ?? res.id } as AcademyGeneration;

      if (controller.signal.aborted) {
        throw new Error('Polling cancelled');
      }

      // Update in state
      set((state) => ({
        activeGeneration: gen,
        generations: state.generations.map((g) => (g.id === gen.id ? gen : g)),
      }));

      if (gen.status === 'completed' || gen.status === 'failed') {
        pollControllers.delete(generationId);
        return gen;
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(resolve, POLL_INTERVAL);
        controller.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Polling cancelled'));
        }, { once: true });
      });
    }

    pollControllers.delete(generationId);
    throw new Error('Generation timed out');
  },

  async loadHistory(type?: string) {
    try {
      const params: Record<string, string> = {};
      if (type) params.type = type;

      const res = await academyApi.get<{ generations: (AcademyGeneration & { generation_id?: string })[] }>('/learner/generations', params);
      const generations = (res.generations ?? []).map((g: AcademyGeneration & { generation_id?: string }) => ({
        ...g,
        id: g.generation_id ?? g.id,
      })) as AcademyGeneration[];
      set({ generations });
    } catch (err) {
      console.error('Failed to load generation history:', err);
    }
  },
};
});
