'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, Send, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useInteractionStore } from '@/stores/interaction';
import { useLessonStore } from '@/stores/lesson';
import { useChatStore } from '@/stores/chat';

interface QuizBlockProps {
  content: string;
  metadata: {
    options: string[];
    correct_index: number;
    explanation: string;
  };
  onContinue?: () => void;
  /** Sequential quiz mode: called when user answers correctly */
  onCorrectAnswer?: () => void;
  /** Whether this quiz is part of a sequential sequence */
  isSequential?: boolean;
}

export function QuizBlock({ content, metadata, onContinue, onCorrectAnswer, isSequential }: QuizBlockProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [waitingForChat, setWaitingForChat] = useState(false);
  const triggerPrompt = useInteractionStore((s) => s.triggerPrompt);
  const { updateProgress, markComplete } = useLessonStore();
  const isStreaming = useChatStore((s) => s.isStreaming);
  const prevStreamingRef = useRef(false);

  const isCorrect = submitted && selectedIndex === metadata.correct_index;
  const canSubmit = selectedIndex !== null && reasoning.trim().length >= 5;

  const fireConfetti = useCallback(() => {
    const end = Date.now() + 2000;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#6366f1', '#818cf8', '#a5b4fc', '#f59e0b', '#10b981'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#6366f1', '#818cf8', '#a5b4fc', '#f59e0b', '#10b981'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  // Wait for chat streaming to finish, then show confetti + completion
  useEffect(() => {
    if (waitingForChat && prevStreamingRef.current && !isStreaming) {
      setWaitingForChat(false);
      fireConfetti();
      setTimeout(() => {
        if (isSequential && onCorrectAnswer) {
          onCorrectAnswer();
        } else {
          markComplete();
        }
      }, 500);
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, waitingForChat, fireConfetti, markComplete, isSequential, onCorrectAnswer]);

  const handleSubmit = () => {
    if (!canSubmit || selectedIndex === null) return;
    setSubmitted(true);

    const correct = selectedIndex === metadata.correct_index;
    const selectedAnswer = metadata.options[selectedIndex];
    const correctAnswer = metadata.options[metadata.correct_index];

    // Persist quiz answer + reasoning to backend
    updateProgress({
      submission_data: {
        quiz_question: content,
        selected_answer: selectedAnswer,
        correct_answer: correctAnswer,
        reasoning: reasoning.trim(),
        is_correct: correct,
      },
    });

    // Send answer + reasoning to chat for AI to respond
    if (correct) {
      triggerPrompt(
        `Quiz: "${content}"\nMy answer: "${selectedAnswer}" (correct)\nMy reasoning: "${reasoning.trim()}"\n\nBriefly confirm why this is right and reinforce the key concept.`,
      );

      // Wait for the chat response to finish before showing confetti
      setWaitingForChat(true);
    } else {
      triggerPrompt(
        `Quiz: "${content}"\nMy answer: "${selectedAnswer}" (wrong — correct answer is "${correctAnswer}")\nMy reasoning: "${reasoning.trim()}"\n\nHelp me understand why my reasoning was off and why "${correctAnswer}" is correct.`,
      );
    }
  };

  const handleReset = () => {
    setSelectedIndex(null);
    setReasoning('');
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
          {(Array.isArray(metadata.options) ? metadata.options : []).map((option, index) => {
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
                key={`option-${index}`}
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

        {/* Reasoning input — shown when an option is selected and not yet submitted */}
        {selectedIndex !== null && !submitted && (
          <div className="border-t border-gray-200 px-4 py-3">
            <label htmlFor="quiz-reasoning" className="mb-1.5 block text-sm font-medium text-gray-700">
              Why do you think this is the right answer?
            </label>
            <textarea
              id="quiz-reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Explain your thinking in a few words..."
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {reasoning.trim().length < 5
                  ? 'Write at least a few words to submit'
                  : 'Ready to submit!'}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                <Send className="h-3.5 w-3.5" />
                Submit Answer
              </Button>
            </div>
          </div>
        )}

        {/* After submission: try again (only if wrong) */}
        {submitted && !isCorrect && (
          <div className="border-t border-amber-200 bg-amber-50 px-4 py-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleReset}
              className="w-full animate-try-again bg-amber-500 hover:bg-amber-600"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

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
              {isCorrect ? 'Correct!' : 'Not quite — try again!'}
            </p>
            {isCorrect && (
              <p className="text-sm text-gray-700">{metadata.explanation}</p>
            )}
          </div>
        )}
      </div>
  );
}
