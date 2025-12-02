// src/services/MatchScoringService.ts

interface CVData {
  skills: string[];
  // Other CV data...
}

interface ExtractedJobData {
  keywords: string[];
  // Other extracted job data...
}

export class MatchScoringService {
  /**
   * Compares a user's CV data with extracted job data to identify matching and missing keywords.
   * @param cvData - The user's CV data.
   * @param extractedJobData - The extracted data from the job description.
   * @returns An object containing arrays of present and missing keywords.
   */
  public static compareCvToJob(cvData: CVData, extractedJobData: ExtractedJobData): { presentKeywords: string[], missingKeywords: string[] } {
    const presentKeywords = cvData.skills.filter(skill => extractedJobData.keywords.includes(skill));
    const missingKeywords = extractedJobData.keywords.filter(keyword => !cvData.skills.includes(keyword));

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
