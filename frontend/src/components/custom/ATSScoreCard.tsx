import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

interface ATSScoreCardProps {
  score: number // 0-100
  suggestions: string[]
  showDetails?: boolean
  onViewDetails?: () => void
  className?: string
}

const getScoreRating = (score: number): { label: string; variant: 'success' | 'info' | 'warning' | 'error'; icon: React.ReactNode } => {
  if (score >= 90) return {
    label: "Excellent",
    variant: "success",
    icon: <CheckCircle className="w-5 h-5" />
  }
  if (score >= 75) return {
    label: "Good",
    variant: "info",
    icon: <CheckCircle className="w-5 h-5" />
  }
  if (score >= 60) return {
    label: "Fair",
    variant: "warning",
    icon: <AlertCircle className="w-5 h-5" />
  }
  return {
    label: "Poor",
    variant: "error",
    icon: <AlertCircle className="w-5 h-5" />
  }
}

const getScoreDescription = (score: number): string => {
  if (score >= 90) return "Your CV is highly optimized for Applicant Tracking Systems and should pass initial screening."
  if (score >= 75) return "Your CV is well-optimized for ATS systems with minor improvements needed."
  if (score >= 60) return "Your CV may pass ATS screening but could benefit from optimization."
  return "Your CV needs significant improvements to pass ATS screening effectively."
}

export function ATSScoreCard({
  score,
  suggestions,
  showDetails = false,
  onViewDetails,
  className
}: ATSScoreCardProps) {
  const rating = getScoreRating(score)
  const description = getScoreDescription(score)
  const [expanded, setExpanded] = React.useState(showDetails)

  return (
    <Card className={cn("border-l-4", {
      "border-l-success": score >= 90,
      "border-l-info": score >= 75 && score < 90,
      "border-l-warning": score >= 60 && score < 75,
      "border-l-error": score < 60,
    }, className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {rating.icon}
            <CardTitle className="text-xl">
              ATS Score: {score}/100
            </CardTitle>
          </div>
          <Badge variant={rating.variant} className="text-sm px-3 py-1">
            {rating.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Improvements{expanded ? ':' : ` (${suggestions.length})`}
              </h4>
              {!showDetails && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm text-primary hover:underline focus:outline-none"
                  aria-expanded={expanded}
                >
                  {expanded ? 'Hide' : 'Show'} details
                </button>
              )}
            </div>

            {expanded && (
              <ul className="space-y-2 ml-1">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-primary mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="text-sm text-primary hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            View detailed analysis →
          </button>
        )}
      </CardContent>
    </Card>
  )
}
