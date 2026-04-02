'use client';

interface VideoBlockProps {
  content: string;
  metadata: { title?: string };
}

function isEmbedUrl(url: string): boolean {
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.includes('loom.com')
  );
}

function toEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return url;
}

export function VideoBlock({ content, metadata }: VideoBlockProps) {
  if (isEmbedUrl(content)) {
    return (
      <div className="overflow-hidden rounded-lg">
        {metadata.title && (
          <p className="mb-2 text-sm font-medium text-gray-700">
            {metadata.title}
          </p>
        )}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={toEmbedUrl(content)}
            title={metadata.title || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full rounded-lg"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg">
      {metadata.title && (
        <p className="mb-2 text-sm font-medium text-gray-700">
          {metadata.title}
        </p>
      )}
      <video
        src={content}
        controls
        className="w-full rounded-lg"
        preload="metadata"
      >
        Your browser does not support the video element.
      </video>
    </div>
  );
}
