'use client';

import { useState, useRef, useCallback } from 'react';
import { Sparkles, Type, Copy, Check } from 'lucide-react';
import { academyApi } from '@/lib/api';
import { Button } from '@/components/ui';

export function TextGenerator() {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;
    setError(null);
    setOutput('');
    setIsGenerating(true);

    try {
      await academyApi.stream(
        '/generate/text',
        { prompt: prompt.trim(), max_tokens: 2048, temperature: 0.7 },
        (chunk: string) => {
          try {
            const data = JSON.parse(chunk);
            if (data.error) {
              setError(data.error);
              return;
            }
            if (data.content) {
              setOutput((prev) => prev + data.content);
              // Auto-scroll to bottom
              if (outputRef.current) {
                outputRef.current.scrollTop = outputRef.current.scrollHeight;
              }
            }
          } catch {
            // Ignore malformed chunks
          }
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Text generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, isGenerating]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="space-y-5">
      {/* Prompt */}
      <div>
        <label htmlFor="text-gen-prompt" className="mb-1.5 block text-sm font-medium text-gray-700">
          Prompt
        </label>
        <textarea
          id="text-gen-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Write a short story about a robot learning to paint..."
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />
        <p className="mt-1 text-xs text-gray-400">Press Cmd+Enter / Ctrl+Enter to generate</p>
      </div>

      {/* Generate */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleGenerate}
        isLoading={isGenerating}
        disabled={!prompt.trim() || isGenerating}
        className="w-full"
      >
        <Sparkles className="h-4 w-4" />
        {isGenerating ? 'Generating...' : 'Generate Text'}
      </Button>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Output */}
      {output && (
        <div className="relative rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
            <span className="text-xs font-medium text-gray-500">Generated Output</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div
            ref={outputRef}
            className="max-h-96 overflow-y-auto whitespace-pre-wrap p-4 text-sm text-gray-800"
          >
            {output}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!output && !isGenerating && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Type className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">
            Your generated text will appear here
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Enter a prompt and click generate to get started
          </p>
        </div>
      )}
    </div>
  );
}
