/**
 * Matching Types
 * Types for CV-Job Description Keyword Matching
 *
 * Story: 3-3 CV-Job Description Keyword Matching Algorithm
 */

/**
 * Main result returned from CV-Job matching algorithm
 */
export interface MatchResult {
  matchScore: number; // Overall match percentage (0-100)
  matchedKeywords: MatchedKeyword[];
  matchedSkills: MatchedSkill[];
  missingKeywords: string[];
  missingSkills: string[];
  gapAnalysis: GapAnalysis;
  metadata: MatchMetadata;
}

/**
 * Represents a keyword that was matched between CV and job
 */
export interface MatchedKeyword {
  keyword: string; // The matched keyword
  source: 'cv' | 'job'; // Where it was found
  matchType: 'exact' | 'semantic' | 'synonym'; // Type of match
  confidence: number; // Confidence score (0-1)
}

/**
 * Represents a skill that was matched between CV and job
 */
export interface MatchedSkill {
  skillName: string; // Name of the skill
  cvProficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'; // User's proficiency level
  jobRequirement: string; // What the job requires
  matchStrength: number; // How well it matches (0-100)
}

/**
 * Gap analysis identifying what's missing from the CV
 */
export interface GapAnalysis {
  missingSkills: string[]; // Skills required but not in CV
  missingQualifications: string[]; // Qualifications required but not in CV
  experienceGap?: string; // Description of experience gap if any
  educationGap?: string; // Description of education gap if any
  recommendations: string[]; // Actionable recommendations for improvement
}

/**
 * Metadata about the matching operation
 */
export interface MatchMetadata {
  cvId: string; // ID of the CV being matched
  jobId: string; // ID of the job being matched against
  analyzedAt: string; // ISO timestamp of when analysis was performed
  cacheKey?: string; // Redis cache key if cached
  processingTimeMs?: number; // Time taken to process
}

/**
 * Request payload for matching endpoint
 */
export interface MatchingRequest {
  cvId: string; // ID of CV to match
  jobId: string; // ID of job to match against
}

/**
 * Internal type for keyword comparison results
 */
export interface KeywordMatch {
  keyword: string;
  matchType: 'exact' | 'semantic' | 'synonym';
  confidence: number;
}

/**
 * Internal type for skill comparison results
 */
export interface SkillMatch {
  skillName: string;
  cvProficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  jobRequirement: string;
  matchStrength: number;
}

/**
 * Configuration for semantic matching
 */
export interface MatchingConfig {
  exactMatchWeight: number; // Weight for exact matches (default: 1.0)
  semanticMatchWeight: number; // Weight for semantic matches (default: 0.8)
  synonymMatchWeight: number; // Weight for synonym matches (default: 0.9)
  proficiencyBonus: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
}
