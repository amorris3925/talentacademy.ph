'use client';

import { create } from 'zustand';
import { academyApi } from '@/lib/api';
import type { AcademyChatMessage } from '@/types';

interface ChatState {
  messages: AcademyChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  lessonContext: { lessonId: string; lessonTitle: string } | null;

  sendMessage: (content: string) => Promise<void>;
  loadHistory: (lessonId?: string) => Promise<void>;
  clearHistory: () => void;
  setLessonContext: (ctx: { lessonId: string; lessonTitle: string } | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingContent: '',
  lessonContext: null,

  async sendMessage(content: string) {
    const { messages, lessonContext } = get();

    // Add user message optimistically
    const userMsg: AcademyChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: '',
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      streamingContent: '',
    }));

    let accumulated = '';

    try {
      await academyApi.stream(
        '/chat',
        {
          message: content,
          lesson_id: lessonContext?.lessonId ?? null,
          history: messages.slice(-20).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
        (chunk: string) => {
          try {
            const parsed = JSON.parse(chunk);
            if (parsed.content) {
              accumulated += parsed.content;
              set({ streamingContent: accumulated });
            }
          } catch {
            // Plain text chunk
            accumulated += chunk;
            set({ streamingContent: accumulated });
          }
        },
      );

      // Streaming complete — push assistant message
      const assistantMsg: AcademyChatMessage = {
        id: `temp-${Date.now()}-assistant`,
        session_id: '',
        role: 'assistant',
        content: accumulated,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isStreaming: false,
        streamingContent: '',
      }));
    } catch (err) {
      // On error, add an error message from assistant
      const errorMsg: AcademyChatMessage = {
        id: `temp-${Date.now()}-error`,
        session_id: '',
        role: 'assistant',
        content: `Sorry, something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}`,
        created_at: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, errorMsg],
        isStreaming: false,
        streamingContent: '',
      }));
    }
  },

  async loadHistory(_lessonId?: string) {
    // No chat history endpoint exists — start fresh each session
    set({ messages: [] });
  },

  clearHistory() {
    set({ messages: [], streamingContent: '' });
  },

  setLessonContext(ctx) {
    set({ lessonContext: ctx });
  },
}));
