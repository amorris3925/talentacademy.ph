'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface QuizBlockProps {
  content: string;
  metadata: {
    options: string[];
    correct_index: number;
    explanation: string;
  };
}

export function QuizBlock({ content, metadata }: QuizBlockProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selectedIndex === metadata.correct_index;

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedIndex(null);
    setSubmitted(false);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* Question */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm font-medium text-gray-900">Quiz</p>
        <p className="mt-1 text-sm text-gray-700">{content}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 p-4">
        {metadata.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption = index === metadata.correct_index;

          let optionStyle = 'border-gray-200 bg-white hover:bg-gray-50';
          if (submitted) {
            if (isCorrectOption) {
              optionStyle = 'border-green-500 bg-green-50';
            } else if (isSelected && !isCorrectOption) {
              optionStyle = 'border-red-500 bg-red-50';
            } else {
              optionStyle = 'border-gray-200 bg-gray-50 opacity-60';
            }
          } else if (isSelected) {
            optionStyle = 'border-indigo-500 bg-indigo-50';
          }

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (!submitted) setSelectedIndex(index);
              }}
              disabled={submitted}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                'disabled:cursor-default',
                optionStyle,
              )}
            >
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                  isSelected && !submitted
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : submitted && isCorrectOption
                      ? 'border-green-500 bg-green-500 text-white'
                      : submitted && isSelected && !isCorrectOption
                        ? 'border-red-500 bg-red-500 text-white'
                        : 'border-gray-300 text-gray-500',
                )}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-gray-800">{option}</span>
              {submitted && isCorrectOption && (
                <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-green-600" />
              )}
              {submitted && isSelected && !isCorrectOption && (
                <XCircle className="ml-auto h-5 w-5 shrink-0 text-red-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
        {!submitted ? (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={selectedIndex === null}
          >
            Check Answer
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={handleReset}>
            Try Again
          </Button>
        )}
      </div>

      {/* Explanation */}
      {submitted && (
        <div
          className={cn(
            'border-t p-4',
            isCorrect
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50',
          )}
        >
          <p
            className={cn(
              'mb-1 text-sm font-semibold',
              isCorrect ? 'text-green-800' : 'text-red-800',
            )}
          >
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </p>
          <p className="text-sm text-gray-700">{metadata.explanation}</p>
        </div>
      )}
    </div>
  );
}
