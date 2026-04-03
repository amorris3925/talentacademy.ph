'use client';

import { useState } from 'react';

interface ImageBlockProps {
  content: string;
  metadata: { caption?: string; alt?: string };
}

export function ImageBlock({ content, metadata }: ImageBlockProps) {
  const [errored, setErrored] = useState(false);

  if (!content) return null;

  if (errored) {
    return (
      <figure className="overflow-hidden rounded-lg">
        <div className="flex h-48 w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
          Image unavailable
        </div>
        {metadata.caption && (
          <figcaption className="mt-2 text-center text-sm text-gray-500">
            {metadata.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className="overflow-hidden rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={content}
        alt={metadata.alt || metadata.caption || 'Lesson image'}
        className="w-full rounded-lg object-cover"
        loading="lazy"
        onError={() => setErrored(true)}
      />
      {metadata.caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-500">
          {metadata.caption}
        </figcaption>
      )}
    </figure>
  );
}
