'use client';

import { create } from 'zustand';
import { academyApi } from '@/lib/api';
import { analytics } from '@/lib/analytics';
import { useInteractionStore } from '@/stores/interaction';
import type {
  AcademyChatMessage,
  ChatImage,
  ChatMessageSource,
  ContentBlock,
  PersistedChatMessage,
  ToolCallEvent,
  AcademyStructuredBlock,
} from '@/types';

interface LessonContextData {
  lessonId: string;
  lessonTitle: string;
  lessonDescription?: string;
  contentSummary?: string;
  availableTools?: string[];
  trackSlug?: string;
}

interface ChatState {
  messages: AcademyChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  lessonContext: LessonContextData | null;
  imageCreationEnabled: boolean;

  sendMessage: (content: string, images?: File[], source?: ChatMessageSource) => Promise<void>;
  sendFromInteraction: () => Promise<void>;
  loadHistory: (lessonId?: string) => Promise<void>;
  clearHistory: () => void;
  setLessonContext: (ctx: LessonContextData | null) => void;
  setImageCreationEnabled: (enabled: boolean) => void;
}

/**
 * Resize an image file to fit within maxDim and return as a JPEG data URL.
 * This prevents 413 errors when sending large images as base64 in the JSON body.
 */
function resizeImage(file: File, maxDim = 1024, quality = 0.8): Promise<{ data: string; media_type: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      // Strip the data:image/jpeg;base64, prefix
      const base64 = dataUrl.split(',')[1];
      resolve({ data: base64, media_type: 'image/jpeg' });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for resizing'));
    };
    img.src = url;
  });
}

/**
 * Convert File objects to base64-encoded ChatImage payloads.
 * Images are resized client-side to prevent request body size limits.
 */
async function filesToChatImages(files: File[]): Promise<ChatImage[]> {
  return Promise.all(files.map((file) => resizeImage(file)));
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

/**
 * Send images to Gemini for vision description, returning text that Henry can understand.
 * Falls back gracefully if Gemini is unavailable.
 */
async function describeImagesViaGemini(
  images: ChatImage[],
  context?: string,
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/describe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images, context }),
    });
    if (!res.ok) return '[Image attached but could not be analyzed]';
    const { descriptions } = await res.json();
    return (descriptions as string[])
      .map((d: string, i: number) => `[User attached image ${i + 1}: ${d}]`)
      .join('\n');
  } catch {
    return '[Image attached but could not be analyzed]';
  }
}

/**
 * Request Gemini to generate an image from a prompt.
 * Returns a data URL on success or null on failure.
 */
async function generateImageViaGemini(
  prompt: string,
  style?: string,
): Promise<{ url: string } | null> {
  try {
    const res = await fetch('/api/gemini/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.base64 && data.media_type) {
      return { url: `data:${data.media_type};base64,${data.base64}` };
    }
    if (data.url) return { url: data.url };
    return null;
  } catch {
    return null;
  }
}

let streamAbortController: AbortController | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingContent: '',
  lessonContext: null,
  imageCreationEnabled: false,

  async sendMessage(content: string, images?: File[], source: ChatMessageSource = 'typed') {
    if (get().isStreaming) return;
    streamAbortController?.abort();
    streamAbortController = new AbortController();
    const { messages, lessonContext, imageCreationEnabled } = get();

    // Convert images to base64 payloads
    const imagePayloads = images && images.length > 0
      ? await filesToChatImages(images)
      : undefined;

    // Add user message optimistically (with image previews)
    const userMsg: AcademyChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: '',
      role: 'user',
      content,
      created_at: new Date().toISOString(),
      images: imagePayloads,
      is_image_request: imageCreationEnabled,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      streamingContent: '',
    }));

    // Describe images via Gemini so Henry receives text descriptions instead of raw images
    let enrichedContent = content;
    if (imagePayloads && imagePayloads.length > 0) {
      const imageDescriptions = await describeImagesViaGemini(
        imagePayloads,
        lessonContext?.lessonTitle,
      );
      enrichedContent = imageDescriptions + '\n\n' + content;
    }

    // Persist user message to analytics
    const persistedId = await analytics.trackChatMessage(
      lessonContext?.lessonId ?? null,
      'user',
      content,
      source,
    );
    if (persistedId) {
      userMsg.id = persistedId;
    }

    let accumulated = '';
    let rafId: number | null = null;
    let pendingContent = '';
    const toolCalls: ToolCallEvent[] = [];
    const structuredBlocks: AcademyStructuredBlock[] = [];

    try {
      await academyApi.stream(
        '/chat',
        {
          message: enrichedContent,
          lesson_id: lessonContext?.lessonId ?? null,
          lesson_context: lessonContext?.contentSummary ?? null,
          lesson_title: lessonContext?.lessonTitle ?? null,
          lesson_description: lessonContext?.lessonDescription ?? null,
          image_creation_enabled: imageCreationEnabled,
          available_tools: lessonContext?.availableTools ?? [],
          track_slug: lessonContext?.trackSlug ?? null,
          // Images are described as text by Gemini — no need to send raw images to Henry
          images: undefined,
          history: messages.slice(-20).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
        (chunk: string) => {
          try {
            const parsed = JSON.parse(chunk);

            // Handle structured event types from the tool-aware backend
            if (parsed.type === 'tool_call') {
              toolCalls.push({
                tool_call_id: parsed.tool_call_id,
                tool_name: parsed.tool_name,
                tool_input: parsed.tool_input || {},
                status: 'running',
              });
              // Force UI update for tool call indicator
              set({ streamingContent: accumulated });

              // Intercept generate_image tool calls — route to Gemini instead of Henry
              if (parsed.tool_name === 'generate_image') {
                const input = parsed.tool_input || {};
                generateImageViaGemini(
                  input.prompt as string || content,
                  input.style as string | undefined,
                ).then((result) => {
                  const tc = toolCalls.find((t) => t.tool_call_id === parsed.tool_call_id);
                  if (tc) {
                    tc.status = result ? 'done' : 'error';
                    tc.result_preview = result ? 'Image generated' : 'Generation failed';
                  }
                  if (result) {
                    structuredBlocks.push({ type: 'image', url: result.url, alt: (input.prompt as string) || 'Generated image' });
                  }
                  set({ streamingContent: accumulated });
                });
              }
              return;
            }

            if (parsed.type === 'tool_result') {
              const tc = toolCalls.find((t) => t.tool_call_id === parsed.tool_call_id);
              if (tc) {
                tc.status = parsed.success ? 'done' : 'error';
                tc.result_preview = parsed.result_preview;
                tc.duration_ms = parsed.duration_ms;
              }
              set({ streamingContent: accumulated });
              return;
            }

            if (parsed.type === 'structured_content' && parsed.block) {
              structuredBlocks.push(parsed.block as AcademyStructuredBlock);
              set({ streamingContent: accumulated });
              return;
            }

            // Default: accumulate text content
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
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
        structured_blocks: structuredBlocks.length > 0 ? structuredBlocks : undefined,
      };

      // Persist assistant message to analytics
      const assistantPersistedId = await analytics.trackChatMessage(
        lessonContext?.lessonId ?? null,
        'assistant',
        accumulated,
        source,
      );
      if (assistantPersistedId) {
        assistantMsg.id = assistantPersistedId;
      }

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        isStreaming: false,
        streamingContent: '',
      }));
    } catch (err) {
      // Flush any pending RAF update
      if (rafId) cancelAnimationFrame(rafId);

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const isNetworkError = errorMessage === 'Failed to fetch' || errorMessage.includes('network')
        || errorMessage.includes('abort') || errorMessage.includes('timeout');

      if (isNetworkError && lessonContext?.lessonId) {
        // Likely a deployment or network interruption — try to recover from DB
        set({ streamingContent: '', isStreaming: false });

        // Attempt to reconnect and reload history from Supabase
        for (let attempt = 0; attempt < 3; attempt++) {
          await new Promise((r) => setTimeout(r, (attempt + 1) * 3000));
          try {
            await get().loadHistory(lessonContext.lessonId);
            return; // Success — history restored from DB
          } catch {
            // Retry
          }
        }

        // All retries failed
        set((state) => ({
          messages: [...state.messages, {
            id: `temp-${Date.now()}-reconnect-fail`,
            session_id: '',
            role: 'assistant',
            content: 'Connection lost. Your messages are saved — please refresh the page to continue.',
            created_at: new Date().toISOString(),
          }],
        }));
      } else {
        // Non-network error
        set((state) => ({
          messages: [...state.messages, {
            id: `temp-${Date.now()}-error`,
            session_id: '',
            role: 'assistant',
            content: `Sorry, something went wrong: ${errorMessage}`,
            created_at: new Date().toISOString(),
          }],
        }));
      }
    } finally {
      streamAbortController = null;
      set({ isStreaming: false, streamingContent: '' });
    }
  },

  async sendFromInteraction() {
    const { pendingPrompt, pendingPromptSource, clearPendingPrompt } = useInteractionStore.getState()
    if (!pendingPrompt) return
    const source = pendingPromptSource ?? 'typed'
    clearPendingPrompt()
    // Call the existing sendMessage logic with the prompt and source
    await get().sendMessage(pendingPrompt, undefined, source)
  },

  async loadHistory(lessonId?: string) {
    if (!lessonId) {
      set({ messages: [] });
      return;
    }

    try {
      const res = await academyApi.get<{ messages: PersistedChatMessage[] }>(
        '/chat/history',
        { lesson_id: lessonId },
      );

      if (res.messages && res.messages.length > 0) {
        const messages: AcademyChatMessage[] = res.messages.map((m) => ({
          id: m.id,
          session_id: m.session_id,
          role: m.role,
          content: m.content,
          created_at: m.created_at,
        }));
        set({ messages });
      } else {
        set({ messages: [] });
      }
    } catch {
      // Chat history endpoint not available yet — start fresh
      set({ messages: [] });
    }
  },

  clearHistory() {
    streamAbortController?.abort();
    streamAbortController = null;
    set({ messages: [], streamingContent: '' });
  },

  setLessonContext(ctx) {
    // Auto-enable image creation if the lesson has generate_image in its tools
    const autoEnableImage = ctx?.availableTools?.includes('generate_image') ?? false;
    set({
      lessonContext: ctx,
      imageCreationEnabled: autoEnableImage,
    });
  },

  setImageCreationEnabled(enabled) {
    set({ imageCreationEnabled: enabled });
  },
}));

// Cache image descriptions to avoid re-describing on every lesson load
const imageDescriptionCache = new Map<string, string>();

/**
 * Async version of summarizeContentBlocks that uses Gemini to describe lesson images.
 * Falls back to the sync version if Gemini is unavailable.
 */
async function summarizeContentBlocksWithVision(blocks: ContentBlock[]): Promise<string> {
  if (!blocks || blocks.length === 0) return '';

  // Collect image blocks that need descriptions
  const imageBlocks = blocks
    .map((b, i) => ({ block: b, index: i }))
    .filter(({ block }) => block.type === 'image' && block.content);

  // If no images, use the sync version
  if (imageBlocks.length === 0) return summarizeContentBlocks(blocks);

  // Check cache and identify which images need describing
  const uncached = imageBlocks.filter(({ block }) => !imageDescriptionCache.has(block.content));

  if (uncached.length > 0) {
    try {
      const res = await fetch('/api/gemini/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: uncached.map(({ block }) => ({ url: block.content })),
          context: 'lesson content image',
        }),
      });
      if (res.ok) {
        const { descriptions } = await res.json();
        uncached.forEach(({ block }, i) => {
          imageDescriptionCache.set(block.content, (descriptions as string[])[i] || block.content);
        });
      }
    } catch {
      // Fall through — use URL as fallback
    }
  }

  // Build summary with image descriptions replacing URLs
  const parts: string[] = [];
  for (const block of blocks) {
    if (block.type === 'image') {
      const desc = imageDescriptionCache.get(block.content);
      const caption = (block.metadata as { caption?: string })?.caption;
      parts.push(`[Lesson Image${caption ? `: ${caption}` : ''}: ${desc || block.content}]`);
    } else {
      // Use the same logic as summarizeContentBlocks for non-image blocks
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
  }

  return parts.join('\n');
}

// Export helpers so lesson page can build context
export { summarizeContentBlocks, summarizeContentBlocksWithVision };
