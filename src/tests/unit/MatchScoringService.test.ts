// src/tests/unit/MatchScoringService.test.ts
import { MatchScoringService } from '../../services/MatchScoringService';

describe('MatchScoringService', () => {
  describe('compareCvToJob', () => {
    it('should identify present and missing keywords', () => {
      const cvData = { skills: ['TypeScript', 'React', 'Node.js'] };
      const extractedJobData = { keywords: ['React', 'Node.js', 'GraphQL'], skills: [], qualifications: [], responsibilities: [] };
      const { presentKeywords, missingKeywords } = MatchScoringService.compareCvToJob(cvData, extractedJobData);
      expect(presentKeywords).toEqual(['React', 'Node.js']);
      expect(missingKeywords).toEqual(['GraphQL']);
    });

    it('should handle no matching keywords', () => {
      const cvData = { skills: ['TypeScript', 'React'] };
      const extractedJobData = { keywords: ['GraphQL', 'Apollo'], skills: [], qualifications: [], responsibilities: [] };
      const { presentKeywords, missingKeywords } = MatchScoringService.compareCvToJob(cvData, extractedJobData);
      expect(presentKeywords).toEqual([]);
      expect(missingKeywords).toEqual(['GraphQL', 'Apollo']);
    });

    it('should handle all keywords matching', () => {
      const cvData = { skills: ['TypeScript', 'React', 'Node.js'] };
      const extractedJobData = { keywords: ['React', 'Node.js'], skills: [], qualifications: [], responsibilities: [] };
      const { presentKeywords, missingKeywords } = MatchScoringService.compareCvToJob(cvData, extractedJobData);
      expect(presentKeywords).toEqual(['React', 'Node.js']);
      expect(missingKeywords).toEqual([]);
    });
  });

  describe('calculateMatchScore', () => {
    it('should calculate the match score correctly', () => {
      const presentKeywords = ['React', 'Node.js'];
      const missingKeywords = ['GraphQL'];
      const score = MatchScoringService.calculateMatchScore(presentKeywords, missingKeywords);
      expect(score).toBe(67); // (2 / 3) * 100
    });

    it('should return 100 if all keywords are present', () => {
      const presentKeywords = ['React', 'Node.js'];
      const missingKeywords: string[] = [];
      const score = MatchScoringService.calculateMatchScore(presentKeywords, missingKeywords);
      expect(score).toBe(100);
    });

    it('should return 0 if no keywords are present', () => {
      const presentKeywords: string[] = [];
      const missingKeywords = ['GraphQL'];
      const score = MatchScoringService.calculateMatchScore(presentKeywords, missingKeywords);
      expect(score).toBe(0);
    });

    it('should return 0 if there are no keywords', () => {
      const presentKeywords: string[] = [];
      const missingKeywords: string[] = [];
      const score = MatchScoringService.calculateMatchScore(presentKeywords, missingKeywords);
      expect(score).toBe(0);
    });
  });
});
