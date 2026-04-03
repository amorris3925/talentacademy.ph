'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  key: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1 overflow-x-auto border-b border-gray-200',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.key)}
            data-key={tab.key}
            onKeyDown={(e) => {
              const idx = tabs.findIndex((t) => t.key === tab.key);
              let nextIdx = -1;
              if (e.key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
              if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
              if (nextIdx >= 0) {
                e.preventDefault();
                onChange(tabs[nextIdx].key);
                (document.querySelector(`[role="tab"][data-key="${tabs[nextIdx].key}"]`) as HTMLElement)?.focus();
              }
            }}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
              isActive
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
