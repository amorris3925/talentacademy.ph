'use client'
import { Lightbulb } from 'lucide-react'
import { useInteractionStore } from '@/stores/interaction'
import { useLessonStore } from '@/stores/lesson'
import { useAuthStore } from '@/stores/auth'
import { getPersonalizedGhostPrompts } from '@/lib/prompt-personalization'

export default function GhostPrompts() {
  const triggerPrompt = useInteractionStore((s) => s.triggerPrompt)
  const currentLesson = useLessonStore((s) => s.currentLesson)
  const learner = useAuthStore((s) => s.learner)

  const prompts = getPersonalizedGhostPrompts(
    learner?.work_type,
    learner?.specialization,
    currentLesson?.title,
  )

  return (
    <div className="flex flex-wrap gap-1.5 px-2 py-2 border-t border-gray-100">
      <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-1 shrink-0" />
      {prompts.map((p, i) => (
        <button
          type="button"
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
