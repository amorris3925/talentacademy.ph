import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatXp(xp: number): string {
  return `${xp.toLocaleString()} XP`;
}

export function formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatDuration(seconds: number): string {
  const secs = Math.floor(seconds);
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'text-green-500',
  intermediate: 'text-blue-500',
  advanced: 'text-purple-500',
  expert: 'text-amber-500',
  master: 'text-red-500',
};

export function getLevelColor(level: string): string {
  return LEVEL_COLORS[level.toLowerCase()] ?? 'text-gray-500';
}

const STATUS_COLORS: Record<string, string> = {
  not_started: 'text-gray-400',
  in_progress: 'text-blue-500',
  completed: 'text-green-500',
  pending: 'text-yellow-500',
  processing: 'text-blue-400',
  failed: 'text-red-500',
  active: 'text-green-500',
  paused: 'text-yellow-500',
  dropped: 'text-red-400',
};

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status.toLowerCase()] ?? 'text-gray-500';
}

export function truncate(str: string, len: number): string {
  if (!str) return '';
  if (str.length <= len) return str;
  return str.slice(0, len).trimEnd() + '...';
}
