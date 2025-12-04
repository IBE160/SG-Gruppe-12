// frontend/src/types/job.types.ts
// Shared types for job analysis - synced with backend types

export interface ExtractedJobData {
  keywords: string[];
  skills: string[];
  qualifications: string[];
  responsibilities: string[];
}

export interface ATSBreakdown {
  keywordDensityScore: number;
  formattingScore: number;
  sectionCompletenessScore: number;
  quantifiableAchievementsScore: number;
}

export interface ATSAssessment {
  score: number;
  suggestions: string[];
  qualitativeRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  breakdown: ATSBreakdown;
}

export interface JobRequirementInterpretation {
  requirement: string;
  literalMeaning: string;
  realMeaning: string;
  implicitExpectations: string[];
  redFlags?: string[];
}

export interface JobInterpretationResult {
  overallAssessment: string;
  interpretations: JobRequirementInterpretation[];
  culturalSignals: string[];
  compensationInsights: string[];
  growthPotential: string;
}

export interface JobAnalysisResult {
  matchScore: number;
  presentKeywords: string[];
  missingKeywords: string[];
  strengthsSummary: string;
  weaknessesSummary: string;
  rawKeywords: string[];
  jobRequirements: ExtractedJobData;
  submittedAt: string;
  atsScore: number;
  atsSuggestions: string[];
  atsQualitativeRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  atsBreakdown?: ATSBreakdown;
  interpretation?: JobInterpretationResult;
}

export interface JobAnalysisInput {
  jobDescription: string;
  cvId: string;
}
