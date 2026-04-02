'use client';

import { Info, AlertTriangle, Lightbulb, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const config = calloutConfig[type];
  const Icon = config.icon;

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
        <div>
          <p className="mb-1 text-sm font-semibold text-gray-900">
            {config.title}
          </p>
          <p className="text-sm text-gray-700">{content}</p>
        </div>
      </div>
    </div>
  );
}
