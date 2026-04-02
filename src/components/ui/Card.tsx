import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

const paddingClasses = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
} as const;

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: keyof typeof paddingClasses;
  hover?: boolean;
}

export function Card({
  children,
  className,
  padding = 'md',
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        paddingClasses[padding],
        hover && 'transition-shadow hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  );
}
