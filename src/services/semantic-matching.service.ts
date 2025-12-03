// src/services/semantic-matching.service.ts

import { embed, cosineSimilarity } from 'ai';
import { gemini } from '../config/ai-providers';
import { logger } from '../utils/logger.util';
import { normalizeSkill } from '../utils/skill-synonyms';

const EMBEDDING_MODEL = 'text-embedding-004';
const DEFAULT_SIMILARITY_THRESHOLD = 0.75; // 75% similarity required for match

// Cache for embeddings to avoid re-computing
const embeddingCache = new Map<string, number[]>();

export interface SemanticMatch {
  cvSkill: string;
  jobSkill: string;
  similarity: number;
  matchType: 'exact' | 'synonym' | 'semantic';
}

export interface SemanticMatchResult {
  matches: SemanticMatch[];
  unmatchedJobSkills: string[];
  totalSimilarityScore: number;
}

/**
 * Semantic Matching Service
 * Story: Phase 3 Task 1 - Semantic similarity matching with embeddings
 *
 * Uses AI embeddings to find semantic similarities between skills.
 * Goes beyond exact string matching and synonym dictionaries.
 */
export const semanticMatchingService = {
  /**
   * Calculates semantic similarity between two skill strings using embeddings.
   *
   * @param skill1 - First skill to compare
   * @param skill2 - Second skill to compare
   * @returns Similarity score (0-1), where 1 is identical
   */
  async calculateSimilarity(skill1: string, skill2: string): Promise<number> {
    try {
      const embedding1 = await this.getEmbedding(skill1);
      const embedding2 = await this.getEmbedding(skill2);

      return cosineSimilarity(embedding1, embedding2);
    } catch (error: any) {
      logger.warn(`Failed to calculate similarity for "${skill1}" and "${skill2}": ${error.message}`);
      return 0;
    }
  },

  /**
   * Gets embedding for a skill, using cache if available.
   *
   * @param skill - Skill to get embedding for
   * @returns Embedding vector
   */
  async getEmbedding(skill: string): Promise<number[]> {
    const normalized = skill.toLowerCase().trim();

    // Check cache first
    if (embeddingCache.has(normalized)) {
      return embeddingCache.get(normalized)!;
    }

    try {
      const { embedding } = await embed({
        model: gemini.embedding(EMBEDDING_MODEL),
        value: normalized,
      });

      // Cache the result
      embeddingCache.set(normalized, embedding);

      return embedding;
    } catch (error: any) {
      logger.error(`Failed to get embedding for "${skill}": ${error.message}`);
      throw error;
    }
  },

  /**
   * Finds semantic matches between CV skills and job skills using embeddings.
   *
   * @param cvSkills - Skills from candidate's CV
   * @param jobSkills - Skills required by job posting
   * @param threshold - Minimum similarity threshold (0-1), default 0.75
   * @returns Semantic match results with similarity scores
   */
  async findSemanticMatches(
    cvSkills: string[],
    jobSkills: string[],
    threshold: number = DEFAULT_SIMILARITY_THRESHOLD
  ): Promise<SemanticMatchResult> {
    logger.info('Starting semantic matching', {
      cvSkillsCount: cvSkills.length,
      jobSkillsCount: jobSkills.length,
      threshold,
    });

    const matches: SemanticMatch[] = [];
    const matchedJobSkills = new Set<string>();

    // First pass: Check for exact matches and synonyms (fast)
    for (const cvSkill of cvSkills) {
      for (const jobSkill of jobSkills) {
        if (matchedJobSkills.has(jobSkill)) continue;

        // Exact match (case-insensitive)
        if (cvSkill.toLowerCase() === jobSkill.toLowerCase()) {
          matches.push({
            cvSkill,
            jobSkill,
            similarity: 1.0,
            matchType: 'exact',
          });
          matchedJobSkills.add(jobSkill);
          continue;
        }

        // Synonym match
        const normalizedCv = normalizeSkill(cvSkill);
        const normalizedJob = normalizeSkill(jobSkill);
        if (normalizedCv === normalizedJob && normalizedCv !== cvSkill.toLowerCase()) {
          matches.push({
            cvSkill,
            jobSkill,
            similarity: 0.95,
            matchType: 'synonym',
          });
          matchedJobSkills.add(jobSkill);
        }
      }
    }

    // Second pass: Semantic matching for unmatched job skills (slower, uses AI)
    const unmatchedJobSkills = jobSkills.filter(skill => !matchedJobSkills.has(skill));

    if (unmatchedJobSkills.length > 0) {
      logger.info(`Running semantic matching for ${unmatchedJobSkills.length} unmatched job skills`);

      for (const cvSkill of cvSkills) {
        for (const jobSkill of unmatchedJobSkills) {
          if (matchedJobSkills.has(jobSkill)) continue;

          const similarity = await this.calculateSimilarity(cvSkill, jobSkill);

          if (similarity >= threshold) {
            matches.push({
              cvSkill,
              jobSkill,
              similarity,
              matchType: 'semantic',
            });
            matchedJobSkills.add(jobSkill);
            logger.debug('Semantic match found', { cvSkill, jobSkill, similarity });
          }
        }
      }
    }

    const finalUnmatchedJobSkills = jobSkills.filter(skill => !matchedJobSkills.has(skill));

    // Calculate total similarity score (average of all matches)
    const totalSimilarityScore =
      matches.length > 0
        ? matches.reduce((sum, match) => sum + match.similarity, 0) / matches.length
        : 0;

    logger.info('Semantic matching completed', {
      totalMatches: matches.length,
      exactMatches: matches.filter(m => m.matchType === 'exact').length,
      synonymMatches: matches.filter(m => m.matchType === 'synonym').length,
      semanticMatches: matches.filter(m => m.matchType === 'semantic').length,
      unmatchedCount: finalUnmatchedJobSkills.length,
      averageSimilarity: totalSimilarityScore,
    });

    return {
      matches,
      unmatchedJobSkills: finalUnmatchedJobSkills,
      totalSimilarityScore,
    };
  },

  /**
   * Clears the embedding cache (useful for testing or memory management).
   */
  clearCache(): void {
    embeddingCache.clear();
    logger.info('Embedding cache cleared');
  },

  /**
   * Gets cache statistics (useful for monitoring).
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: embeddingCache.size,
      keys: Array.from(embeddingCache.keys()).slice(0, 10), // First 10 keys
    };
  },
};
