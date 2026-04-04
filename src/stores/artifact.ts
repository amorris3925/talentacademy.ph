'use client';

import { create } from 'zustand';
import { academyApi } from '@/lib/api';
import type { AcademyArtifact, ArtifactVersion } from '@/types';

interface ArtifactState {
  artifacts: AcademyArtifact[];
  activeArtifact: AcademyArtifact | null;
  versions: ArtifactVersion[];
  isLoading: boolean;
  error: string | null;

  loadArtifacts: (filters?: { track_id?: string; artifact_type?: string }) => Promise<void>;
  loadArtifact: (id: string) => Promise<void>;
  createArtifact: (data: {
    title: string;
    artifact_type: string;
    content_markdown: string;
    lesson_id?: string;
    track_id?: string;
    sections?: Array<{ label: string; content: string }>;
    summary?: string;
  }) => Promise<AcademyArtifact | null>;
  updateArtifact: (id: string, data: Partial<AcademyArtifact>) => Promise<void>;
  loadVersions: (artifactId: string) => Promise<void>;
  restoreVersion: (artifactId: string, versionId: string) => Promise<void>;
}

export const useArtifactStore = create<ArtifactState>((set, get) => ({
  artifacts: [],
  activeArtifact: null,
  versions: [],
  isLoading: false,
  error: null,

  async loadArtifacts(filters) {
    set({ isLoading: true, error: null });
    try {
      const params: Record<string, string> = {};
      if (filters?.track_id) params.track_id = filters.track_id;
      if (filters?.artifact_type) params.artifact_type = filters.artifact_type;

      const res = await academyApi.get<{ artifacts: AcademyArtifact[] }>('/artifacts', params);
      set({ artifacts: res.artifacts || [], isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load artifacts', isLoading: false });
    }
  },

  async loadArtifact(id) {
    set({ isLoading: true, error: null });
    try {
      const res = await academyApi.get<{ artifact: AcademyArtifact }>(`/artifacts/${id}`);
      set({ activeArtifact: res.artifact, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load artifact', isLoading: false });
    }
  },

  async createArtifact(data) {
    set({ error: null });
    try {
      const res = await academyApi.post<{ artifact: AcademyArtifact }>('/artifacts', data);
      const artifact = res.artifact;
      set((state) => ({ artifacts: [artifact, ...state.artifacts] }));
      return artifact;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create artifact' });
      return null;
    }
  },

  async updateArtifact(id, data) {
    set({ error: null });
    try {
      const res = await academyApi.patch<{ artifact: AcademyArtifact }>(`/artifacts/${id}`, data);
      const updated = res.artifact;
      set((state) => ({
        activeArtifact: state.activeArtifact?.id === id ? updated : state.activeArtifact,
        artifacts: state.artifacts.map((a) => (a.id === id ? updated : a)),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update artifact' });
    }
  },

  async loadVersions(artifactId) {
    try {
      const res = await academyApi.get<{ versions: ArtifactVersion[] }>(`/artifacts/${artifactId}/versions`);
      set({ versions: res.versions || [] });
    } catch {
      set({ versions: [] });
    }
  },

  async restoreVersion(artifactId, versionId) {
    set({ error: null });
    try {
      const res = await academyApi.post<{ artifact: AcademyArtifact }>(
        `/artifacts/${artifactId}/versions/${versionId}/restore`,
      );
      set({ activeArtifact: res.artifact });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to restore version' });
    }
  },
}));
