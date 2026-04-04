'use client';

import { Info, AlertTriangle, Lightbulb, AlertOctagon, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInteractionStore } from '@/stores/interaction';
import { useLessonStore } from '@/stores/lesson';

type CalloutType = 'info' | 'warning' | 'tip' | 'danger';

interface CalloutBlockProps {
  content: string;
  metadata: { type?: CalloutType };
}

const calloutConfig: Record<
  CalloutType,
  { icon: typeof Info; bg: string; border: string; iconColor: string; title: string }
> = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-l-blue-500',
    iconColor: 'text-blue-500',
    title: 'Info',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-l-amber-500',
    iconColor: 'text-amber-500',
    title: 'Warning',
  },
  tip: {
    icon: Lightbulb,
    bg: 'bg-green-50',
    border: 'border-l-green-500',
    iconColor: 'text-green-500',
    title: 'Tip',
  },
  danger: {
    icon: AlertOctagon,
    bg: 'bg-red-50',
    border: 'border-l-red-500',
    iconColor: 'text-red-500',
    title: 'Danger',
  },
};

export function CalloutBlock({ content, metadata }: CalloutBlockProps) {
  const type = metadata.type || 'info';
  const config = calloutConfig[type] ?? calloutConfig.info;
  const Icon = config.icon;
  const triggerPrompt = useInteractionStore((s) => s.triggerPrompt);
  const setActiveTab = useLessonStore((s) => s.setActiveTab);

  const handleTryInChat = () => {
    triggerPrompt(content, undefined, 'content_prompt');
    setActiveTab('chat');
  };

  return (
    <div
      className={cn(
        'rounded-r-lg border-l-4 p-4',
        config.bg,
        config.border,
      )}
      role="note"
    >
      <div className="flex gap-3">
        <Icon
          className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconColor)}
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className="mb-1 text-sm font-semibold text-gray-900">
            {config.title}
          </p>
          <p className="text-sm text-gray-700">{content}</p>
          {type === 'tip' && (
            <button
              type="button"
              onClick={handleTryInChat}
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700 transition-all hover:bg-green-100 hover:text-green-800 opacity-70 hover:opacity-100 cursor-pointer"
            >
              <MessageSquare className="h-3 w-3" />
              Ask AI about this
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
