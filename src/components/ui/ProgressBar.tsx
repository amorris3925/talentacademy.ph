import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
} as const;

interface ProgressBarProps {
  value: number;
  color?: string;
  size?: keyof typeof sizeClasses;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  color = 'bg-indigo-600',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress"
        className={cn(
          'w-full overflow-hidden rounded-full bg-gray-200',
          sizeClasses[size],
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs font-medium text-gray-600">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
