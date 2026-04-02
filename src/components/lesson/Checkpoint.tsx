'use client'
import { useEffect } from 'react'
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react'
import { useInteractionStore } from '@/stores/interaction'
import { useChatStore } from '@/stores/chat'
import { cn } from '@/lib/utils'

interface CheckpointProps {
  id: string
  title: string
  instructions: string
  keywords: string[]
}

export default function Checkpoint({ id, title, instructions, keywords }: CheckpointProps) {
  const { completedCheckpoints, completeCheckpoint, triggerPrompt } = useInteractionStore()
  const messages = useChatStore((s) => s.messages)

  const isUnlocked = completedCheckpoints.has(id)

  // Monitor chat messages for keyword matches
  useEffect(() => {
    if (isUnlocked) return

    const lowerKeywords = keywords.map((k) => k.toLowerCase())

    for (const msg of messages) {
      const lowerContent = msg.content.toLowerCase()
      if (lowerKeywords.some((kw) => lowerContent.includes(kw))) {
        completeCheckpoint(id)
        break
      }
    }
  }, [messages, keywords, id, isUnlocked, completeCheckpoint])

  const handleAskInChat = () => {
    triggerPrompt(instructions)
  }

  return (
    <div
      className={cn(
        'my-4 overflow-hidden rounded-lg border-2 transition-all duration-500',
        isUnlocked
          ? 'border-green-400 bg-green-50'
          : 'border-amber-300 bg-amber-50',
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3',
          isUnlocked ? 'bg-green-100' : 'bg-amber-100',
        )}
      >
        {isUnlocked ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 animate-in zoom-in" />
        ) : (
          <Lock className="h-5 w-5 text-amber-600" />
        )}
        <span
          className={cn(
            'text-sm font-semibold',
            isUnlocked ? 'text-green-800' : 'text-amber-800',
          )}
        >
          {isUnlocked ? 'Checkpoint Complete!' : title}
        </span>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <p
          className={cn(
            'text-sm',
            isUnlocked ? 'text-green-700' : 'text-amber-800',
          )}
        >
          {isUnlocked
            ? 'Great job! You engaged with this topic in chat.'
            : instructions}
        </p>

        {!isUnlocked && (
          <button
            onClick={handleAskInChat}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
          >
            Ask in chat
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
