'use client';

import { useState } from 'react';
import { Play, Send, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { academyApi } from '@/lib/api';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ExerciseBlockProps {
  content: string;
  metadata: {
    language?: string;
    starter_code?: string;
    lesson_id?: string;
  };
}

interface SandboxResult {
  output: string;
  error?: string;
}

interface GradeResult {
  passed: boolean;
  score: number;
  feedback: string;
}

export function ExerciseBlock({ content, metadata }: ExerciseBlockProps) {
  const [code, setCode] = useState(metadata.starter_code || '');
  const [output, setOutput] = useState<string | null>(null);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    setGradeResult(null);
    try {
      const result = await academyApi.post<SandboxResult>('/sandbox', {
        code,
        language: metadata.language || 'python',
      });
      setOutput(result.error || result.output);
    } catch (err) {
      setOutput(
        `Error: ${err instanceof Error ? err.message : 'Failed to run code'}`,
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setGradeResult(null);
    try {
      const result = await academyApi.post<GradeResult>('/grade', {
        lesson_id: metadata.lesson_id,
        submission_data: { code, language: metadata.language || 'python' },
      });
      setGradeResult(result);
    } catch (err) {
      setGradeResult({
        passed: false,
        score: 0,
        feedback: err instanceof Error ? err.message : 'Grading failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCode(metadata.starter_code || '');
    setOutput(null);
    setGradeResult(null);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {/* Instructions */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm font-medium text-gray-900">Exercise</p>
        <p className="mt-1 text-sm text-gray-600">{content}</p>
      </div>

      {/* Code Editor */}
      <div className="relative">
        <div className="absolute right-2 top-2 rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
          {metadata.language || 'python'}
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full resize-y bg-gray-900 p-4 pt-8 font-mono text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          rows={12}
          spellCheck={false}
          placeholder="Write your code here..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 border-t border-gray-200 bg-gray-50 px-4 py-3">
        <Button
          variant="primary"
          size="sm"
          disabled
        >
          <Play className="h-3.5 w-3.5" />
          Run (Coming Soon)
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled
        >
          <Send className="h-3.5 w-3.5" />
          Submit (Coming Soon)
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* Output Panel */}
      {output !== null && (
        <div className="border-t border-gray-200 bg-gray-950 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Output
          </p>
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
            {output || '(no output)'}
          </pre>
        </div>
      )}

      {/* Grading Feedback */}
      {gradeResult && (
        <div
          className={cn(
            'border-t p-4',
            gradeResult.passed
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50',
          )}
        >
          <div className="flex items-start gap-2">
            {gradeResult.passed ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            <div>
              <p
                className={cn(
                  'text-sm font-semibold',
                  gradeResult.passed ? 'text-green-800' : 'text-red-800',
                )}
              >
                {gradeResult.passed ? 'Passed!' : 'Not quite right'}{' '}
                <span className="font-normal text-gray-600">
                  (Score: {gradeResult.score}%)
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-700">
                {gradeResult.feedback}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
