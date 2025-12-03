// src/services/MatchScoringService.ts

import { ExtractedJobData } from './KeywordExtractionService';
import { normalizeSkill, normalizeSkillList } from '../utils/skill-synonyms';
import { expandSkillsWithImplied, doesSkillImply } from '../utils/skill-taxonomy';
import { semanticMatchingService } from './semantic-matching.service';
import { logger } from '../utils/logger.util';

interface CVData {
  skills: string[];
  // Other CV data...
}

// Feature flags for advanced matching (can be controlled via env vars)
const ENABLE_SEMANTIC_MATCHING = process.env.ENABLE_SEMANTIC_MATCHING !== 'false'; // Enabled by default
const ENABLE_SKILL_TAXONOMY = process.env.ENABLE_SKILL_TAXONOMY !== 'false'; // Enabled by default

export class MatchScoringService {
  /**
   * Compares a user's CV data with extracted job data to identify matching and missing keywords.
   * Uses synonym matching to recognize equivalent terms (e.g., JavaScript = JS = Node.js).
   *
   * @param cvData - The user's CV data.
   * @param extractedJobData - The extracted data from the job description.
   * @returns An object containing arrays of present and missing keywords (in canonical form).
   */
  public static compareCvToJob(cvData: CVData, extractedJobData: ExtractedJobData): { presentKeywords: string[], missingKeywords: string[] } {
    // Normalize CV skills to canonical forms (JavaScript, JS, Node.js → "javascript")
    const cvSkillsNormalized = normalizeSkillList(cvData.skills);

    // Combine all job requirements and normalize
    const jobKeywords = [
      ...extractedJobData.keywords,
      ...extractedJobData.skills,
      ...extractedJobData.qualifications,
      ...extractedJobData.responsibilities,
    ];
    const jobKeywordsNormalized = normalizeSkillList(jobKeywords);

    // Find matches using normalized skills
    const presentKeywords = jobKeywordsNormalized.filter(jobKeyword =>
      cvSkillsNormalized.includes(jobKeyword)
    );

    const missingKeywords = jobKeywordsNormalized.filter(
      jobKeyword => !cvSkillsNormalized.includes(jobKeyword)
    );

    return { presentKeywords, missingKeywords };
  }

  /**
   * Calculates a match score based on the number of present and missing keywords.
   * @param presentKeywords - An array of keywords found in both the CV and job description.
   * @param missingKeywords - An array of keywords found in the job description but not in the CV.
   * @returns A match score between 0 and 100.
   */
  public static calculateMatchScore(presentKeywords: string[], missingKeywords: string[]): number {
    const totalKeywords = presentKeywords.length + missingKeywords.length;
    if (totalKeywords === 0) {
      return 0;
    }
    const score = Math.round((presentKeywords.length / totalKeywords) * 100);
    return Math.min(100, score);
  }

  /**
   * Advanced CV-to-Job comparison using skill taxonomy.
   * Phase 3 Task 3: Expands CV skills to include implied skills.
   *
   * @param cvData - The user's CV data
   * @param extractedJobData - The extracted data from the job description
   * @returns Object with present and missing keywords, plus taxonomy insights
   */
  public static compareCvToJobWithTaxonomy(cvData: CVData, extractedJobData: ExtractedJobData): {
    presentKeywords: string[];
    missingKeywords: string[];
    impliedMatches: Array<{ cvSkill: string; jobSkill: string }>;
  } {
    if (!ENABLE_SKILL_TAXONOMY) {
      const basic = this.compareCvToJob(cvData, extractedJobData);
      return { ...basic, impliedMatches: [] };
    }

    logger.info('Using skill taxonomy for advanced matching');

    // Expand CV skills to include implied skills
    const expandedCvSkills = expandSkillsWithImplied(cvData.skills);
    const expandedCvSkillsNormalized = normalizeSkillList(expandedCvSkills);

    // Combine all job requirements
    const jobKeywords = [
      ...extractedJobData.keywords,
      ...extractedJobData.skills,
      ...extractedJobData.qualifications,
      ...extractedJobData.responsibilities,
    ];
    const jobKeywordsNormalized = normalizeSkillList(jobKeywords);

    // Find direct matches
    const presentKeywords = jobKeywordsNormalized.filter(jobKeyword =>
      expandedCvSkillsNormalized.includes(jobKeyword)
    );

    // Find implied matches (e.g., CV has "React" which implies "JavaScript")
    const impliedMatches: Array<{ cvSkill: string; jobSkill: string }> = [];
    for (const cvSkill of cvData.skills) {
      for (const jobKeyword of jobKeywords) {
        if (doesSkillImply(cvSkill, jobKeyword)) {
          impliedMatches.push({ cvSkill, jobSkill: jobKeyword });
        }
      }
    }

    const missingKeywords = jobKeywordsNormalized.filter(
      jobKeyword => !expandedCvSkillsNormalized.includes(jobKeyword)
    );

    logger.info('Taxonomy matching completed', {
      originalCvSkills: cvData.skills.length,
      expandedCvSkills: expandedCvSkills.length,
      impliedMatches: impliedMatches.length,
      presentKeywords: presentKeywords.length,
      missingKeywords: missingKeywords.length,
    });

    return { presentKeywords, missingKeywords, impliedMatches };
  }

  /**
   * Advanced CV-to-Job comparison using semantic matching with embeddings.
   * Phase 3 Task 1: Uses AI embeddings to find semantic similarities.
   *
   * @param cvData - The user's CV data
   * @param extractedJobData - The extracted data from the job description
   * @returns Promise with match results including semantic matches
   */
  public static async compareCvToJobWithSemantics(cvData: CVData, extractedJobData: ExtractedJobData): Promise<{
    presentKeywords: string[];
    missingKeywords: string[];
    semanticMatches: Array<{ cvSkill: string; jobSkill: string; similarity: number }>;
    averageSimilarity: number;
  }> {
    if (!ENABLE_SEMANTIC_MATCHING) {
      logger.info('Semantic matching disabled, using basic matching');
      const basic = this.compareCvToJob(cvData, extractedJobData);
      return { ...basic, semanticMatches: [], averageSimilarity: 0 };
    }

    logger.info('Using semantic matching with embeddings');

    // Combine all job requirements
    const jobSkills = [
      ...extractedJobData.skills,
      ...extractedJobData.keywords,
    ];

    // Run semantic matching
    const semanticResult = await semanticMatchingService.findSemanticMatches(
      cvData.skills,
      jobSkills,
      0.75 // 75% similarity threshold
    );

    // Extract matched job skills from semantic results
    const matchedJobSkills = new Set(
      semanticResult.matches.map(m => normalizeSkill(m.jobSkill))
    );

    // Get all job keywords for scoring
    const allJobKeywords = [
      ...extractedJobData.keywords,
      ...extractedJobData.skills,
      ...extractedJobData.qualifications,
      ...extractedJobData.responsibilities,
    ];
    const jobKeywordsNormalized = normalizeSkillList(allJobKeywords);

    // Present keywords are those that were matched (exact, synonym, or semantic)
    const presentKeywords = jobKeywordsNormalized.filter(keyword =>
      matchedJobSkills.has(keyword)
    );

    // Missing keywords are those that weren't matched
    const missingKeywords = jobKeywordsNormalized.filter(
      keyword => !matchedJobSkills.has(keyword)
    );

    // Extract just semantic matches (not exact or synonym)
    const semanticMatches = semanticResult.matches
      .filter(m => m.matchType === 'semantic')
      .map(m => ({
        cvSkill: m.cvSkill,
        jobSkill: m.jobSkill,
        similarity: m.similarity,
      }));

    logger.info('Semantic matching completed', {
      totalMatches: semanticResult.matches.length,
      semanticMatches: semanticMatches.length,
      averageSimilarity: semanticResult.totalSimilarityScore,
      presentKeywords: presentKeywords.length,
      missingKeywords: missingKeywords.length,
    });

    return {
      presentKeywords,
      missingKeywords,
      semanticMatches,
      averageSimilarity: semanticResult.totalSimilarityScore,
    };
  }
}
