// src/tests/unit/job-interpretation.service.test.ts

import { jobInterpretationService } from '../../services/job-interpretation.service';
import { ExtractedJobData } from '../../services/KeywordExtractionService';
import { generateText } from 'ai';

// Mock dependencies
jest.mock('ai');
jest.mock('../../utils/logger.util', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockedGenerateText = generateText as jest.MockedFunction<typeof generateText>;

describe('jobInterpretationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('interpretJobRequirements', () => {
    it('should successfully interpret job requirements', async () => {
      const mockJobRequirements: ExtractedJobData = {
        keywords: ['fast-paced', 'startup', 'self-starter'],
        skills: ['JavaScript', 'React', 'Node.js'],
        qualifications: ['5+ years of experience', 'BS in Computer Science'],
        responsibilities: ['Build web applications', 'Lead team of developers'],
      };

      const mockRawJobDescription = `
        We're looking for a self-starter to join our fast-paced startup environment.
        5+ years of experience required. BS in Computer Science preferred.
        You'll be building web applications using JavaScript, React, and Node.js.
        As a senior engineer, you'll lead a team of developers.
      `;

      const mockInterpretationText = `
## OVERALL ASSESSMENT
This is a senior-level role in a startup environment requiring significant autonomy and leadership skills.

## KEY REQUIREMENT INTERPRETATIONS
- REQUIREMENT: 5+ years of experience
- LITERAL: Candidate should have worked for at least 5 years
- REAL MEANING: Looking for someone who can hit the ground running without extensive onboarding
- IMPLICIT EXPECTATIONS:
  - Experience with similar tech stack
  - Ability to mentor junior developers
  - Track record of delivering projects
- RED FLAGS: None

## CULTURAL SIGNALS
- Fast-paced environment suggests long hours and quick iterations
- Startup mentality means uncertainty and wearing multiple hats

## COMPENSATION INSIGHTS
- Likely market-rate salary with possible equity
- Work-life balance may be challenging

## GROWTH POTENTIAL
Strong growth potential in a startup environment, opportunity to shape the technical direction
      `;

      mockedGenerateText.mockResolvedValue({ text: mockInterpretationText } as any);

      const result = await jobInterpretationService.interpretJobRequirements(
        mockJobRequirements,
        mockRawJobDescription
      );

      expect(result).toBeDefined();
      expect(result.overallAssessment).toContain('senior-level');
      expect(result.interpretations.length).toBeGreaterThan(0);
      expect(result.culturalSignals.length).toBeGreaterThan(0);
      expect(result.compensationInsights.length).toBeGreaterThan(0);
      expect(result.growthPotential).toBeDefined();
    });

    it('should handle AI parsing failures gracefully', async () => {
      const mockJobRequirements: ExtractedJobData = {
        keywords: ['experienced'],
        skills: ['Python'],
        qualifications: ['3+ years experience'],
        responsibilities: ['Develop software'],
      };

      const mockRawJobDescription = 'We need a Python developer with 3+ years experience.';

      const mockUnstructuredText = 'This is some unstructured interpretation text that does not follow the expected format.';

      mockedGenerateText.mockResolvedValue({ text: mockUnstructuredText } as any);

      const result = await jobInterpretationService.interpretJobRequirements(
        mockJobRequirements,
        mockRawJobDescription
      );

      // Should still return a result even if parsing fails
      expect(result).toBeDefined();
      expect(result.overallAssessment).toBeDefined();
      expect(result.interpretations).toBeInstanceOf(Array);
    });

    it('should create fallback interpretations when parsing fails', async () => {
      const mockJobRequirements: ExtractedJobData = {
        keywords: [],
        skills: [],
        qualifications: ['Must have degree', 'Team player', 'Strong communication skills'],
        responsibilities: [],
      };

      const mockRawJobDescription = 'Looking for a team player with strong communication.';
      const mockUnparsableText = 'Random text without proper structure';

      mockedGenerateText.mockResolvedValue({ text: mockUnparsableText } as any);

      const result = await jobInterpretationService.interpretJobRequirements(
        mockJobRequirements,
        mockRawJobDescription
      );

      // Should create fallback interpretations from qualifications
      expect(result.interpretations.length).toBeGreaterThan(0);
      expect(result.interpretations[0].requirement).toBe('Must have degree');
    });

    it('should use temperature 0.3 for nuanced interpretation', async () => {
      const mockJobRequirements: ExtractedJobData = {
        keywords: ['agile'],
        skills: ['Java'],
        qualifications: ['Experience with agile methodologies'],
        responsibilities: ['Participate in sprints'],
      };

      const mockRawJobDescription = 'Java developer needed for agile team.';

      mockedGenerateText.mockResolvedValue({
        text: '## OVERALL ASSESSMENT\nAgile role.\n## KEY REQUIREMENT INTERPRETATIONS\n',
      } as any);

      await jobInterpretationService.interpretJobRequirements(
        mockJobRequirements,
        mockRawJobDescription
      );

      expect(mockedGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.3,
        })
      );
    });
  });

  describe('getQuickInterpretation', () => {
    it('should return interpretation for "fast-paced environment"', () => {
      const result = jobInterpretationService.getQuickInterpretation('fast-paced environment');

      expect(result).toContain('long hours');
      expect(result).toContain('high pressure');
    });

    it('should return interpretation for "wear many hats"', () => {
      const result = jobInterpretationService.getQuickInterpretation('wear many hats');

      expect(result).toContain('tasks outside');
      expect(result).toContain('understaffed');
    });

    it('should return interpretation for "self-starter"', () => {
      const result = jobInterpretationService.getQuickInterpretation('self-starter');

      expect(result).toContain('Minimal training');
      expect(result).toContain('figure things out alone');
    });

    it('should return interpretation for "unlimited pto"', () => {
      const result = jobInterpretationService.getQuickInterpretation('unlimited pto');

      expect(result).toContain('less time off');
      expect(result).toContain('guilt');
    });

    it('should return empty string for unknown phrases', () => {
      const result = jobInterpretationService.getQuickInterpretation('some random phrase');

      expect(result).toBe('');
    });

    it('should handle case-insensitive matching', () => {
      const result = jobInterpretationService.getQuickInterpretation('FAST-PACED ENVIRONMENT');

      expect(result).not.toBe('');
      expect(result).toContain('long hours');
    });
  });

  describe('buildInterpretationPrompt', () => {
    it('should build a comprehensive prompt with all requirements', () => {
      const mockJobRequirements: ExtractedJobData = {
        keywords: ['innovative', 'collaborative'],
        skills: ['TypeScript', 'React'],
        qualifications: ['5+ years experience', 'BS degree'],
        responsibilities: ['Build features', 'Review code'],
      };

      const mockRawJobDescription = 'Full job description here...';

      const prompt = jobInterpretationService.buildInterpretationPrompt(
        mockJobRequirements,
        mockRawJobDescription
      );

      expect(prompt).toContain('Qualifications:');
      expect(prompt).toContain('5+ years experience');
      expect(prompt).toContain('BS degree');
      expect(prompt).toContain('Responsibilities:');
      expect(prompt).toContain('Build features');
      expect(prompt).toContain('Skills:');
      expect(prompt).toContain('TypeScript');
      expect(prompt).toContain('FULL JOB DESCRIPTION:');
    });

    it('should truncate long job descriptions', () => {
      const mockJobRequirements: ExtractedJobData = {
        keywords: [],
        skills: [],
        qualifications: ['Required'],
        responsibilities: [],
      };

      const longDescription = 'a'.repeat(3000);

      const prompt = jobInterpretationService.buildInterpretationPrompt(
        mockJobRequirements,
        longDescription
      );

      // Long descriptions should be truncated (2000 chars + ellipsis)
      expect(prompt).toContain('FULL JOB DESCRIPTION:');
      // The prompt includes the truncated description plus formatting
      expect(prompt.length).toBeLessThan(longDescription.length + 500);
      // Should contain ellipsis indicating truncation
      expect(prompt).toContain('...');
    });
  });
});
