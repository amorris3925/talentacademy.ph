'use client';

import { useState, useEffect, useRef } from 'react';
import { GENERATION_TIMING } from '@/lib/generation-config';
import type { GenerationType } from '@/types';

interface SimulatedProgressState {
  progress: number;
  elapsedMs: number;
  isComplete: boolean;
}

export function useSimulatedProgress(
  type: GenerationType,
  isActive: boolean,
  isComplete: boolean,
): SimulatedProgressState {
  const [state, setState] = useState<SimulatedProgressState>({
    progress: 0,
    elapsedMs: 0,
    isComplete: false,
  });
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(undefined);

  const config = GENERATION_TIMING[type];

  useEffect(() => {
    if (isComplete) {
      setState((prev) => ({ ...prev, progress: 100, isComplete: true }));
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    if (!isActive) {
      setState({ progress: 0, elapsedMs: 0, isComplete: false });
      startTimeRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current!;
      const progress = config.maxProgress * (1 - Math.exp(-elapsed / config.tau));
      setState({ progress, elapsedMs: elapsed, isComplete: false });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, isComplete, config]);

  return state;
}
