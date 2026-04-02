'use client';

interface ImageBlockProps {
  content: string;
  metadata: { caption?: string; alt?: string };
}

export function ImageBlock({ content, metadata }: ImageBlockProps) {
  return (
    <figure className="overflow-hidden rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={content}
        alt={metadata.alt || metadata.caption || 'Lesson image'}
        className="w-full rounded-lg object-cover"
        loading="lazy"
      />
      {metadata.caption && (
        <figcaption className="mt-2 text-center text-sm text-gray-500">
          {metadata.caption}
        </figcaption>
      )}
    </figure>
  );
}
