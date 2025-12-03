import { z } from 'zod';

/**
 * Job Analysis Input Validation
 * Story 3.6: Data Schema Contract Enforcement
 */

// Schema for job description analysis request
export const analyzeJobDescriptionSchema = z.object({
  body: z.object({
    jobDescription: z.string().min(10, 'Job description or URL must be at least 10 characters long.').max(10000, 'Job description cannot exceed 10000 characters.'),
    cvId: z.union([z.number().int().positive(), z.string().regex(/^\d+$/, 'CV ID must be a valid number')]),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export type AnalyzeJobDescriptionInput = z.infer<typeof analyzeJobDescriptionSchema>['body'];

/**
 * Extracted Job Data Schema
 * Used for AI extraction output validation
 */
export const ExtractedJobDataSchema = z.object({
  keywords: z.array(z.string()),
  skills: z.array(z.string()),
  qualifications: z.array(z.string()),
  responsibilities: z.array(z.string()),
});

export type ExtractedJobDataOutput = z.infer<typeof ExtractedJobDataSchema>;

/**
 * ATS Breakdown Schema
 * Detailed breakdown of ATS score components
 */
export const ATSBreakdownSchema = z.object({
  keywordDensityScore: z.number().min(0).max(100),
  formattingScore: z.number().min(0).max(100),
  sectionCompletenessScore: z.number().min(0).max(100),
  quantifiableAchievementsScore: z.number().min(0).max(100),
});

export type ATSBreakdownOutput = z.infer<typeof ATSBreakdownSchema>;

/**
 * ATS Assessment Schema
 * Complete ATS assessment result
 */
export const ATSAssessmentSchema = z.object({
  score: z.number().min(0).max(100),
  suggestions: z.array(z.string()),
  qualitativeRating: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  breakdown: ATSBreakdownSchema,
});

export type ATSAssessmentOutput = z.infer<typeof ATSAssessmentSchema>;

/**
 * Job Analysis Result Schema
 * Complete output from job analysis endpoint
 */
export const JobAnalysisResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  presentKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  strengthsSummary: z.string(),
  weaknessesSummary: z.string(),
  rawKeywords: z.array(z.string()),
  jobRequirements: ExtractedJobDataSchema,
  submittedAt: z.string(),
  atsScore: z.number().min(0).max(100),
  atsSuggestions: z.array(z.string()),
  atsQualitativeRating: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
  atsBreakdown: ATSBreakdownSchema.optional(),
});

export type JobAnalysisResultOutput = z.infer<typeof JobAnalysisResultSchema>;