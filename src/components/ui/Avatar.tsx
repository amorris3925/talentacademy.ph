'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const;

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function Avatar({
  src,
  alt = '',
  fallback = '?',
  size = 'md',
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 font-medium text-gray-600',
        sizeClasses[size],
        className,
      )}
      role="img"
      aria-label={alt || fallback}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{fallback}</span>
      )}
    </div>
  );
}
