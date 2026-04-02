'use client';

import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number;
  onUpload: (file: File) => Promise<void>;
  currentFile?: string;
  isUploading?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  label,
  accept,
  maxSize,
  onUpload,
  currentFile,
  isUploading = false,
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndUpload = useCallback(
    async (file: File) => {
      setError(null);

      if (accept) {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const matches = acceptedTypes.some((type) => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', '/'));
          }
          return file.type === type;
        });
        if (!matches) {
          setError(`File type not accepted. Allowed: ${accept}`);
          return;
        }
      }

      if (maxSize && file.size > maxSize) {
        setError(`File too large. Maximum size: ${formatBytes(maxSize)}`);
        return;
      }

      setFileName(file.name);
      await onUpload(file);
    },
    [accept, maxSize, onUpload],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndUpload(file);
    },
    [validateAndUpload],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndUpload(file);
      if (inputRef.current) inputRef.current.value = '';
    },
    [validateAndUpload],
  );

  const displayName = fileName ?? (currentFile ? currentFile.split('/').pop() : null);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={label ?? 'Upload file'}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
          dragOver
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
          isUploading && 'pointer-events-none opacity-60',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        {isUploading ? (
          <>
            <Spinner size="md" />
            <p className="text-sm text-gray-600">Uploading...</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-gray-400" aria-hidden="true" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Drop a file here or click to browse
              </p>
              {maxSize && (
                <p className="mt-1 text-xs text-gray-500">
                  Max size: {formatBytes(maxSize)}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {displayName && !isUploading && (
        <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm">
          <FileIcon className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
          {currentFile ? (
            <a
              href={currentFile}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-indigo-600 hover:underline"
            >
              {displayName}
            </a>
          ) : (
            <span className="truncate text-gray-700">{displayName}</span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFileName(null);
              setError(null);
            }}
            className="ml-auto rounded p-0.5 text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
