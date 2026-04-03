'use client'
import { useEffect, useCallback, useRef } from 'react'
import { MessageCircle } from 'lucide-react'
import { useInteractionStore } from '@/stores/interaction'

export default function HighlightToAsk() {
  const { selectedText, selectedRect, setSelectedText, triggerPrompt } = useInteractionStore()
  const popupRef = useRef<HTMLDivElement>(null)

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const text = selection.toString().trim()

    if (!text || text.length < 3) {
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    if (rect) {
      // Store viewport-relative coords for fixed positioning
      setSelectedText(text, { top: rect.top, left: rect.left, bottom: rect.bottom })
    }
  }, [setSelectedText])

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // Don't clear selection if clicking inside the popup (prevents click race)
    if (popupRef.current?.contains(e.target as Node)) return
    setSelectedText(null)
  }, [setSelectedText])

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [handleMouseUp, handleMouseDown])

  const handleAskAI = () => {
    if (!selectedText) return
    triggerPrompt(
      `I'm reading the lesson and selected this text:\n\n"${selectedText}"\n\nCan you explain this in more detail?`,
      selectedText
    )
    setSelectedText(null)
    window.getSelection()?.removeAllRanges()
  }

  if (!selectedText || !selectedRect) return null

  return (
    <div
      ref={popupRef}
      className="fixed z-50 animate-in fade-in"
      style={{
        top: selectedRect.bottom + 8,
        left: selectedRect.left,
      }}
    >
      <button
        type="button"
        onClick={handleAskAI}
        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg hover:bg-indigo-500 transition-colors"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Ask AI about this
      </button>
    </div>
  )
}
