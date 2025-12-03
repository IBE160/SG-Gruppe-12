// frontend/src/lib/schemas/job.ts
/**
 * Job Analysis Schemas
 * Story 3.6: Data Schema Contract Enforcement
 * Mirrors backend validators for type safety
 */
import { z } from 'zod';

export const analyzeJobDescriptionSchema = z.object({
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters long').max(10000, 'Job description cannot exceed 10000 characters.'),
  cvId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/, 'CV ID must be a valid number')]),
});

export type AnalyzeJobDescriptionInput = z.infer<typeof analyzeJobDescriptionSchema>;

/**
 * Extracted Job Data Schema (mirroring backend)
 */
export const extractedJobDataSchema = z.object({
  keywords: z.array(z.string()),
  skills: z.array(z.string()),
  qualifications: z.array(z.string()),
  responsibilities: z.array(z.string()),
});

export type ExtractedJobData = z.infer<typeof extractedJobDataSchema>;

/**
 * ATS Breakdown Schema (mirroring backend)
 */
export const atsBreakdownSchema = z.object({
  keywordDensityScore: z.number().min(0).max(100),
  formattingScore: z.number().min(0).max(100),
  sectionCompletenessScore: z.number().min(0).max(100),
  quantifiableAchievementsScore: z.number().min(0).max(100),
});

export type ATSBreakdown = z.infer<typeof atsBreakdownSchema>;

/**
 * Job Analysis Result Schema (mirroring backend)
 */
export const jobAnalysisResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  presentKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  strengthsSummary: z.string(),
  weaknessesSummary: z.string(),
  rawKeywords: z.array(z.string()),
  jobRequirements: extractedJobDataSchema,
  submittedAt: z.string(),
  atsScore: z.number().min(0).max(100),
  atsSuggestions: z.array(z.string()),
  atsQualitativeRating: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  atsBreakdown: atsBreakdownSchema.optional(),
});

export type JobAnalysisResult = z.infer<typeof jobAnalysisResultSchema>;
