// frontend/src/components/features/job-analysis/ATSScoreCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils'; // Assuming cn utility for classnames

interface ATSScoreCardProps {
  score: number;
  suggestions: string[];
  qualitativeRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  showDetails?: boolean;
  className?: string;
  atsBreakdown?: {
    keywordDensityScore: number;
    formattingScore: number;
    sectionCompletenessScore: number;
    quantifiableAchievementsScore: number;
  };
}

const ATSScoreCard: React.FC<ATSScoreCardProps> = ({
  score,
  suggestions,
  qualitativeRating,
  showDetails = false,
  className,
  atsBreakdown,
}) => {
  const scoreColorClass = (s: number) => {
    if (s >= 90) return 'bg-green-500';
    if (s >= 75) return 'bg-yellow-500';
    if (s >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const scoreTextColorClass = (s: number) => {
    if (s >= 90) return 'text-green-500';
    if (s >= 75) return 'text-yellow-500';
    if (s >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>ATS Compatibility Score</span>
          <Badge className={scoreColorClass(score)}>{qualitativeRating}</Badge>
        </CardTitle>
        <CardDescription>
          Your CV's compatibility with Applicant Tracking Systems.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 mb-4">
          <Progress value={score} className={scoreColorClass(score)} />
          <span className={cn("text-2xl font-bold", scoreTextColorClass(score))}>{score}%</span>
        </div>

        {suggestions.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Improvement Suggestions:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {showDetails && atsBreakdown && (
          <div>
            <Separator className="my-4" />
            <h4 className="font-semibold mb-2">Detailed Breakdown:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p>Keyword Density:</p>
                <Progress value={atsBreakdown.keywordDensityScore} className={scoreColorClass(atsBreakdown.keywordDensityScore)} />
                <span className={scoreTextColorClass(atsBreakdown.keywordDensityScore)}>{atsBreakdown.keywordDensityScore}%</span>
              </div>
              <div>
                <p>Formatting Simplicity:</p>
                <Progress value={atsBreakdown.formattingScore} className={scoreColorClass(atsBreakdown.formattingScore)} />
                <span className={scoreTextColorClass(atsBreakdown.formattingScore)}>{atsBreakdown.formattingScore}%</span>
              </div>
              <div>
                <p>Section Completeness:</p>
                <Progress value={atsBreakdown.sectionCompletenessScore} className={scoreColorClass(atsBreakdown.sectionCompletenessScore)} />
                <span className={scoreTextColorClass(atsBreakdown.sectionCompletenessScore)}>{atsBreakdown.sectionCompletenessScore}%</span>
              </div>
              <div>
                <p>Quantifiable Achievements:</p>
                <Progress value={atsBreakdown.quantifiableAchievementsScore} className={scoreColorClass(atsBreakdown.quantifiableAchievementsScore)} />
                <span className={scoreTextColorClass(atsBreakdown.quantifiableAchievementsScore)}>{atsBreakdown.quantifiableAchievementsScore}%</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ATSScoreCard;
