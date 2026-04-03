'use client';

import { create } from 'zustand';
import { academyApi } from '@/lib/api';
import { useInteractionStore } from '@/stores/interaction';
import type { AcademyChatMessage, ContentBlock } from '@/types';

interface LessonContextData {
  lessonId: string;
  lessonTitle: string;
  lessonDescription?: string;
  contentSummary?: string;
}

interface ChatState {
  messages: AcademyChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  lessonContext: LessonContextData | null;

  sendMessage: (content: string) => Promise<void>;
  sendFromInteraction: () => Promise<void>;
  loadHistory: (lessonId?: string) => Promise<void>;
  clearHistory: () => void;
  setLessonContext: (ctx: LessonContextData | null) => void;
}

/**
 * Build a concise text summary of lesson content blocks for the AI tutor.
 * Keeps it compact so it doesn't blow up token usage.
 */
function summarizeContentBlocks(blocks: ContentBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  const parts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'markdown':
        parts.push(block.content);
        break;
      case 'quiz': {
        const meta = block.metadata as {
          options?: string[];
          correct_index?: number;
          explanation?: string;
        };
        parts.push(`[Quiz] ${block.content}`);
        if (meta.options) {
          meta.options.forEach((opt, i) => {
            const marker = i === meta.correct_index ? '(correct)' : '';
            parts.push(`  ${String.fromCharCode(65 + i)}. ${opt} ${marker}`);
          });
        }
        if (meta.explanation) {
          parts.push(`  Explanation: ${meta.explanation}`);
        }
        break;
      }
      case 'callout': {
        const calloutType = (block.metadata as { type?: string }).type || 'info';
        parts.push(`[${calloutType}] ${block.content}`);
        break;
      }
      case 'exercise':
        parts.push(`[Exercise] ${block.content}`);
        break;
      case 'code':
        parts.push(`[Code] ${block.content.slice(0, 200)}`);
        break;
      default:
        if (block.content) {
          parts.push(block.content.slice(0, 150));
        }
        break;
    }
  }

  return parts.join('\n');
}

let streamAbortController: AbortController | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingContent: '',
  lessonContext: null,

  async sendMessage(content: string) {
    if (get().isStreaming) return;
    streamAbortController?.abort();
    streamAbortController = new AbortController();
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
    let rafId: number | null = null;
    let pendingContent = '';

    try {
      await academyApi.stream(
        '/chat',
        {
          message: content,
          lesson_id: lessonContext?.lessonId ?? null,
          lesson_context: lessonContext?.contentSummary ?? null,
          lesson_title: lessonContext?.lessonTitle ?? null,
          lesson_description: lessonContext?.lessonDescription ?? null,
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
            }
          } catch {
            // Plain text chunk
            accumulated += chunk;
          }
          pendingContent = accumulated;
          if (!rafId) {
            rafId = requestAnimationFrame(() => {
              set({ streamingContent: pendingContent });
              rafId = null;
            });
          }
        },
        streamAbortController.signal,
      );

      // Flush any pending RAF update
      if (rafId) cancelAnimationFrame(rafId);
      set({ streamingContent: accumulated });

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
      // Flush any pending RAF update
      if (rafId) cancelAnimationFrame(rafId);

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
    } finally {
      streamAbortController = null;
    }
  },

  async sendFromInteraction() {
    const { pendingPrompt, clearPendingPrompt } = useInteractionStore.getState()
    if (!pendingPrompt) return
    clearPendingPrompt()
    // Call the existing sendMessage logic with the prompt
    await get().sendMessage(pendingPrompt)
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async loadHistory(_lessonId?: string) {
    // No chat history endpoint exists — start fresh each session
    set({ messages: [] });
  },

  clearHistory() {
    streamAbortController?.abort();
    streamAbortController = null;
    set({ messages: [], streamingContent: '' });
  },

  setLessonContext(ctx) {
    set({ lessonContext: ctx });
  },
}));

// Export helper so lesson page can build context
export { summarizeContentBlocks };
