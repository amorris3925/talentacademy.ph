'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { academyApi } from '@/lib/api'

interface OutputRatingProps {
  messageId: string
}

export default function OutputRating({ messageId }: OutputRatingProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoveredStar, setHoveredStar] = useState<number>(0)

  return (
    <div className="flex items-center gap-1.5 mt-1 ml-9">
      <span className="text-[10px] text-gray-400 mr-0.5">Rate this response</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => {
            setRating(star)
            academyApi.post('/chat/rate', { message_id: messageId, rating: star }).catch(() => {})
          }}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
          className="p-0 border-0 bg-transparent cursor-pointer transition-colors"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              'h-4 w-4 transition-colors',
              (hoveredStar || rating) >= star
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-gray-300',
            )}
          />
        </button>
      ))}
    </div>
  )
}
