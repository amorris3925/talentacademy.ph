'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ToolCallEvent } from '@/types';

const TOOL_LABELS: Record<string, string> = {
  generate_image: 'Generating image',
  analyze_style: 'Analyzing style',
  extract_color_palette: 'Extracting colors',
  compare_images: 'Comparing images',
  generate_article: 'Writing article',
  analyze_seo: 'Analyzing SEO',
  research_keywords: 'Researching keywords',
  check_readability: 'Checking readability',
  build_campaign_brief: 'Building campaign brief',
  analyze_audience: 'Analyzing audience',
  ab_copy_test: 'Testing copy variants',
  social_post_gen: 'Generating social posts',
  build_workflow: 'Building workflow',
  test_api_endpoint: 'Testing API endpoint',
  generate_automation_template: 'Creating automation',
};

interface ToolCallIndicatorProps {
  toolCall: ToolCallEvent;
}

export function ToolCallIndicator({ toolCall }: ToolCallIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  const label = TOOL_LABELS[toolCall.tool_name] || toolCall.tool_name;

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-xs">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1.5"
      >
        {toolCall.status === 'running' && (
          <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
        )}
        {toolCall.status === 'done' && (
          <CheckCircle2 className="h-3 w-3 text-green-500" />
        )}
        {toolCall.status === 'error' && (
          <XCircle className="h-3 w-3 text-red-500" />
        )}
        <span className={cn(
          'font-medium',
          toolCall.status === 'running' && 'text-indigo-700',
          toolCall.status === 'done' && 'text-green-700',
          toolCall.status === 'error' && 'text-red-700',
        )}>
          {label}
        </span>
        {toolCall.duration_ms != null && (
          <span className="text-gray-400 ml-auto mr-1">
            {(toolCall.duration_ms / 1000).toFixed(1)}s
          </span>
        )}
        {expanded ? (
          <ChevronDown className="h-3 w-3 text-gray-400" />
        ) : (
          <ChevronRight className="h-3 w-3 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-1.5 space-y-1 border-t border-gray-100 pt-1.5">
          {Object.keys(toolCall.tool_input).length > 0 && (
            <div>
              <span className="text-gray-400">Input:</span>
              <pre className="mt-0.5 whitespace-pre-wrap break-all text-gray-600 text-[11px]">
                {JSON.stringify(toolCall.tool_input, null, 2)}
              </pre>
            </div>
          )}
          {toolCall.result_preview && (
            <div>
              <span className="text-gray-400">Result:</span>
              <p className="mt-0.5 text-gray-600">{toolCall.result_preview}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
