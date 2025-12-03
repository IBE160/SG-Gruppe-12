"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface MatchScoreGaugeProps {
  score: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showMessage?: boolean
  variant?: 'circular' | 'horizontal'
}

const MatchScoreGauge: React.FC<MatchScoreGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  showMessage = true,
  variant = 'circular',
}) => {
  const getScoreColorClass = (currentScore: number) => {
    if (currentScore >= 90) return "text-green-600"
    if (currentScore >= 70) return "text-blue-600"
    if (currentScore >= 50) return "text-amber-600"
    return "text-red-600"
  }

  const getScoreMessage = (currentScore: number) => {
    if (currentScore >= 90) return "Excellent match! Your CV is highly aligned with the job requirements."
    if (currentScore >= 70) return "Good match! You have most of the required skills."
    if (currentScore >= 50) return "Fair match. Consider tailoring your CV further for better alignment."
    return "Low match. Significant tailoring is needed to align with the job requirements."
  }

  const scoreColorClass = getScoreColorClass(score)
  const message = getScoreMessage(score)

  const sizeClasses = {
    sm: "h-20 w-20 text-sm",
    md: "h-28 w-28 text-base",
    lg: "h-36 w-36 text-lg",
  }

  const strokeWidth = {
    sm: 8,
    md: 10,
    lg: 12,
  }

  // Circular variant implementation
  if (variant === 'circular') {
    return (
      <div className={cn("relative flex items-center justify-center rounded-full", sizeClasses[size])}>
        <svg className="h-full w-full" viewBox="0 0 100 100" data-testid="circular-gauge-svg">
          <circle
            className="text-gray-200"
            strokeWidth={strokeWidth[size]}
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <circle
            className={cn("transition-all duration-500", scoreColorClass)}
            strokeWidth={strokeWidth[size]}
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={(2 * Math.PI * 45) - (score / 100) * (2 * Math.PI * 45)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        {showLabel && (
          <div className="absolute flex flex-col items-center">
            <span className={cn("font-bold", scoreColorClass)}>{score}%</span>
            {showMessage && <p className="text-xs text-center mt-1 px-2">{message}</p>}
          </div>
        )}
      </div>
    )
  }

  // Horizontal variant implementation
  return (
    <div className="flex flex-col items-start w-full">
      <div className="flex justify-between w-full mb-1">
        {showLabel && <span className={cn("font-bold", scoreColorClass)}>{score}% Match</span>}
      </div>
      <Progress value={score} className="h-2 w-full" indicatorClassName={cn("transition-all duration-500", scoreColorClass)} />
      {showMessage && <p className={cn("text-sm mt-2", scoreColorClass)}>{message}</p>}
    </div>
  )
}

export { MatchScoreGauge }