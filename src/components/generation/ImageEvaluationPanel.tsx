'use client';

import { useState } from 'react';
import { Star, Sparkles, HelpCircle, Check, Send } from 'lucide-react';
import { Button } from '@/components/ui';
import { ImageEducationHints } from './ImageEducationHints';
import {
  getFollowUpQuestion,
  getRefinementSuggestions,
  getEducationalHints,
  type RefinementSuggestion,
} from '@/lib/image-evaluation-content';
import { academyApi } from '@/lib/api';
import type { AcademyGeneration, ImageGenParams } from '@/types';

interface ImageEvaluationPanelProps {
  generation: AcademyGeneration;
  originalPrompt: string;
  originalParams: ImageGenParams;
  onRefine: (newPrompt: string, newParams: ImageGenParams) => void;
  context: 'studio' | 'lesson';
}

export function ImageEvaluationPanel({
  generation,
  originalPrompt,
  originalParams,
  onRefine,
  context,
}: ImageEvaluationPanelProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [reflection, setReflection] = useState('');
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);
  const [clickedRefinements, setClickedRefinements] = useState<Set<string>>(new Set());
  const [showHints, setShowHints] = useState(false);

  const followUp = getFollowUpQuestion(
    originalPrompt,
    originalParams.style || 'realistic',
  );
  const refinements = getRefinementSuggestions(
    originalPrompt,
    originalParams.style || 'realistic',
    originalParams.width || 1024,
    originalParams.height || 1024,
  );
  const hints = getEducationalHints();

  const submitEvaluation = (data: Record<string, unknown>) => {
    academyApi
      .post(`/generate/${generation.id}/evaluate`, data)
      .catch(() => {}); // fire-and-forget
  };

  const handleRate = (value: number) => {
    setRating(value);
    submitEvaluation({ rating: value });
  };

  const handleReflectionSubmit = () => {
    if (!reflection.trim()) return;
    setReflectionSubmitted(true);
    submitEvaluation({ reflection: reflection.trim() });
  };

  const handleRefine = (suggestion: RefinementSuggestion) => {
    setClickedRefinements((prev) => new Set(prev).add(suggestion.id));
    const { prompt, params } = suggestion.modify(originalPrompt, originalParams);
    onRefine(prompt, params);
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
      {/* Rating */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-700">
          How well does this match your vision?
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => {
            const filled = value <= (hoveredStar ?? rating ?? 0);
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleRate(value)}
                onMouseEnter={() => setHoveredStar(value)}
                onMouseLeave={() => setHoveredStar(null)}
                className="transition-transform hover:scale-110"
                aria-label={`Rate ${value} out of 5`}
              >
                <Star
                  className={`h-6 w-6 ${
                    filled
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            );
          })}
          {rating && (
            <span className="ml-2 self-center text-xs text-gray-500">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      {/* Follow-up question */}
      {!reflectionSubmitted ? (
        <div className="space-y-1.5">
          <p className="text-sm text-gray-600">{followUp.question}</p>
          <div className="flex gap-2">
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder={followUp.placeholder}
              rows={2}
              className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleReflectionSubmit}
              disabled={!reflection.trim()}
              className="self-end"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-green-600">
          <Check className="mr-1 inline h-4 w-4" />
          Thanks for your reflection!
        </p>
      )}

      {/* Refinement chips */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Try a variation
        </p>
        <div className="flex flex-wrap gap-2">
          {refinements.map((suggestion) => {
            const clicked = clickedRefinements.has(suggestion.id);
            return (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleRefine(suggestion)}
                disabled={clicked}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  clicked
                    ? 'border-green-200 bg-green-50 text-green-600'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {clicked ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {suggestion.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* I'm not sure what to do */}
      {!showHints ? (
        <button
          type="button"
          onClick={() => setShowHints(true)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-indigo-600"
        >
          <HelpCircle className="h-4 w-4" />
          I&apos;m not sure what to do
        </button>
      ) : (
        <ImageEducationHints hints={hints} />
      )}
    </div>
  );
}
