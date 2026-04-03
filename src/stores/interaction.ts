'use client'
import { create } from 'zustand'
import { analytics } from '@/lib/analytics'
import type { ChatMessageSource } from '@/types'

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
  pendingPromptSource: ChatMessageSource | null

  // Checkpoint tracking
  completedCheckpoints: string[]

  // Hint usage tracking
  hintUsage: Record<string, number> // blockId -> hints revealed count

  // Actions
  setActiveBlock: (id: string | null, type?: string | null) => void
  setSelectedText: (text: string | null, rect?: { top: number; left: number; bottom: number } | null) => void
  triggerPrompt: (text: string, context?: string, source?: ChatMessageSource) => void
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
  pendingPromptSource: null,
  completedCheckpoints: [],
  hintUsage: {},

  setActiveBlock: (id, type = null) => set({ activeBlockId: id, activeBlockType: type }),

  setSelectedText: (text, rect = null) => set({ selectedText: text, selectedRect: rect }),

  triggerPrompt: (text, context, source) => set({
    pendingPrompt: text,
    pendingPromptContext: context ?? null,
    pendingPromptSource: source ?? 'typed',
  }),

  clearPendingPrompt: () => set({ pendingPrompt: null, pendingPromptContext: null, pendingPromptSource: null }),

  completeCheckpoint: (id) => {
    const state = get()
    if (state.completedCheckpoints.includes(id)) return state
    set({ completedCheckpoints: [...state.completedCheckpoints, id] })
    analytics.trackEvent('checkpoint_complete', undefined, { checkpoint_id: id })
  },

  revealHint: (blockId) => {
    const current = get().hintUsage[blockId] || 0
    const next = current + 1
    set((state) => ({ hintUsage: { ...state.hintUsage, [blockId]: next } }))
    analytics.trackEvent('hint_reveal', undefined, { block_id: blockId, hint_level: next })
    return next
  },

  reset: () => set({
    activeBlockId: null,
    activeBlockType: null,
    selectedText: null,
    selectedRect: null,
    pendingPrompt: null,
    pendingPromptContext: null,
    pendingPromptSource: null,
    completedCheckpoints: [],
    hintUsage: {},
  }),
}))
