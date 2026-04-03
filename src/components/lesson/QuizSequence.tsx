'use client';

import { useState, useCallback } from 'react';
import { QuizBlock } from './QuizBlock';
import { useLessonStore } from '@/stores/lesson';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface QuizData {
  content: string;
  metadata: {
    options: string[];
    correct_index: number;
    explanation: string;
  };
}

interface QuizSequenceProps {
  quizzes: QuizData[];
  onContinue?: () => void;
}

export function QuizSequence({ quizzes, onContinue }: QuizSequenceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const { markComplete, addCompletedQuiz } = useLessonStore();

  const total = quizzes.length;
  const isLast = currentIndex === total - 1;

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

  const handleCorrectAnswer = useCallback(() => {
    addCompletedQuiz(currentIndex);

    if (isLast) {
      // All quizzes done — mark lesson complete (triggers overlay via store)
      fireConfetti();
      setTimeout(() => markComplete(), 500);
    } else {
      // Transition to next quiz
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setTransitioning(false);
      }, 400);
    }
  }, [currentIndex, isLast, markComplete, addCompletedQuiz, fireConfetti]);

  const quiz = quizzes[currentIndex];

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">
          Question {currentIndex + 1} of {total}
        </p>
        <div className="flex items-center gap-1.5">
          {quizzes.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 w-2 rounded-full transition-colors duration-300',
                i < currentIndex
                  ? 'bg-green-500'
                  : i === currentIndex
                    ? 'bg-indigo-500'
                    : 'bg-gray-300',
              )}
            />
          ))}
        </div>
      </div>

      {/* Current quiz with transition */}
      <div
        className={cn(
          'transition-all duration-300',
          transitioning ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0',
        )}
      >
        <QuizBlock
          key={`quiz-seq-${currentIndex}`}
          content={quiz.content}
          metadata={quiz.metadata}
          onContinue={onContinue}
          onCorrectAnswer={handleCorrectAnswer}
          isSequential
        />
      </div>
    </div>
  );
}
