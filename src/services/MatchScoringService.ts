// src/services/MatchScoringService.ts

import { ExtractedJobData } from './KeywordExtractionService';
import { normalizeSkill, normalizeSkillList } from '../utils/skill-synonyms';

interface CVData {
  skills: string[];
  // Other CV data...
}

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
}
