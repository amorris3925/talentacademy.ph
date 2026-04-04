'use client';

import { useRef, useCallback, useState, type KeyboardEvent, type ClipboardEvent, type DragEvent } from 'react';
import { Send, ImagePlus, X, Sparkles } from 'lucide-react';
import { useChatStore } from '@/stores/chat';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string, images?: File[]) => void;
  isStreaming: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isStreaming,
  placeholder = 'Ask a question about this lesson...',
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const imageCreationEnabled = useChatStore((s) => s.imageCreationEnabled);
  const setImageCreationEnabled = useChatStore((s) => s.setImageCreationEnabled);

  const addImages = useCallback((files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setAttachedImages((prev) => [...prev, ...imageFiles]);
    const newPreviews = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const removeImage = useCallback((index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = useCallback(() => {
    const value = textareaRef.current?.value.trim();
    if ((!value && attachedImages.length === 0) || isStreaming) return;
    onSend(value || '', attachedImages.length > 0 ? attachedImages : undefined);
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
    }
    // Clean up previews
    previews.forEach((url) => URL.revokeObjectURL(url));
    setAttachedImages([]);
    setPreviews([]);
  }, [onSend, isStreaming, attachedImages, previews]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      addImages(imageFiles);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className="border-t border-gray-200 bg-white"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Image previews */}
      {previews.length > 0 && (
        <div className="flex gap-2 px-3 pt-2 overflow-x-auto">
          {previews.map((url, i) => (
            <div key={i} className="relative shrink-0">
              <img
                src={url}
                alt={`Attachment ${i + 1}`}
                className="h-16 w-16 rounded-lg object-cover border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image generation toggle */}
      <div className="flex items-center px-3 pt-2">
        <button
          type="button"
          onClick={() => setImageCreationEnabled(!imageCreationEnabled)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
            imageCreationEnabled
              ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
          )}
        >
          <Sparkles className="h-3 w-3" />
          {imageCreationEnabled ? 'Image generation on' : 'Image generation off'}
        </button>
      </div>

      <div className="flex items-end gap-2 p-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50',
            'disabled:opacity-50',
          )}
          aria-label="Attach image"
        >
          <ImagePlus className="h-4 w-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            addImages(files);
            e.target.value = '';
          }}
        />
        <textarea
          ref={textareaRef}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onPaste={handlePaste}
          placeholder={imageCreationEnabled ? 'Describe the image you want to create...' : placeholder}
          rows={1}
          disabled={isStreaming}
          maxLength={4000}
          aria-label="Chat message"
          className={cn(
            'flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm',
            'placeholder:text-gray-400',
            'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1',
            'disabled:bg-gray-50 disabled:opacity-60',
          )}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isStreaming}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            'bg-indigo-600 text-white hover:bg-indigo-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:hover:bg-indigo-600',
          )}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
