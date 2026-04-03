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
      // Use direct Gemini endpoint (no polling needed — returns synchronously)
      const res = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...params }),
        signal: AbortSignal.timeout(120000),
      });
      const gen = (await res.json()) as AcademyGeneration;
      set((state) => ({
        activeGeneration: gen,
        generations: [gen, ...state.generations],
      }));
      if (gen.status === 'failed') {
        throw new Error(gen.error || 'Image generation failed');
      }
      return gen;
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
