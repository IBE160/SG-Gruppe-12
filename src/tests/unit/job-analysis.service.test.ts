// src/tests/unit/job-analysis.service.test.ts
import { jobAnalysisService } from '../../services/job-analysis.service';
import { cvRepository } from '../../repositories/cv.repository';
import { KeywordExtractionService } from '../../services/KeywordExtractionService';
import { MatchScoringService } from '../../services/MatchScoringService';
import { CvData } from '../../types/cv.types';
import { ATSAssessment } from '../../types/job.types';

jest.mock('../../repositories/cv.repository');
jest.mock('../../services/KeywordExtractionService');
jest.mock('../../services/MatchScoringService');

describe('JobAnalysisService', () => {
  describe('calculateATSScore', () => {
    // Mock CV data for testing
    const mockCV: CvData = {
      personal_info: { name: 'Test User', email: 'test@example.com', phone: '123-456-7890', address: '123 Test St' },
      education: [{ degree: 'MSc', institution: 'University', start_date: '2020-01-01', end_date: '2022-12-31' }],
      experience: [{ title: 'Developer', company: 'Tech Corp', start_date: '2022-01-01', end_date: 'present', description: 'Developed features, increased efficiency by 15%' }],
      skills: [{ name: 'TypeScript' }, { name: 'React' }, { name: 'Node.js' }], // Skills should be SkillEntry[]
      languages: [{ name: 'English' }],
    };

    it('should return 100 for a perfect match with full CV and all keywords present', () => {
      const presentKeywords = ['TypeScript', 'React'];
      const missingKeywords: string[] = [];
      const result = jobAnalysisService.calculateATSScore(presentKeywords, missingKeywords, mockCV);
      expect(result.score).toBe(100);
      expect(result.qualitativeRating).toBe('Excellent');
      expect(result.suggestions).toHaveLength(0);
      expect(result.breakdown).toEqual({
        keywordDensityScore: 100,
        formattingScore: 100,
        sectionCompletenessScore: 100,
        quantifiableAchievementsScore: 100,
      });
    });

    it('should return a high score with some missing keywords but strong CV', () => {
      const presentKeywords = ['TypeScript', 'React'];
      const missingKeywords = ['GraphQL', 'AWS'];
      const result = jobAnalysisService.calculateATSScore(presentKeywords, missingKeywords, mockCV);
      // Expected scores based on weights:
      // Keyword Presence: (2/4) * 100 = 50. Weighted: 50 * 0.4 = 20
      // Formatting Simplicity: 100. Weighted: 100 * 0.3 = 30
      // Section Completeness: 100. Weighted: 100 * 0.2 = 20
      // Quantifiable Achievements: 100. Weighted: 100 * 0.1 = 10
      // Total: 20 + 30 + 20 + 10 = 80
      expect(result.score).toBe(80);
      expect(result.qualitativeRating).toBe('Good');
      expect(result.suggestions).toContain('Add or rephrase experience to include keywords like: GraphQL, AWS');
      expect(result.breakdown).toEqual({
        keywordDensityScore: 50,
        formattingScore: 100,
        sectionCompletenessScore: 100,
        quantifiableAchievementsScore: 100,
      });
    });

    it('should return a fair score for significant missing keywords', () => {
      const presentKeywords = ['React'];
      const missingKeywords = ['TypeScript', 'Node.js', 'AWS', 'GraphQL'];
      const result = jobAnalysisService.calculateATSScore(presentKeywords, missingKeywords, mockCV);
      // Keyword Presence: (1/5) * 100 = 20. Weighted: 20 * 0.4 = 8
      // Formatting Simplicity: 100. Weighted: 100 * 0.3 = 30
      // Section Completeness: 100. Weighted: 100 * 0.2 = 20
      // Quantifiable Achievements: 100. Weighted: 100 * 0.1 = 10
      // Total: 8 + 30 + 20 + 10 = 68
      expect(result.score).toBe(68);
      expect(result.qualitativeRating).toBe('Fair');
      expect(result.suggestions).toContain('Add or rephrase experience to include keywords like: TypeScript, Node.js, AWS');
      expect(result.breakdown).toEqual({
        keywordDensityScore: 20,
        formattingScore: 100,
        sectionCompletenessScore: 100,
        quantifiableAchievementsScore: 100,
      });
    });

    it('should penalize for incomplete sections', () => {
      const cvWithoutExp: CvData = {
        personal_info: { name: 'Test User', email: 'test@example.com' },
        education: [{ degree: 'BSc', institution: 'Uni', start_date: '2018-01-01', end_date: '2022-01-01' }],
        experience: [], // Missing Experience
        skills: [{ name: 'JavaScript' }],
        languages: [],
      };
      const presentKeywords = ['JavaScript'];
      const missingKeywords: string[] = [];
      const result = jobAnalysisService.calculateATSScore(presentKeywords, missingKeywords, cvWithoutExp);
      // Keyword Presence: (1/1) * 100 = 100. Weighted: 100 * 0.4 = 40
      // Formatting Simplicity: 50 (due to missing experience). Weighted: 50 * 0.3 = 15
      // Section Completeness: (3/4) * 100 = 75. Weighted: 75 * 0.2 = 15
      // Quantifiable Achievements: 0 (no experience). Weighted: 0 * 0.1 = 0
      // Total: 40 + 15 + 15 + 0 = 70
      expect(result.score).toBe(70);
      expect(result.qualitativeRating).toBe('Fair');
      expect(result.suggestions).toContain("Ensure all key sections (Personal Info, Education, Experience, Skills) are complete and well-structured.");
      expect(result.suggestions).toContain("Fill out all relevant sections of your CV (e.g., summary, awards) for higher completeness.");
      expect(result.breakdown).toEqual({
        keywordDensityScore: 100,
        formattingScore: 50,
        sectionCompletenessScore: 75,
        quantifiableAchievementsScore: 0,
      });
    });

    it('should suggest adding quantifiable achievements if none found', () => {
      const cvWithoutQuantifiable: CvData = {
        personal_info: { name: 'Test User', email: 'test@example.com', phone: '123-456-7890', address: '123 Test St' },
        education: [{ degree: 'MSc', institution: 'University', start_date: '2020-01-01', end_date: '2022-12-31' }],
        experience: [{ title: 'Developer', company: 'Tech Corp', start_date: '2022-01-01', end_date: 'present', description: 'Developed features for clients' }], // No numbers
        skills: [{ name: 'TypeScript' }, { name: 'React' }],
        languages: [{ name: 'English' }],
      };
      const presentKeywords = ['TypeScript'];
      const missingKeywords: string[] = [];
      const result = jobAnalysisService.calculateATSScore(presentKeywords, missingKeywords, cvWithoutQuantifiable);
      // Keyword Presence: (1/1) * 100 = 100. Weighted: 100 * 0.4 = 40
      // Formatting Simplicity: 100. Weighted: 100 * 0.3 = 30
      // Section Completeness: 100. Weighted: 100 * 0.2 = 20
      // Quantifiable Achievements: 0. Weighted: 0 * 0.1 = 0
      // Total: 40 + 30 + 20 + 0 = 90
      expect(result.score).toBe(90);
      expect(result.qualitativeRating).toBe('Excellent');
      expect(result.suggestions).toContain("Include quantifiable achievements (e.g., 'increased sales by 15%') in your experience descriptions.");
      expect(result.breakdown).toEqual({
        keywordDensityScore: 100,
        formattingScore: 100,
        sectionCompletenessScore: 100,
        quantifiableAchievementsScore: 0,
      });
    });

    it('should handle zero total keywords gracefully', () => {
      const presentKeywords: string[] = [];
      const missingKeywords: string[] = [];
      const result = jobAnalysisService.calculateATSScore(presentKeywords, missingKeywords, mockCV);
      // Keyword Presence: 0. Weighted: 0 * 0.4 = 0
      // Formatting Simplicity: 100. Weighted: 100 * 0.3 = 30
      // Section Completeness: 100. Weighted: 100 * 0.2 = 20
      // Quantifiable Achievements: 100. Weighted: 100 * 0.1 = 10
      // Total: 0 + 30 + 20 + 10 = 60
      expect(result.score).toBe(60);
      expect(result.qualitativeRating).toBe('Fair');
      expect(result.suggestions).toHaveLength(0); // No keyword suggestions
      expect(result.breakdown).toEqual({
        keywordDensityScore: 0,
        formattingScore: 100,
        sectionCompletenessScore: 100,
        quantifiableAchievementsScore: 100,
      });
    });
  }); // This is the missing brace
  
  describe('analyzeJobDescription orchestration', () => {
    const mockExtractedData = { keywords: ['React', 'GraphQL'], skills: [], qualifications: [], responsibilities: [] };
    const mockComparisonResult = { presentKeywords: ['React'], missingKeywords: ['GraphQL'] };
    const mockMatchScore = 50;
    const mockAtsAssessment: ATSAssessment = {
      score: 75,
      suggestions: ['Improve formatting'],
      qualitativeRating: 'Good',
      breakdown: {
        keywordDensityScore: 50,
        formattingScore: 100,
        sectionCompletenessScore: 100,
        quantifiableAchievementsScore: 100,
      }
    };

    const mockPrismaCvEntity = { // This should match Prisma CV entity structure
      user_id: 'user1',
      id: 1,
      personal_info: { name: 'Test User', email: 'test@example.com', phone: '123-456-7890', address: '123 Test St' },
      education: [],
      experience: [],
      skills: [],
      languages: [],
      created_at: new Date(),
      updated_at: new Date(),
      title: null,
      file_path: null,
      summary: null,
    };

    // Transformed CvData as expected by calculateATSScore
    const expectedCvDataForATS: CvData = {
        personal_info: { name: 'Test User', email: 'test@example.com', phone: '123-456-7890', address: '123 Test St' },
        education: [],
        experience: [],
        skills: [],
        languages: [],
        title: undefined,
        file_path: undefined,
        summary: undefined,
    };

    beforeEach(() => {
      (cvRepository.findById as jest.Mock).mockResolvedValue(mockPrismaCvEntity);
      (KeywordExtractionService.extractKeywords as jest.Mock).mockResolvedValue(mockExtractedData);
      (MatchScoringService.compareCvToJob as jest.Mock).mockReturnValue(mockComparisonResult);
      (MatchScoringService.calculateMatchScore as jest.Mock).mockReturnValue(mockMatchScore);
      jest.spyOn(jobAnalysisService, 'calculateATSScore').mockReturnValue(mockAtsAssessment);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should orchestrate the analysis process correctly including ATS score', async () => {
      const result = await jobAnalysisService.analyzeJobDescription('user1', 'some job description', '123');

      expect(cvRepository.findById).toHaveBeenCalledWith(123);
      expect(KeywordExtractionService.extractKeywords).toHaveBeenCalledWith('some job description');
      expect(MatchScoringService.compareCvToJob).toHaveBeenCalledWith({ skills: (mockPrismaCvEntity.skills as any)?.map((s: any) => s.name) || [] }, mockExtractedData);
      expect(MatchScoringService.calculateMatchScore).toHaveBeenCalledWith(mockComparisonResult.presentKeywords, mockComparisonResult.missingKeywords);

      // Construct the expectedCvDataForATS based on the mockPrismaCvEntity for the assertion
      const constructedExpectedCvDataForATS: CvData = {
          personal_info: mockPrismaCvEntity.personal_info as any,
          education: mockPrismaCvEntity.education as any,
          experience: mockPrismaCvEntity.experience as any,
          skills: mockPrismaCvEntity.skills as any, // This should be SkillEntry[]
          languages: mockPrismaCvEntity.languages as any,
          summary: mockPrismaCvEntity.summary || undefined,
          title: mockPrismaCvEntity.title || undefined,
          file_path: mockPrismaCvEntity.file_path || undefined,
      };

      expect(jobAnalysisService.calculateATSScore).toHaveBeenCalledWith(
        mockComparisonResult.presentKeywords,
        mockComparisonResult.missingKeywords,
        constructedExpectedCvDataForATS
      );
      
      expect(result.matchScore).toBe(mockMatchScore);
      expect(result.presentKeywords).toEqual(mockComparisonResult.presentKeywords);
      expect(result.missingKeywords).toEqual(mockComparisonResult.missingKeywords);
      expect(result.atsScore).toBe(mockAtsAssessment.score);
      expect(result.atsSuggestions).toEqual(mockAtsAssessment.suggestions);
      expect(result.atsQualitativeRating).toEqual(mockAtsAssessment.qualitativeRating);
      expect(result.atsBreakdown).toEqual(mockAtsAssessment.breakdown);
    });
  });
});