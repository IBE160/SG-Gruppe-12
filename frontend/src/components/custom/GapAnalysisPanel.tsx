import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Lightbulb, Plus } from "lucide-react"
import { Gap } from "@/types/job"

interface GapAnalysisPanelProps {
  gaps: Gap[]
  onAddToCV?: (gap: Gap) => void
  className?: string
}

const getPriorityConfig = (priority: Gap['priority']) => {
  switch (priority) {
    case 'critical':
      return {
        badge: 'error' as const,
        label: 'Critical',
        icon: <AlertTriangle className="w-4 h-4" />
      }
    case 'important':
      return {
        badge: 'warning' as const,
        label: 'Important',
        icon: <AlertTriangle className="w-4 h-4" />
      }
    case 'nice-to-have':
      return {
        badge: 'info' as const,
        label: 'Nice to have',
        icon: <AlertTriangle className="w-4 h-4" />
      }
  }
}

export function GapAnalysisPanel({
  gaps,
  onAddToCV,
  className
}: GapAnalysisPanelProps) {
  if (gaps.length === 0) {
    return (
      <Card className={cn("border-l-4 border-l-success", className)}>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
              <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">No gaps found!</h4>
            <p className="text-sm text-gray-600">
              Your CV matches all the key requirements for this position.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedGaps = [...gaps].sort((a, b) => {
    const priorityOrder = { 'critical': 0, 'important': 1, 'nice-to-have': 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const criticalCount = gaps.filter(g => g.priority === 'critical').length
  const importantCount = gaps.filter(g => g.priority === 'important').length

  return (
    <Card className={cn("border-l-4 border-l-warning", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Gaps to Address
          </CardTitle>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="error" className="text-xs">
                {criticalCount} Critical
              </Badge>
            )}
            {importantCount > 0 && (
              <Badge variant="warning" className="text-xs">
                {importantCount} Important
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-4">
          {sortedGaps.map((gap, index) => {
            const priorityConfig = getPriorityConfig(gap.priority)

            return (
              <li
                key={index}
                className="border-l-2 pl-4 py-2 space-y-2"
                style={{
                  borderColor: gap.priority === 'critical' ? '#EF4444' :
                              gap.priority === 'important' ? '#F59E0B' : '#3B82F6'
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{gap.skill}</span>
                      <Badge variant={priorityConfig.badge} className="text-xs">
                        {priorityConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{gap.context}</p>

                    {gap.suggestion && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                        <Lightbulb className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Tip:</span> {gap.suggestion}
                        </p>
                      </div>
                    )}
                  </div>

                  {onAddToCV && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddToCV(gap)}
                      className="flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            Addressing gaps doesn't always mean learning new skills. Consider highlighting transferable
            skills or related experience that demonstrates similar capabilities.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
