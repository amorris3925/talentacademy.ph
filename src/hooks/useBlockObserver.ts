'use client';

import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';
import { useInteractionStore } from '@/stores/interaction';

/**
 * Observes content block elements and updates the interaction store
 * with the currently visible block type/id for contextual UI hints.
 * Also tracks block view durations via the analytics service.
 */
export function useBlockObserver(
  containerRef: React.RefObject<HTMLElement | null>,
  lessonId?: string,
) {
  const setActiveBlock = useInteractionStore((s) => s.setActiveBlock);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const currentBlockRef = useRef<{ blockId: string; blockType: string; blockIndex: number } | null>(null);

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

          // Track block view timing
          if (lessonId && blockId) {
            const blockIndex = parseInt(blockId.split('-').pop() || '0', 10);

            // End timing for previous block
            if (currentBlockRef.current && currentBlockRef.current.blockId !== blockId) {
              analytics.trackBlockLeave(lessonId, currentBlockRef.current.blockIndex);
            }

            // Start timing for new block
            if (!currentBlockRef.current || currentBlockRef.current.blockId !== blockId) {
              currentBlockRef.current = { blockId, blockType: blockType || 'unknown', blockIndex };
              analytics.trackBlockView(lessonId, blockIndex, blockType || 'unknown');
            }
          }
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
      // Flush current block timer on unmount
      if (lessonId && currentBlockRef.current) {
        analytics.trackBlockLeave(lessonId, currentBlockRef.current.blockIndex);
        currentBlockRef.current = null;
      }
    };
  }, [containerRef, setActiveBlock, lessonId]);

  // Also flush all block timers when the lesson changes
  useEffect(() => {
    return () => {
      if (lessonId) {
        analytics.flushBlockTimers(lessonId);
      }
    };
  }, [lessonId]);
}
