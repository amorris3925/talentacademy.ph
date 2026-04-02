'use client'
import { useEffect, useCallback } from 'react'
import { MessageCircle } from 'lucide-react'
import { useInteractionStore } from '@/stores/interaction'

export default function HighlightToAsk() {
  const { selectedText, selectedRect, setSelectedText, triggerPrompt } = useInteractionStore()

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (!text || text.length < 3) {
      setSelectedText(null)
      return
    }

    const range = selection?.getRangeAt(0)
    const rect = range?.getBoundingClientRect()
    if (rect) {
      setSelectedText(text, { top: rect.top + window.scrollY, left: rect.left, bottom: rect.bottom + window.scrollY })
    }
  }, [setSelectedText])

  const handleMouseDown = useCallback(() => {
    // Clear selection on new click
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
      className="fixed z-50 animate-in fade-in"
      style={{
        top: selectedRect.bottom + 8,
        left: selectedRect.left,
      }}
    >
      <button
        onClick={handleAskAI}
        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg hover:bg-indigo-500 transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        Ask AI about this
      </button>
    </div>
  )
}
