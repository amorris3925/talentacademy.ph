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
  const body: Record<string, unknown> = { prompt, ...params };
  const res = await academyApi.post<any>(`/generate/${genType}`, body);
  // Map generation_id to id for consistency with frontend type
  return { ...res, id: res.generation_id ?? res.id } as AcademyGeneration;
}

export const useGenerationStore = create<GenerationState>((set, get) => ({
  generations: [],
  activeGeneration: null,
  isGenerating: false,

  async generateImage(prompt: string, params?: ImageGenParams) {
    set({ isGenerating: true });
    try {
      const gen = await startGeneration('image', prompt, params as unknown as Record<string, unknown>);
      set((state) => ({
        activeGeneration: gen,
        generations: [gen, ...state.generations],
      }));
      const final = await get().pollStatus(gen.id);
      return final;
    } finally {
      set({ isGenerating: false });
    }
  },

  async generateVideo(prompt: string, params?: VideoGenParams) {
    set({ isGenerating: true });
    try {
      const gen = await startGeneration('video', prompt, params as unknown as Record<string, unknown>);
      set((state) => ({
        activeGeneration: gen,
        generations: [gen, ...state.generations],
      }));
      const final = await get().pollStatus(gen.id);
      return final;
    } finally {
      set({ isGenerating: false });
    }
  },

  async generateAudio(text: string, params?: AudioGenParams) {
    set({ isGenerating: true });
    try {
      const gen = await startGeneration('audio', text, params as unknown as Record<string, unknown>);
      set((state) => ({
        activeGeneration: gen,
        generations: [gen, ...state.generations],
      }));
      const final = await get().pollStatus(gen.id);
      return final;
    } finally {
      set({ isGenerating: false });
    }
  },

  async generateMusic(prompt: string, params?: MusicGenParams) {
    set({ isGenerating: true });
    try {
      const gen = await startGeneration('music', prompt, params as unknown as Record<string, unknown>);
      set((state) => ({
        activeGeneration: gen,
        generations: [gen, ...state.generations],
      }));
      const final = await get().pollStatus(gen.id);
      return final;
    } finally {
      set({ isGenerating: false });
    }
  },

  async pollStatus(generationId: string): Promise<AcademyGeneration> {
    const POLL_INTERVAL = 2000;
    const MAX_POLLS = 150; // 5 minutes max

    for (let i = 0; i < MAX_POLLS; i++) {
      const res = await academyApi.get<any>(`/generate/${generationId}/status`);
      const gen = { ...res, id: res.generation_id ?? res.id } as AcademyGeneration;

      // Update in state
      set((state) => ({
        activeGeneration: gen,
        generations: state.generations.map((g) => (g.id === gen.id ? gen : g)),
      }));

      if (gen.status === 'completed' || gen.status === 'failed') {
        return gen;
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }

    throw new Error('Generation timed out');
  },

  async loadHistory(type?: string) {
    const params: Record<string, string> = {};
    if (type) params.type = type;

    const res = await academyApi.get<any>('/learner/generations', params);
    const generations = (res.generations ?? []).map((g: any) => ({
      ...g,
      id: g.generation_id ?? g.id,
    })) as AcademyGeneration[];
    set({ generations });
  },
}));
