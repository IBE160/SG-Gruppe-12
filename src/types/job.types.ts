// src/types/job.types.ts

import { ExtractedJobData } from "../services/KeywordExtractionService";
import { JobInterpretationResult } from "../services/job-interpretation.service";

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
  interpretation?: JobInterpretationResult; // Phase 3 Task 2: Job requirement interpretation
}

export interface JobAnalysisInput {
  jobDescription: string;
  cvId: string;
}

export interface ATSAssessment {
  score: number;
  suggestions: string[];
  qualitativeRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  breakdown: ATSBreakdown; // New field for detailed breakdown
}

export interface ATSBreakdown {
  keywordDensityScore: number;
  formattingScore: number;
  sectionCompletenessScore: number;
  quantifiableAchievementsScore: number;
  // Add more granular scores as identified by the algorithm
}
