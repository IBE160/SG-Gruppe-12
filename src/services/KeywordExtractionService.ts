// src/services/KeywordExtractionService.ts
import { generateObject } from 'ai'; // Vercel AI SDK's generateObject for structured output
import { z } from 'zod'; // Zod for schema validation
import { gemini } from '../config/ai-providers'; // Vercel AI SDK Gemini instance
import { JobExtractionPrompt } from '../prompts/job-extraction.prompt';
import { AppError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';

// Define the expected structure of the AI's JSON output using Zod
// This schema will be used by generateObject for validation
export const ExtractedJobDataSchema = z.object({
  keywords: z.array(z.string()),
  skills: z.array(z.string()),
  qualifications: z.array(z.string()),
  responsibilities: z.array(z.string()),
});

export type ExtractedJobData = z.infer<typeof ExtractedJobDataSchema>;

export const KeywordExtractionService = {
  /**
   * Extracts keywords, skills, qualifications, and responsibilities from a job description using AI.
   * @param jobDescription The raw job description text.
   * @param promptVersion The version of the prompt to use (e.g., 'v1').
   * @returns A Promise resolving to structured ExtractedJobData.
   * @throws AppError if AI extraction fails or returns malformed/invalid JSON.
   */
  async extractKeywords(
    jobDescription: string,
    promptVersion: 'v1' = 'v1'
  ): Promise<ExtractedJobData> {
    if (!jobDescription || jobDescription.length < 10) {
      throw new AppError('Job description too short or missing for AI extraction.', 400);
    }

    const prompt = JobExtractionPrompt[promptVersion](jobDescription);

    try {
      const { object: extractedData } = await generateObject({
        model: gemini('gemini-2.5-flash'), // Use gemini-2.5-flash as specified in architecture
        schema: ExtractedJobDataSchema, // Use Zod schema for structured output validation
        prompt: prompt,
        temperature: 0.2, // Low temperature for factual extraction
      });

      logger.info('Successfully extracted job data using AI.');
      return extractedData;
    } catch (error: any) {
      logger.error(`Error during AI keyword extraction: ${error.message}`, error);
      // Vercel AI SDK errors might have different structures, try to extract status if available
      if (error.status) {
        throw new AppError(`AI service error: ${error.message} (Status: ${error.status})`, error.status);
      }
      throw new AppError(`AI keyword extraction failed: ${error.message || 'Unknown AI error'}`, 500);
    }
  },
};
