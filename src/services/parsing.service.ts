// src/services/parsing.service.ts
import { z } from 'zod';
import { AppError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';
import { gemini } from '../config/ai-providers'; // Changed from genAI to gemini
import { CVParsingPrompt } from '../prompts/cv-parsing.prompt';
import { cvDataSchema } from '../validators/cv.validator'; // Import the new cvDataSchema
import { CvData } from '../types/cv.types'; // Import CvData type
import { storageService } from './storage.service'; // Import storageService
import { generateObject } from 'ai'; // Import generateObject from ai

const AI_MODEL_NAME = 'gemini-1.5-flash'; // Using a direct Gemini model name

export const parsingService = {
  /**
   * Parses CV content from a file stored in Supabase using Google Gemini AI.
   * @param supabaseFilePath The path to the CV file in Supabase Storage.
   * @param fileType The MIME type of the file (e.g., 'application/pdf', 'text/plain').
   * @returns A Promise that resolves with the structured CvData.
   */
  async parseCV(supabaseFilePath: string, fileType: string): Promise<CvData> {
    let fileContent: string;
    try {
      // Download file from Supabase
      const fileBuffer = await storageService.downloadFile(supabaseFilePath);
      fileContent = fileBuffer.toString('utf-8'); // Assuming text-based content or able to convert
    } catch (downloadError: any) {
      logger.error(`Error downloading CV from Supabase: ${downloadError.message}`, downloadError);
      throw new AppError(`Failed to download CV from storage: ${downloadError.message}`, 500);
    }

    try {
      const { object: parsedData } = await generateObject({
        model: gemini(AI_MODEL_NAME), // Use gemini instance with model name
        schema: cvDataSchema, // Use Zod schema for structured output validation
        prompt: CVParsingPrompt.v2(fileContent, fileType), // Use the new v2 prompt
        temperature: 0.2, // Low temperature for factual extraction
      });

      // Validate against Zod schema to ensure data integrity and correct type mapping
      const validatedCVData = cvDataSchema.parse(parsedData);

      return validatedCVData;
    } catch (error: any) {
      logger.error(`Error parsing CV with AI: ${error.message}`, error);
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new AppError(`AI parsed data failed schema validation: ${error.issues.map((e: any) => e.message).join(', ')}`, 400);
      }
      throw new AppError(`AI parsing failed: ${error.message || 'Unknown error'}`, error.statusCode || 500);
    }
  },
};


