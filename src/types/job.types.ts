// src/types/job.types.ts

export interface JobAnalysisResult {
  matchScore: number;
  presentKeywords: string[];
  missingKeywords: string[];
  strengthsSummary: string;
  weaknessesSummary: string;
  rawKeywords: string[];
}

export interface JobAnalysisInput {
  jobDescription: string;
  cvId: string;
}
