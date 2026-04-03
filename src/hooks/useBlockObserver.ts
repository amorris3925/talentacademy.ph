'use client';

import { useEffect, useRef } from 'react';
import { useInteractionStore } from '@/stores/interaction';

/**
 * Observes content block elements and updates the interaction store
 * with the currently visible block type/id for contextual UI hints.
 */
export function useBlockObserver(containerRef: React.RefObject<HTMLElement | null>) {
  const setActiveBlock = useInteractionStore((s) => s.setActiveBlock);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the most visible entry
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
              bestEntry = entry;
            }
          }
        }

        if (bestEntry) {
          const el = bestEntry.target as HTMLElement;
          const blockId = el.dataset.blockId || null;
          const blockType = el.dataset.blockType || null;
          setActiveBlock(blockId, blockType);
        }
      },
      {
        root: container,
        threshold: [0.3, 0.5, 0.7],
      },
    );

    // Observe all block elements
    const blocks = container.querySelectorAll('[data-block-id]');
    blocks.forEach((block) => observerRef.current?.observe(block));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [containerRef, setActiveBlock]);
}
