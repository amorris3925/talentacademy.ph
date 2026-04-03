'use client'
import { Sparkles } from 'lucide-react'
import { useInteractionStore } from '@/stores/interaction'
import { useAuthStore } from '@/stores/auth'
import { useLessonStore } from '@/stores/lesson'
import { getPersonalizedPrompts } from '@/lib/prompt-personalization'

interface Prompt { label: string; text: string }

export default function PromptChips({ prompts }: { prompts: Prompt[] }) {
  const triggerPrompt = useInteractionStore((s) => s.triggerPrompt)
  const learner = useAuthStore((s) => s.learner)
  const currentLesson = useLessonStore((s) => s.currentLesson)

  if (!prompts || prompts.length === 0) return null

  const personalizedPrompts = getPersonalizedPrompts(
    prompts,
    learner?.work_type,
    learner?.specialization,
    currentLesson?.title,
  )

  return (
    <div className="flex flex-wrap gap-2 my-4">
      {personalizedPrompts.map((p, i) => (
        <button
          type="button"
          key={i}
          onClick={() => triggerPrompt(p.text)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {p.label}
        </button>
      ))}
    </div>
  )
}
