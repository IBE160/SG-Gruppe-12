// frontend/src/lib/schemas/matching.ts
/**
 * Matching Schemas
 * Story 3.6: Data Schema Contract Enforcement
 * Mirrors backend validators for type safety
 */
import { z } from 'zod';

/**
 * Schema for matched keyword
 */
export const matchedKeywordSchema = z.object({
  keyword: z.string(),
  source: z.enum(['cv', 'job']),
  matchType: z.enum(['exact', 'semantic', 'synonym']),
  confidence: z.number().min(0).max(1),
});

export type MatchedKeyword = z.infer<typeof matchedKeywordSchema>;

/**
 * Schema for matched skill
 */
export const matchedSkillSchema = z.object({
  skillName: z.string(),
  cvProficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  jobRequirement: z.string(),
  matchStrength: z.number().min(0).max(100),
});

export type MatchedSkill = z.infer<typeof matchedSkillSchema>;

/**
 * Schema for gap analysis
 */
export const gapAnalysisSchema = z.object({
  missingSkills: z.array(z.string()),
  missingQualifications: z.array(z.string()),
  experienceGap: z.string().optional(),
  educationGap: z.string().optional(),
  recommendations: z.array(z.string()),
});

export type GapAnalysis = z.infer<typeof gapAnalysisSchema>;

/**
 * Schema for match metadata
 */
export const matchMetadataSchema = z.object({
  cvId: z.string(),
  jobId: z.string(),
  analyzedAt: z.string(),
  cacheKey: z.string().optional(),
  processingTimeMs: z.number().optional(),
});

export type MatchMetadata = z.infer<typeof matchMetadataSchema>;

/**
 * Schema for match result (response)
 */
export const matchResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  matchedKeywords: z.array(matchedKeywordSchema),
  matchedSkills: z.array(matchedSkillSchema),
  missingKeywords: z.array(z.string()),
  missingSkills: z.array(z.string()),
  gapAnalysis: gapAnalysisSchema,
  metadata: matchMetadataSchema,
});

export type MatchResult = z.infer<typeof matchResultSchema>;

/**
 * Schema for matching request
 */
export const matchingRequestSchema = z.object({
  cvId: z.string().min(1, 'CV ID is required'),
  jobId: z.string().optional(),
});

export type MatchingRequest = z.infer<typeof matchingRequestSchema>;
