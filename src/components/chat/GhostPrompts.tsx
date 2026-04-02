'use client'
import { Lightbulb } from 'lucide-react'
import { useInteractionStore } from '@/stores/interaction'
import { useLessonStore } from '@/stores/lesson'

const DEFAULT_PROMPTS = [
  'Explain this concept simply',
  'Give me a real-world example',
  'Quiz me on what I just learned',
]

export default function GhostPrompts() {
  const triggerPrompt = useInteractionStore((s) => s.triggerPrompt)
  const currentLesson = useLessonStore((s) => s.currentLesson)

  // Use lesson-specific ghost prompts if available, otherwise defaults
  const prompts = currentLesson?.ai_context
    ? [
        `Summarize "${currentLesson.title}" in 3 bullet points`,
        'What should I focus on in this lesson?',
        'Give me a practice exercise for this topic',
      ]
    : DEFAULT_PROMPTS

  return (
    <div className="flex flex-wrap gap-1.5 px-2 py-2 border-t border-gray-100">
      <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-1 shrink-0" />
      {prompts.map((p, i) => (
        <button
          key={i}
          onClick={() => triggerPrompt(p)}
          className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
        >
          {p}
        </button>
      ))}
    </div>
  )
}
