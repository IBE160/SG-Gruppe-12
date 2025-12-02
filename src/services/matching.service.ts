/**
 * Matching Service
 * Implements CV-Job Description Keyword Matching Algorithm
 *
 * Story: 3-3 CV-Job Description Keyword Matching Algorithm
 */

import { redis } from '../config/redis';
import { cvService } from './cv.service';
import { jobAnalysisService } from './job-analysis.service';
import { CvData, SkillEntry } from '../types/cv.types';
import { ExtractedJobData } from './KeywordExtractionService';
import {
  MatchResult,
  MatchedKeyword,
  MatchedSkill,
  GapAnalysis,
  KeywordMatch,
  SkillMatch,
  MatchingConfig,
} from '../types/matching.types';
import { NotFoundError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';

// Synonym dictionary for semantic matching
const SYNONYM_MAP: Record<string, string[]> = {
  // Programming Languages
  'javascript': ['js', 'ecmascript', 'es6', 'es2015'],
  'typescript': ['ts'],
  'python': ['py'],
  'c++': ['cpp', 'cplusplus'],
  'c#': ['csharp', 'c-sharp'],

  // Frameworks & Libraries
  'react': ['react.js', 'reactjs'],
  'angular': ['angular.js', 'angularjs'],
  'vue': ['vue.js', 'vuejs'],
  'node': ['node.js', 'nodejs'],
  'express': ['express.js', 'expressjs'],
  'next': ['next.js', 'nextjs'],

  // Databases
  'postgresql': ['postgres', 'psql'],
  'mongodb': ['mongo'],
  'sql': ['structured query language'],

  // Cloud & DevOps
  'aws': ['amazon web services'],
  'gcp': ['google cloud platform'],
  'docker': ['containerization'],
  'kubernetes': ['k8s'],

  // Soft Skills
  'communication': ['verbal communication', 'written communication', 'interpersonal skills'],
  'leadership': ['team leadership', 'leading teams', 'management'],
  'problem-solving': ['problem solving', 'analytical thinking', 'critical thinking'],
  'teamwork': ['collaboration', 'team player', 'working in teams'],

  // General Tech
  'frontend': ['front-end', 'front end', 'ui development'],
  'backend': ['back-end', 'back end', 'server-side'],
  'fullstack': ['full-stack', 'full stack'],
  'api': ['rest api', 'restful api', 'web api'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'ci cd'],
};

// Default matching configuration
const DEFAULT_MATCHING_CONFIG: MatchingConfig = {
  exactMatchWeight: 1.0,
  semanticMatchWeight: 0.8,
  synonymMatchWeight: 0.9,
  proficiencyBonus: {
    beginner: 0.5,
    intermediate: 0.75,
    advanced: 0.9,
    expert: 1.0,
  },
};

/**
 * Normalizes a keyword for matching (lowercase, trim, remove special chars)
 */
function normalizeKeyword(keyword: string): string {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s+#]/g, '') // Keep letters, numbers, spaces, +, #
    .replace(/\s+/g, ' '); // Collapse multiple spaces
}

/**
 * Checks if two keywords match exactly (after normalization)
 */
function isExactMatch(keyword1: string, keyword2: string): boolean {
  return normalizeKeyword(keyword1) === normalizeKeyword(keyword2);
}

/**
 * Checks if two keywords are synonyms
 */
function isSynonymMatch(keyword1: string, keyword2: string): boolean {
  const normalized1 = normalizeKeyword(keyword1);
  const normalized2 = normalizeKeyword(keyword2);

  // Check if keyword1 has synonyms that match keyword2
  if (SYNONYM_MAP[normalized1]?.some(syn => normalizeKeyword(syn) === normalized2)) {
    return true;
  }

  // Check if keyword2 has synonyms that match keyword1
  if (SYNONYM_MAP[normalized2]?.some(syn => normalizeKeyword(syn) === normalized1)) {
    return true;
  }

  return false;
}

/**
 * Checks if two keywords match semantically (partial match)
 */
function isSemanticMatch(keyword1: string, keyword2: string): boolean {
  const normalized1 = normalizeKeyword(keyword1);
  const normalized2 = normalizeKeyword(keyword2);

  // Check if one keyword contains the other
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true;
  }

  return false;
}

/**
 * Generates a cache key for match results
 */
function generateMatchCacheKey(cvId: string, jobId: string): string {
  return `match:${cvId}:${jobId}`;
}

/**
 * Extracts all keywords from CV data
 */
function extractCVKeywords(cvData: CvData): string[] {
  const keywords: Set<string> = new Set();

  // Extract from skills
  cvData.skills?.forEach(skill => {
    keywords.add(skill.name);
    skill.keywords?.forEach(kw => keywords.add(kw));
  });

  // Extract from experience titles and descriptions
  cvData.experience?.forEach(exp => {
    keywords.add(exp.title);
    if (exp.description) {
      // Extract key technical terms from description
      const words = exp.description.split(/\s+/);
      words.forEach(word => {
        const normalized = normalizeKeyword(word);
        // Only include meaningful technical terms (length > 2)
        if (normalized.length > 2) {
          keywords.add(word);
        }
      });
    }
  });

  // Extract from education
  cvData.education?.forEach(edu => {
    keywords.add(edu.degree);
    if (edu.fieldOfStudy) {
      keywords.add(edu.fieldOfStudy);
    }
  });

  // Extract from summary
  if (cvData.summary) {
    const words = cvData.summary.split(/\s+/);
    words.forEach(word => {
      const normalized = normalizeKeyword(word);
      if (normalized.length > 2) {
        keywords.add(word);
      }
    });
  }

  return Array.from(keywords);
}

/**
 * Compares keywords between CV and job description
 */
function compareKeywords(cvKeywords: string[], jobKeywords: string[], config: MatchingConfig): KeywordMatch[] {
  const matches: KeywordMatch[] = [];
  const matchedJobKeywords = new Set<string>();

  for (const jobKeyword of jobKeywords) {
    for (const cvKeyword of cvKeywords) {
      // Check exact match
      if (isExactMatch(cvKeyword, jobKeyword)) {
        matches.push({
          keyword: jobKeyword,
          matchType: 'exact',
          confidence: config.exactMatchWeight,
        });
        matchedJobKeywords.add(jobKeyword);
        break;
      }

      // Check synonym match
      if (isSynonymMatch(cvKeyword, jobKeyword)) {
        matches.push({
          keyword: jobKeyword,
          matchType: 'synonym',
          confidence: config.synonymMatchWeight,
        });
        matchedJobKeywords.add(jobKeyword);
        break;
      }

      // Check semantic match
      if (isSemanticMatch(cvKeyword, jobKeyword)) {
        matches.push({
          keyword: jobKeyword,
          matchType: 'semantic',
          confidence: config.semanticMatchWeight,
        });
        matchedJobKeywords.add(jobKeyword);
        break;
      }
    }
  }

  return matches;
}

/**
 * Matches skills between CV and job description
 */
function matchSkills(cvSkills: SkillEntry[], jobSkills: string[], config: MatchingConfig): SkillMatch[] {
  const matches: SkillMatch[] = [];

  for (const jobSkill of jobSkills) {
    for (const cvSkill of cvSkills) {
      if (isExactMatch(cvSkill.name, jobSkill) || isSynonymMatch(cvSkill.name, jobSkill)) {
        const proficiencyBonus = cvSkill.proficiency
          ? config.proficiencyBonus[cvSkill.proficiency]
          : 0.5;

        const matchStrength = Math.round(proficiencyBonus * 100);

        matches.push({
          skillName: jobSkill,
          cvProficiency: cvSkill.proficiency,
          jobRequirement: jobSkill,
          matchStrength,
        });
        break;
      }
    }
  }

  return matches;
}

/**
 * Analyzes gaps between CV and job requirements
 */
function analyzeGaps(cvData: CvData, jobData: ExtractedJobData, matchedSkills: MatchedSkill[]): GapAnalysis {
  const matchedSkillNames = new Set(matchedSkills.map(m => normalizeKeyword(m.skillName)));

  // Identify missing skills
  const missingSkills = jobData.skills.filter(
    skill => !matchedSkillNames.has(normalizeKeyword(skill))
  );

  // Identify missing qualifications
  const cvQualifications = new Set(
    cvData.education?.map(edu => normalizeKeyword(edu.degree)) || []
  );

  const missingQualifications = jobData.qualifications.filter(
    qual => !Array.from(cvQualifications).some(cvQual =>
      isExactMatch(cvQual, qual) || isSynonymMatch(cvQual, qual) || isSemanticMatch(cvQual, qual)
    )
  );

  // Generate recommendations
  const recommendations: string[] = [];

  if (missingSkills.length > 0) {
    recommendations.push(`Consider gaining experience in: ${missingSkills.slice(0, 5).join(', ')}`);
  }

  if (missingQualifications.length > 0) {
    recommendations.push(`Consider obtaining qualifications in: ${missingQualifications.slice(0, 3).join(', ')}`);
  }

  return {
    missingSkills,
    missingQualifications,
    recommendations,
  };
}

/**
 * Calculates overall match score (0-100)
 */
function calculateMatchScore(
  matchedKeywords: MatchedKeyword[],
  matchedSkills: MatchedSkill[],
  totalJobKeywords: number,
  totalJobSkills: number
): number {
  if (totalJobKeywords === 0 && totalJobSkills === 0) {
    return 0;
  }

  // Calculate keyword match percentage
  const keywordScore = totalJobKeywords > 0
    ? (matchedKeywords.length / totalJobKeywords) * 100
    : 0;

  // Calculate skill match percentage (weighted by match strength)
  const skillScore = totalJobSkills > 0
    ? (matchedSkills.reduce((sum, match) => sum + match.matchStrength, 0) / (totalJobSkills * 100)) * 100
    : 0;

  // Weight: 60% skills, 40% keywords
  const overallScore = (skillScore * 0.6) + (keywordScore * 0.4);

  return Math.round(Math.min(100, overallScore));
}

/**
 * Matching Service
 */
export const matchingService = {
  /**
   * Matches a CV to a job description
   */
  async matchCVToJob(userId: string, cvId: string, jobId: string): Promise<MatchResult> {
    const startTime = Date.now();
    const cacheKey = generateMatchCacheKey(cvId, jobId);

    try {
      // Check cache first
      const cachedResult = await redis.get(cacheKey);
      if (cachedResult) {
        logger.info(`Match result retrieved from cache for CV ${cvId} and Job ${jobId}`);
        const result = JSON.parse(cachedResult) as MatchResult;
        result.metadata.processingTimeMs = Date.now() - startTime;
        return result;
      }

      // Fetch CV data
      const cvData = await cvService.getCVById(userId, parseInt(cvId));
      if (!cvData) {
        throw new NotFoundError('CV not found');
      }

      // Fetch job analysis data
      const jobAnalysisData = await jobAnalysisService.getJobAnalysisById(jobId, userId);
      if (!jobAnalysisData) {
        throw new NotFoundError('Job analysis not found');
      }

      const jobData = jobAnalysisData.extractedData;

      // Extract CV keywords
      const cvKeywords = extractCVKeywords(cvData);

      // Compare keywords
      const keywordMatches = compareKeywords(cvKeywords, jobData.keywords, DEFAULT_MATCHING_CONFIG);

      // Match skills
      const skillMatches = matchSkills(cvData.skills || [], jobData.skills, DEFAULT_MATCHING_CONFIG);

      // Convert to MatchedKeyword and MatchedSkill format
      const matchedKeywords: MatchedKeyword[] = keywordMatches.map(match => ({
        keyword: match.keyword,
        source: 'job',
        matchType: match.matchType,
        confidence: match.confidence,
      }));

      const matchedSkills: MatchedSkill[] = skillMatches;

      // Identify missing keywords and skills
      const matchedKeywordSet = new Set(matchedKeywords.map(k => normalizeKeyword(k.keyword)));
      const missingKeywords = jobData.keywords.filter(
        kw => !matchedKeywordSet.has(normalizeKeyword(kw))
      );

      const matchedSkillSet = new Set(matchedSkills.map(s => normalizeKeyword(s.skillName)));
      const missingSkills = jobData.skills.filter(
        skill => !matchedSkillSet.has(normalizeKeyword(skill))
      );

      // Perform gap analysis
      const gapAnalysis = analyzeGaps(cvData, jobData, matchedSkills);

      // Calculate match score
      const matchScore = calculateMatchScore(
        matchedKeywords,
        matchedSkills,
        jobData.keywords.length,
        jobData.skills.length
      );

      // Build result
      const result: MatchResult = {
        matchScore,
        matchedKeywords,
        matchedSkills,
        missingKeywords,
        missingSkills,
        gapAnalysis,
        metadata: {
          cvId,
          jobId,
          analyzedAt: new Date().toISOString(),
          cacheKey,
          processingTimeMs: Date.now() - startTime,
        },
      };

      // Cache result for 7 days
      await redis.setex(cacheKey, 60 * 60 * 24 * 7, JSON.stringify(result));

      logger.info(`Match completed for CV ${cvId} and Job ${jobId}. Score: ${matchScore}%`);

      return result;
    } catch (error: any) {
      logger.error(`Error matching CV ${cvId} to Job ${jobId}: ${error.message}`, error);
      throw error;
    }
  },

  /**
   * Invalidates cache for a specific CV (called when CV is updated)
   */
  async invalidateCVCache(cvId: string): Promise<void> {
    try {
      // Find all cache keys for this CV
      const pattern = `match:${cvId}:*`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info(`Invalidated ${keys.length} cache entries for CV ${cvId}`);
      }
    } catch (error: any) {
      logger.error(`Error invalidating cache for CV ${cvId}: ${error.message}`, error);
    }
  },
};
