/**
 * Matching Validators
 * Zod schemas for CV-Job matching requests and responses
 *
 * Story: 3-3 CV-Job Description Keyword Matching Algorithm
 */

import { z } from 'zod';

/**
 * Schema for matching request (matches validate middleware pattern)
 */
export const MatchingRequestSchema = z.object({
  body: z.object({
    cvId: z.string().min(1, 'CV ID is required'),
  }),
  params: z.object({
    jobId: z.string().optional(),
  }),
  query: z.object({}).optional(),
});

export type MatchingRequestInput = z.infer<typeof MatchingRequestSchema>['body'];

/**
 * Schema for matched keyword
 */
export const MatchedKeywordSchema = z.object({
  keyword: z.string(),
  source: z.enum(['cv', 'job']),
  matchType: z.enum(['exact', 'semantic', 'synonym']),
  confidence: z.number().min(0).max(1),
});

/**
 * Schema for matched skill
 */
export const MatchedSkillSchema = z.object({
  skillName: z.string(),
  cvProficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  jobRequirement: z.string(),
  matchStrength: z.number().min(0).max(100),
});

/**
 * Schema for gap analysis
 */
export const GapAnalysisSchema = z.object({
  missingSkills: z.array(z.string()),
  missingQualifications: z.array(z.string()),
  experienceGap: z.string().optional(),
  educationGap: z.string().optional(),
  recommendations: z.array(z.string()),
});

/**
 * Schema for match metadata
 */
export const MatchMetadataSchema = z.object({
  cvId: z.string(),
  jobId: z.string(),
  analyzedAt: z.string(),
  cacheKey: z.string().optional(),
  processingTimeMs: z.number().optional(),
});

/**
 * Schema for match result (response)
 */
export const MatchResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchedKeywords: z.array(MatchedKeywordSchema),
  matchedSkills: z.array(MatchedSkillSchema),
  missingKeywords: z.array(z.string()),
  missingSkills: z.array(z.string()),
  gapAnalysis: GapAnalysisSchema,
  metadata: MatchMetadataSchema,
});

export type MatchResultOutput = z.infer<typeof MatchResultSchema>;
