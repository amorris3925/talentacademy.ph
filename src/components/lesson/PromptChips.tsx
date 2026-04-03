'use client'
import { Sparkles } from 'lucide-react'
import { useInteractionStore } from '@/stores/interaction'

interface Prompt { label: string; text: string }

export default function PromptChips({ prompts }: { prompts: Prompt[] }) {
  const triggerPrompt = useInteractionStore((s) => s.triggerPrompt)

  if (!prompts || prompts.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 my-4">
      {prompts.map((p, i) => (
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
