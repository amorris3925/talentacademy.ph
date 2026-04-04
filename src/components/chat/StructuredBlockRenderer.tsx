'use client';

import { ExternalLink, FileText } from 'lucide-react';
import type { AcademyStructuredBlock } from '@/types';

interface StructuredBlockRendererProps {
  block: AcademyStructuredBlock;
}

export function StructuredBlockRenderer({ block }: StructuredBlockRendererProps) {
  switch (block.type) {
    case 'image':
      return (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <img
            src={block.url}
            alt={block.alt || 'Generated image'}
            className="w-full object-contain max-h-64"
          />
        </div>
      );

    case 'data_table':
      return (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          {block.title && (
            <div className="border-b border-gray-200 bg-gray-50 px-3 py-1.5">
              <p className="text-xs font-medium text-gray-700">{block.title}</p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {block.columns.map((col) => (
                    <th key={col.key} className="px-2.5 py-1.5 text-left font-medium text-gray-600">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    {block.columns.map((col) => (
                      <td key={col.key} className="px-2.5 py-1.5 text-gray-700">
                        {String(row[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'chart':
      // Render a simple bar/line chart description for now; full Chart.js integration later
      return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          {block.title && (
            <p className="mb-1 text-xs font-medium text-gray-700">{block.title}</p>
          )}
          <div className="space-y-1">
            {block.datasets.map((ds, i) => (
              <div key={i}>
                <p className="text-[11px] text-gray-500">{ds.label}</p>
                <div className="flex gap-0.5">
                  {ds.data.map((val, j) => {
                    const max = Math.max(...ds.data, 1);
                    const pct = (val / max) * 100;
                    return (
                      <div key={j} className="flex flex-1 flex-col items-center gap-0.5">
                        <div className="w-full rounded-t bg-indigo-400" style={{ height: `${Math.max(pct * 0.4, 2)}px` }} />
                        <span className="text-[9px] text-gray-400 truncate max-w-full">
                          {block.labels[j] || j}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'artifact_embed':
      return (
        <a
          href={`/artifacts/${block.artifact_id}`}
          className="flex items-start gap-2.5 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5 transition-colors hover:bg-indigo-50"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
            <FileText className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-gray-900 truncate">{block.title}</p>
              <span className="shrink-0 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                {block.artifact_type}
              </span>
            </div>
            {block.summary && (
              <p className="mt-0.5 text-[11px] text-gray-500 line-clamp-2">{block.summary}</p>
            )}
          </div>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
        </a>
      );

    default:
      return null;
  }
}
