// src/tests/unit/job.validator.test.ts
/**
 * Job Validator Tests
 * Story 3.6: Data Schema Contract Enforcement
 */
import {
  analyzeJobDescriptionSchema,
  ExtractedJobDataSchema,
  ATSBreakdownSchema,
  JobAnalysisResultSchema,
} from '../../validators/job.validator';
import { z } from 'zod';

describe('analyzeJobDescriptionSchema', () => {
  // Mock a valid numeric CV ID
  const validCvId = 123;
  const validCvIdString = '456';

  it('should validate successfully with valid jobDescription and cvId', () => {
    const validData = {
      body: {
        jobDescription: 'This is a valid job description with at least 10 characters for testing.',
        cvId: validCvId,
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(validData)).not.toThrow();
  });

  it('should validate successfully with cvId as string', () => {
    const validData = {
      body: {
        jobDescription: 'This is a valid job description with at least 10 characters for testing.',
        cvId: validCvIdString,
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(validData)).not.toThrow();
  });

  it('should fail validation if jobDescription is too short', () => {
    const invalidData = {
      body: {
        jobDescription: 'short',
        cvId: validCvId,
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(z.ZodError);
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: 'Job description must be at least 10 characters long.',
            path: ['body', 'jobDescription'],
          }),
        ]),
      })
    );
  });

  it('should fail validation if jobDescription is missing', () => {
    const invalidData = {
      body: {
        cvId: validCvId,
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(z.ZodError);
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: 'Invalid input: expected string, received undefined',
            path: ['body', 'jobDescription'],
          }),
        ]),
      })
    );
  });

  it('should fail validation if jobDescription is too long', () => {
    const longJobDescription = 'a'.repeat(10001); // 10001 characters
    const invalidData = {
      body: {
        jobDescription: longJobDescription,
        cvId: validCvId,
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(z.ZodError);
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: 'Job description cannot exceed 10000 characters.',
            path: ['body', 'jobDescription'],
          }),
        ]),
      })
    );
  });

  it('should fail validation if cvId is missing', () => {
    const invalidData = {
      body: {
        jobDescription: 'This is a valid job description.',
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(z.ZodError);
    // cvId is required - missing value will trigger union validation error
  });

  it('should fail validation if cvId is not a valid number', () => {
    const invalidData = {
      body: {
        jobDescription: 'This is a valid job description.',
        cvId: 'not-a-number',
      },
    };
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(z.ZodError);
    expect(() => analyzeJobDescriptionSchema.parse(invalidData)).toThrow(
      expect.objectContaining({
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: 'CV ID must be a valid number',
            path: ['body', 'cvId'],
          }),
        ]),
      })
    );
  });
});

describe('ExtractedJobDataSchema', () => {
  it('should validate successfully with all fields populated', () => {
    const validData = {
      keywords: ['React', 'Node.js', 'TypeScript'],
      skills: ['JavaScript', 'Python'],
      qualifications: ['Bachelor\'s degree', '5 years experience'],
      responsibilities: ['Develop features', 'Code review'],
    };
    expect(() => ExtractedJobDataSchema.parse(validData)).not.toThrow();
  });

  it('should validate successfully with empty arrays', () => {
    const validData = {
      keywords: [],
      skills: [],
      qualifications: [],
      responsibilities: [],
    };
    expect(() => ExtractedJobDataSchema.parse(validData)).not.toThrow();
  });

  it('should fail validation if keywords is missing', () => {
    const invalidData = {
      skills: ['JavaScript'],
      qualifications: [],
      responsibilities: [],
    };
    expect(() => ExtractedJobDataSchema.parse(invalidData)).toThrow(z.ZodError);
  });

  it('should fail validation if keywords contains non-string', () => {
    const invalidData = {
      keywords: ['React', 123, 'TypeScript'],
      skills: [],
      qualifications: [],
      responsibilities: [],
    };
    expect(() => ExtractedJobDataSchema.parse(invalidData)).toThrow(z.ZodError);
  });
});

describe('ATSBreakdownSchema', () => {
  it('should validate successfully with all scores in range', () => {
    const validData = {
      keywordDensityScore: 80,
      formattingScore: 100,
      sectionCompletenessScore: 75,
      quantifiableAchievementsScore: 50,
    };
    expect(() => ATSBreakdownSchema.parse(validData)).not.toThrow();
  });

  it('should validate successfully with scores at boundaries', () => {
    const validData = {
      keywordDensityScore: 0,
      formattingScore: 100,
      sectionCompletenessScore: 0,
      quantifiableAchievementsScore: 100,
    };
    expect(() => ATSBreakdownSchema.parse(validData)).not.toThrow();
  });

  it('should fail validation if score is negative', () => {
    const invalidData = {
      keywordDensityScore: -10,
      formattingScore: 100,
      sectionCompletenessScore: 75,
      quantifiableAchievementsScore: 50,
    };
    expect(() => ATSBreakdownSchema.parse(invalidData)).toThrow(z.ZodError);
  });

  it('should fail validation if score exceeds 100', () => {
    const invalidData = {
      keywordDensityScore: 80,
      formattingScore: 101,
      sectionCompletenessScore: 75,
      quantifiableAchievementsScore: 50,
    };
    expect(() => ATSBreakdownSchema.parse(invalidData)).toThrow(z.ZodError);
  });

  it('should fail validation if a score is missing', () => {
    const invalidData = {
      keywordDensityScore: 80,
      formattingScore: 100,
      sectionCompletenessScore: 75,
      // quantifiableAchievementsScore missing
    };
    expect(() => ATSBreakdownSchema.parse(invalidData)).toThrow(z.ZodError);
  });
});

describe('JobAnalysisResultSchema', () => {
  const validExtractedJobData = {
    keywords: ['React', 'Node.js'],
    skills: ['JavaScript'],
    qualifications: ['Bachelor\'s degree'],
    responsibilities: ['Develop features'],
  };

  it('should validate successfully with complete data', () => {
    const validData = {
      matchScore: 78,
      presentKeywords: ['React', 'Node.js'],
      missingKeywords: ['TypeScript'],
      strengthsSummary: 'Good match on frontend skills',
      weaknessesSummary: 'Missing TypeScript experience',
      rawKeywords: ['React', 'Node.js', 'TypeScript'],
      jobRequirements: validExtractedJobData,
      submittedAt: '2025-12-03T10:30:00.000Z',
      atsScore: 82,
      atsSuggestions: ['Add TypeScript to your skills'],
      atsQualitativeRating: 'Good',
      atsBreakdown: {
        keywordDensityScore: 80,
        formattingScore: 100,
        sectionCompletenessScore: 100,
        quantifiableAchievementsScore: 50,
      },
    };
    expect(() => JobAnalysisResultSchema.parse(validData)).not.toThrow();
  });

  it('should validate successfully without optional atsBreakdown', () => {
    const validData = {
      matchScore: 78,
      presentKeywords: ['React'],
      missingKeywords: [],
      strengthsSummary: 'Good match',
      weaknessesSummary: 'None',
      rawKeywords: ['React'],
      jobRequirements: validExtractedJobData,
      submittedAt: '2025-12-03T10:30:00.000Z',
      atsScore: 82,
      atsSuggestions: [],
      atsQualitativeRating: 'Good',
    };
    expect(() => JobAnalysisResultSchema.parse(validData)).not.toThrow();
  });

  it('should fail validation if matchScore is out of range', () => {
    const invalidData = {
      matchScore: 150,
      presentKeywords: [],
      missingKeywords: [],
      strengthsSummary: 'Good',
      weaknessesSummary: 'None',
      rawKeywords: [],
      jobRequirements: validExtractedJobData,
      submittedAt: '2025-12-03T10:30:00.000Z',
      atsScore: 82,
      atsSuggestions: [],
      atsQualitativeRating: 'Good',
    };
    expect(() => JobAnalysisResultSchema.parse(invalidData)).toThrow(z.ZodError);
  });

  it('should fail validation with invalid atsQualitativeRating', () => {
    const invalidData = {
      matchScore: 78,
      presentKeywords: [],
      missingKeywords: [],
      strengthsSummary: 'Good',
      weaknessesSummary: 'None',
      rawKeywords: [],
      jobRequirements: validExtractedJobData,
      submittedAt: '2025-12-03T10:30:00.000Z',
      atsScore: 82,
      atsSuggestions: [],
      atsQualitativeRating: 'Invalid',
    };
    expect(() => JobAnalysisResultSchema.parse(invalidData)).toThrow(z.ZodError);
  });

  it('should fail validation if jobRequirements is invalid', () => {
    const invalidData = {
      matchScore: 78,
      presentKeywords: [],
      missingKeywords: [],
      strengthsSummary: 'Good',
      weaknessesSummary: 'None',
      rawKeywords: [],
      jobRequirements: {
        keywords: 'not-an-array',
        skills: [],
        qualifications: [],
        responsibilities: [],
      },
      submittedAt: '2025-12-03T10:30:00.000Z',
      atsScore: 82,
      atsSuggestions: [],
      atsQualitativeRating: 'Good',
    };
    expect(() => JobAnalysisResultSchema.parse(invalidData)).toThrow(z.ZodError);
  });
});
