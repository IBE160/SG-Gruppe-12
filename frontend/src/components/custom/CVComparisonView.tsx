import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, RotateCcw, Eye, EyeOff } from "lucide-react"
import { CVData, Change } from "@/types/cv"

interface CVComparisonViewProps {
  originalCV: CVData
  tailoredCV: CVData
  changes: Change[]
  onEdit?: (section: string) => void
  onRestore?: (section: string) => void
  className?: string
}

export function CVComparisonView({
  originalCV,
  tailoredCV,
  changes,
  onEdit,
  onRestore,
  className
}: CVComparisonViewProps) {
  const [showChangesPanel, setShowChangesPanel] = React.useState(true)
  const [highlightChanges, setHighlightChanges] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState<'comparison' | 'original' | 'tailored'>('comparison')

  // Mobile view uses tabs, desktop uses side-by-side
  const isMobile = false // In real app, use useMediaQuery hook

  const getChangeIcon = (type: Change['type']) => {
    switch (type) {
      case 'added': return '+'
      case 'modified': return '✏️'
      case 'removed': return '-'
      case 'reordered': return '↕️'
    }
  }

  const getChangeColor = (type: Change['type']) => {
    switch (type) {
      case 'added': return 'text-success'
      case 'modified': return 'text-info'
      case 'removed': return 'text-error'
      case 'reordered': return 'text-warning'
    }
  }

  const ExperienceSection = ({ experience, isOriginal = false }: { experience: any, isOriginal?: boolean }) => (
    <div className={cn(
      "space-y-4 p-4 rounded-lg border",
      highlightChanges && !isOriginal ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"
    )}>
      <div>
        <h4 className="font-semibold text-gray-900">{experience.title}</h4>
        <p className="text-sm text-gray-600">{experience.company}</p>
        <p className="text-xs text-gray-500">
          {experience.start_date} - {experience.end_date || 'Present'}
        </p>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-line">{experience.description}</p>
      {experience.achievements && experience.achievements.length > 0 && (
        <ul className="space-y-1">
          {experience.achievements.map((achievement: string, idx: number) => (
            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>{achievement}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'comparison' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('comparison')}
          >
            Side-by-Side
          </Button>
          <Button
            variant={activeTab === 'original' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('original')}
          >
            Original
          </Button>
          <Button
            variant={activeTab === 'tailored' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('tailored')}
          >
            Tailored
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHighlightChanges(!highlightChanges)}
            icon={highlightChanges ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            iconPosition="left"
          >
            Highlights
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChangesPanel(!showChangesPanel)}
          >
            {showChangesPanel ? 'Hide' : 'Show'} Changes ({changes.length})
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* CV Comparison */}
        <div className={cn(
          "lg:col-span-8",
          showChangesPanel ? "lg:col-span-8" : "lg:col-span-12"
        )}>
          {activeTab === 'comparison' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original CV */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Original CV</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                    <div className="space-y-3">
                      {originalCV.experience?.map((exp, idx) => (
                        <ExperienceSection key={idx} experience={exp} isOriginal />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {originalCV.skills?.map((skill, idx) => (
                        <Badge key={idx} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tailored CV */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Tailored CV</CardTitle>
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Pencil className="w-4 h-4" />}
                        onClick={() => onEdit('all')}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
                    <div className="space-y-3">
                      {tailoredCV.experience?.map((exp, idx) => (
                        <ExperienceSection key={idx} experience={exp} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {tailoredCV.skills?.map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className={cn(
                            highlightChanges && !originalCV.skills?.includes(skill) && "bg-green-50 border-green-300"
                          )}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'original' && (
            <Card>
              <CardHeader>
                <CardTitle>Original CV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Experience</h3>
                  <div className="space-y-4">
                    {originalCV.experience?.map((exp, idx) => (
                      <ExperienceSection key={idx} experience={exp} isOriginal />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {originalCV.skills?.map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'tailored' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tailored CV</CardTitle>
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Pencil className="w-4 h-4" />}
                      onClick={() => onEdit('all')}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Experience</h3>
                  <div className="space-y-4">
                    {tailoredCV.experience?.map((exp, idx) => (
                      <ExperienceSection key={idx} experience={exp} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {tailoredCV.skills?.map((skill, idx) => (
                      <Badge key={idx} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Changes Panel */}
        {showChangesPanel && (
          <div className="lg:col-span-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Changes Made</CardTitle>
              </CardHeader>
              <CardContent>
                {changes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No changes made to this CV.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {changes.map((change, idx) => (
                      <li
                        key={idx}
                        className="pb-3 border-b border-gray-200 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-2">
                          <span className={cn("text-lg", getChangeColor(change.type))}>
                            {getChangeIcon(change.type)}
                          </span>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium text-gray-900">
                              {change.description}
                            </p>
                            <p className="text-xs text-gray-600">
                              {change.rationale}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {change.section}
                            </Badge>
                          </div>
                          {onRestore && change.type !== 'added' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRestore(change.section)}
                              icon={<RotateCcw className="w-3 h-3" />}
                              className="flex-shrink-0"
                            />
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
