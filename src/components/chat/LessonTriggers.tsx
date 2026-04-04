'use client';

import { useMemo } from 'react';
import { Lightbulb } from 'lucide-react';
import { useInteractionStore } from '@/stores/interaction';
import { useLessonStore } from '@/stores/lesson';
import { cn } from '@/lib/utils';

interface ChatTrigger {
  label: string;
  prompt: string;
  tool_hint?: string;
}

export function LessonTriggers() {
  const activeBlockId = useInteractionStore((s) => s.activeBlockId);
  const triggerPrompt = useInteractionStore((s) => s.triggerPrompt);
  const currentLesson = useLessonStore((s) => s.currentLesson);

  const triggers = useMemo<ChatTrigger[]>(() => {
    if (!activeBlockId || !currentLesson?.content_blocks) return [];

    // activeBlockId format: "type-index" e.g. "markdown-3"
    const dashIdx = activeBlockId.lastIndexOf('-');
    if (dashIdx === -1) return [];
    const blockIndex = parseInt(activeBlockId.slice(dashIdx + 1), 10);
    if (isNaN(blockIndex) || blockIndex < 0 || blockIndex >= currentLesson.content_blocks.length) return [];

    const block = currentLesson.content_blocks[blockIndex];
    const chatTriggers = (block.metadata as { chat_triggers?: ChatTrigger[] })?.chat_triggers;
    return chatTriggers || [];
  }, [activeBlockId, currentLesson]);

  if (triggers.length === 0) return null;

  return (
    <div className="border-t border-gray-100 bg-gray-50/50 px-3 py-2">
      <div className="flex flex-wrap gap-1.5">
        {triggers.map((trigger, i) => (
          <button
            key={i}
            type="button"
            onClick={() => triggerPrompt(trigger.prompt, undefined, 'lesson_trigger')}
            className={cn(
              'flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-2.5 py-1',
              'text-[11px] font-medium text-indigo-700',
              'transition-all hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-sm',
              'animate-in fade-in slide-in-from-bottom-1 duration-300',
            )}
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <Lightbulb className="h-3 w-3 text-indigo-400" />
            {trigger.label}
          </button>
        ))}
      </div>
    </div>
  );
}
