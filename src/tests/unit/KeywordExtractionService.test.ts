// src/tests/unit/KeywordExtractionService.test.ts
import { KeywordExtractionService } from '../../services/KeywordExtractionService';
import { ExtractedJobDataSchema } from '../../validators/job.validator';
import { AppError } from '../../utils/errors.util';
import { JobExtractionPrompt } from '../../prompts/job-extraction.prompt';
import { generateObject } from 'ai';

// Mock the 'ai' module's generateObject function
jest.mock('ai', () => ({
  generateObject: jest.fn(),
}));

// Mock the gemini instance from ai-providers
jest.mock('../../config/ai-providers', () => ({
  gemini: jest.fn((model: string) => expect.any(Function)), // gemini('model') should return a function
}));

// Mock the logger to prevent console output during tests
jest.mock('../../utils/logger.util', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));


describe('KeywordExtractionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Successful extraction with valid JSON response
  it('should successfully extract data and return ExtractedJobData', async () => {
    const mockExtractedData = {
      keywords: ['TypeScript', 'React'],
      skills: ['Frontend Development'],
      qualifications: ['Bachelors Degree'],
      responsibilities: ['Develop features'],
    };
    (generateObject as jest.Mock).mockResolvedValue({ object: mockExtractedData });

    const jobDescription = 'This is a test job description.';
    const result = await KeywordExtractionService.extractKeywords(jobDescription);

    expect(result).toEqual(mockExtractedData);
    expect(generateObject).toHaveBeenCalledWith({
      model: expect.any(Function), // gemini('gemini-2.5-flash') returns a function in the mock
      schema: ExtractedJobDataSchema,
      prompt: JobExtractionPrompt.v1(jobDescription),
      temperature: 0.2,
    });
    expect(require('../../utils/logger.util').logger.info).toHaveBeenCalledWith(
      'Successfully extracted job data using AI.'
    );
  });

  // Test Case 2: Should throw AppError if the LLM returns data that does not match schema
  it('should throw AppError if LLM returns data that does not match schema', async () => {
    (generateObject as jest.Mock).mockRejectedValue(new Error('Schema validation failed')); // simulate generateObject rejecting due to schema mismatch

    const jobDescription = 'Another test job description.';

    await expect(KeywordExtractionService.extractKeywords(jobDescription)).rejects.toThrow(AppError);
    await expect(KeywordExtractionService.extractKeywords(jobDescription)).rejects.toThrow('AI keyword extraction failed: Schema validation failed');
    expect(require('../../utils/logger.util').logger.error).toHaveBeenCalled();
  });

  // Test Case 3: Should throw AppError on LLM API errors (e.g., network issues, rate limits)
  it('should throw AppError on LLM API errors', async () => {
    const mockError = new Error('AI service is currently unavailable.');
    (mockError as any).status = 503; // Simulate HTTP status
    (generateObject as jest.Mock).mockRejectedValue(mockError);

    const jobDescription = 'Job description for error test.';

    await expect(KeywordExtractionService.extractKeywords(jobDescription)).rejects.toThrow(AppError);
    await expect(KeywordExtractionService.extractKeywords(jobDescription)).rejects.toThrow(
      'AI service error: AI service is currently unavailable. (Status: 503)'
    );
    expect(require('../../utils/logger.util').logger.error).toHaveBeenCalled();
  });

  // Test Case 4: Should throw AppError for job descriptions that are too short or missing
  it('should throw AppError for job descriptions that are too short', async () => {
    const shortJobDescription = 'short';
    await expect(KeywordExtractionService.extractKeywords(shortJobDescription)).rejects.toThrow(AppError);
    await expect(KeywordExtractionService.extractKeywords(shortJobDescription)).rejects.toThrow(
      'Job description too short or missing for AI extraction.'
    );
    expect(generateObject).not.toHaveBeenCalled(); // Should not call AI if input is invalid
  });

  it('should throw AppError for job descriptions that are missing', async () => {
    const missingJobDescription = '';
    await expect(KeywordExtractionService.extractKeywords(missingJobDescription)).rejects.toThrow(AppError);
    await expect(KeywordExtractionService.extractKeywords(missingJobDescription)).rejects.toThrow(
      'Job description too short or missing for AI extraction.'
    );
    expect(generateObject).not.toHaveBeenCalled();
  });

  // Test Case 5: Correct prompt version usage
  it('should use the specified prompt version', async () => {
    const mockExtractedData = {
      keywords: ['Python', 'Django'],
      skills: ['Backend'],
      qualifications: ['Masters'],
      responsibilities: ['API development'],
    };
    (generateObject as jest.Mock).mockResolvedValue({ object: mockExtractedData });

    const jobDescription = 'Job description for prompt version test.';
    const promptVersion = 'v1'; // Explicitly test v1

    await KeywordExtractionService.extractKeywords(jobDescription, promptVersion);

    expect(generateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: JobExtractionPrompt[promptVersion](jobDescription),
      })
    );
  });
});