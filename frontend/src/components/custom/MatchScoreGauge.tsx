import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Target } from "lucide-react"

interface MatchScoreGaugeProps {
  score: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showMessage?: boolean
  variant?: 'circular' | 'horizontal'
  className?: string
}

const getScoreColor = (score: number) => {
  if (score >= 90) return { text: "text-green-600", bg: "bg-green-600" }
  if (score >= 70) return { text: "text-blue-600", bg: "bg-blue-600" }
  if (score >= 50) return { text: "text-amber-600", bg: "bg-amber-600" }
  return { text: "text-red-600", bg: "bg-red-600" }
}

const getScoreMessage = (score: number) => {
  if (score >= 90) return "Excellent match! You have nearly all required skills."
  if (score >= 70) return "Good match! You have most of the required skills."
  if (score >= 50) return "Fair match. Consider highlighting transferable skills."
  return "Limited match. You may be missing key requirements."
}

export function MatchScoreGauge({
  score,
  size = 'md',
  showLabel = true,
  showMessage = true,
  variant = 'horizontal',
  className
}: MatchScoreGaugeProps) {
  const colors = getScoreColor(score)
  const message = getScoreMessage(score)

  const sizes = {
    sm: { container: "p-4", icon: "w-6 h-6", text: "text-2xl", message: "text-sm" },
    md: { container: "p-6", icon: "w-8 h-8", text: "text-4xl", message: "text-base" },
    lg: { container: "p-8", icon: "w-10 h-10", text: "text-5xl", message: "text-lg" },
  }

  const sizeClasses = sizes[size]

  if (variant === 'horizontal') {
    return (
      <div className={cn("bg-white rounded-lg border border-gray-200 shadow-sm", sizeClasses.container, className)}>
        <div className="flex items-center gap-3 mb-4">
          <Target className={cn(colors.text, sizeClasses.icon)} />
          <h3 className="text-lg font-semibold text-gray-900">Your Match Score</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress
                value={score}
                className="h-6"
                style={{
                  background: '#E5E7EB'
                }}
              />
            </div>
            {showLabel && (
              <span className={cn("font-bold tabular-nums", sizeClasses.text, colors.text)}>
                {score}%
              </span>
            )}
          </div>

          {showMessage && (
            <p className={cn("text-gray-600", sizeClasses.message)}>
              {message}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Circular variant
  const radius = size === 'sm' ? 40 : size === 'md' ? 60 : 80
  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={cn("flex flex-col items-center", sizeClasses.container, className)}>
      <div className="relative inline-flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={cn(colors.text, "transition-all duration-500")}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Target className={cn(colors.text, "w-6 h-6 mb-1")} />
          {showLabel && (
            <span className={cn("font-bold tabular-nums", colors.text, sizeClasses.text)}>
              {score}%
            </span>
          )}
        </div>
      </div>

      {showMessage && (
        <p className={cn("text-center text-gray-600 mt-4 max-w-xs", sizeClasses.message)}>
          {message}
        </p>
      )}
    </div>
  )
}
