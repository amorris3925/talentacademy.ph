'use client';

import { useState, useEffect, useRef } from 'react';
import { Lightbulb } from 'lucide-react';
import { ProgressBar } from '@/components/ui';
import { useSimulatedProgress } from '@/hooks/useSimulatedProgress';
import { getStageLabel, GENERATION_TIPS } from '@/lib/generation-config';
import type { GenerationType } from '@/types';

interface GenerationProgressBarProps {
  type: GenerationType;
  status: 'pending' | 'processing';
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s elapsed`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s elapsed`;
}

export function GenerationProgressBar({ type, status }: GenerationProgressBarProps) {
  const isActive = status === 'pending' || status === 'processing';
  const { progress, elapsedMs } = useSimulatedProgress(type, isActive, false);

  const tips = GENERATION_TIPS[type];
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (tips.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setTipVisible(false);
      setTimeout(() => {
        setTipIndex((prev) => (prev + 1) % tips.length);
        setTipVisible(true);
      }, 300);
    }, 6000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tips]);

  const stageLabel = getStageLabel(type, progress);

  return (
    <div className="space-y-4">
      {/* Stage label */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 transition-opacity duration-300">
          {stageLabel}
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <ProgressBar
          value={progress}
          color="bg-gradient-to-r from-indigo-500 to-purple-500"
          size="md"
          showLabel
        />
        <p className="text-center text-xs text-gray-400">
          {formatElapsed(elapsedMs)}
        </p>
      </div>

      {/* Shimmer animation overlay */}
      <div className="relative h-1 overflow-hidden rounded-full">
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
      </div>

      {/* Rotating tip */}
      {tips.length > 0 && (
        <div
          className="flex items-start gap-2 rounded-lg bg-indigo-50 px-3 py-2.5 transition-opacity duration-300"
          style={{ opacity: tipVisible ? 1 : 0 }}
        >
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
          <p className="text-xs text-indigo-700">{tips[tipIndex]}</p>
        </div>
      )}
    </div>
  );
}
