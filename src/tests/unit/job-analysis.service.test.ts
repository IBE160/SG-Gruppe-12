// src/tests/unit/job-analysis.service.test.ts
import { jobAnalysisService } from '../../services/job-analysis.service';
import { cvRepository } from '../../repositories/cv.repository';
import { KeywordExtractionService } from '../../services/KeywordExtractionService';
import { MatchScoringService } from '../../services/MatchScoringService';

jest.mock('../../repositories/cv.repository');
jest.mock('../../services/KeywordExtractionService');
jest.mock('../../services/MatchScoringService');

describe('JobAnalysisService', () => {
  describe('analyzeJobDescription orchestration', () => {
    it('should orchestrate the analysis process correctly', async () => {
      const mockCvData = { user_id: 'user1', skills: ['TypeScript', 'React'] };
      const mockExtractedData = { keywords: ['React', 'GraphQL'], skills: [], qualifications: [], responsibilities: [] };
      const mockComparisonResult = { presentKeywords: ['React'], missingKeywords: ['GraphQL'] };
      const mockMatchScore = 50;

      (cvRepository.findById as jest.Mock).mockResolvedValue(mockCvData);
      (KeywordExtractionService.extractKeywords as jest.Mock).mockResolvedValue(mockExtractedData);
      (MatchScoringService.compareCvToJob as jest.Mock).mockReturnValue(mockComparisonResult);
      (MatchScoringService.calculateMatchScore as jest.Mock).mockReturnValue(mockMatchScore);

      const result = await jobAnalysisService.analyzeJobDescription('user1', 'some job description', '123');

      expect(cvRepository.findById).toHaveBeenCalledWith(123);
      expect(KeywordExtractionService.extractKeywords).toHaveBeenCalledWith('some job description');
      expect(MatchScoringService.compareCvToJob).toHaveBeenCalledWith({ skills: mockCvData.skills }, mockExtractedData);
      expect(MatchScoringService.calculateMatchScore).toHaveBeenCalledWith(mockComparisonResult.presentKeywords, mockComparisonResult.missingKeywords);
      
      expect(result.matchScore).toBe(mockMatchScore);
      expect(result.presentKeywords).toEqual(mockComparisonResult.presentKeywords);
      expect(result.missingKeywords).toEqual(mockComparisonResult.missingKeywords);
    });
  });
});
