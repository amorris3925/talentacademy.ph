'use client'
import { create } from 'zustand'

interface InteractionState {
  // Active block tracking (IntersectionObserver)
  activeBlockId: string | null
  activeBlockType: string | null

  // Text selection (Highlight-to-Ask)
  selectedText: string | null
  selectedRect: { top: number; left: number; bottom: number } | null

  // Pending prompt (queued to send to chat)
  pendingPrompt: string | null
  pendingPromptContext: string | null

  // Checkpoint tracking
  completedCheckpoints: Set<string>

  // Hint usage tracking
  hintUsage: Record<string, number> // blockId -> hints revealed count

  // Actions
  setActiveBlock: (id: string | null, type?: string | null) => void
  setSelectedText: (text: string | null, rect?: { top: number; left: number; bottom: number } | null) => void
  triggerPrompt: (text: string, context?: string) => void
  clearPendingPrompt: () => void
  completeCheckpoint: (id: string) => void
  revealHint: (blockId: string) => number // returns new hint level
  reset: () => void
}

export const useInteractionStore = create<InteractionState>((set, get) => ({
  activeBlockId: null,
  activeBlockType: null,
  selectedText: null,
  selectedRect: null,
  pendingPrompt: null,
  pendingPromptContext: null,
  completedCheckpoints: new Set(),
  hintUsage: {},

  setActiveBlock: (id, type = null) => set({ activeBlockId: id, activeBlockType: type }),

  setSelectedText: (text, rect = null) => set({ selectedText: text, selectedRect: rect }),

  triggerPrompt: (text, context) => set({ pendingPrompt: text, pendingPromptContext: context ?? null }),

  clearPendingPrompt: () => set({ pendingPrompt: null, pendingPromptContext: null }),

  completeCheckpoint: (id) => set((state) => {
    const newSet = new Set(state.completedCheckpoints)
    newSet.add(id)
    return { completedCheckpoints: newSet }
  }),

  revealHint: (blockId) => {
    const current = get().hintUsage[blockId] || 0
    const next = current + 1
    set((state) => ({ hintUsage: { ...state.hintUsage, [blockId]: next } }))
    return next
  },

  reset: () => set({
    activeBlockId: null,
    activeBlockType: null,
    selectedText: null,
    selectedRect: null,
    pendingPrompt: null,
    pendingPromptContext: null,
    completedCheckpoints: new Set(),
    hintUsage: {},
  }),
}))
