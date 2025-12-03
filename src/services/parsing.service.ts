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
import { parsingValidationService } from './parsing-validation.service'; // Import validation service

const AI_MODEL_NAME = 'gemini-1.5-flash'; // Using a direct Gemini model name

export const parsingService = {
  /**
   * Parses CV content from raw text using Google Gemini AI.
   * Story: Phase 2 Task 1 - Raw text CV input
   * @param cvText The raw CV text content.
   * @returns A Promise that resolves with the structured CvData.
   */
  async parseCVFromText(cvText: string): Promise<CvData> {
    if (!cvText || cvText.trim().length < 50) {
      throw new AppError('CV text must be at least 50 characters long.', 400);
    }

    try {
      const { object: parsedData } = await generateObject({
        model: gemini(AI_MODEL_NAME),
        schema: cvDataSchema,
        prompt: CVParsingPrompt.v2(cvText, 'text/plain'), // Use text/plain as file type
        temperature: 0.0, // Zero temperature for fully deterministic extraction
      });

      // Validate against Zod schema to ensure data integrity
      const validatedCVData = cvDataSchema.parse(parsedData);

      // Check for uncertain fields and log warning if present
      if (validatedCVData.uncertain_fields && validatedCVData.uncertain_fields.length > 0) {
        logger.warn('AI reported uncertainty during CV text parsing - user clarification may be needed', {
          uncertainFields: validatedCVData.uncertain_fields,
          totalUncertainFields: validatedCVData.uncertain_fields.length,
        });
      }

      // Validate extraction against original text to detect hallucinations
      const validation = parsingValidationService.validateExtraction(validatedCVData, cvText);
      if (!validation.isValid) {
        logger.warn('CV text parsing validation warnings detected', {
          totalWarnings: validation.warnings.length,
          warnings: validation.warnings,
        });
        // Optionally: attach warnings to the CV data for user review
        // For now, we just log them - in production, you might want to return them
      }

      return validatedCVData as CvData;
    } catch (error: any) {
      logger.error(`Error parsing CV text with AI: ${error.message}`, error);
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new AppError(`AI parsed data failed schema validation: ${error.issues.map((e: any) => e.message).join(', ')}`, 400);
      }
      throw new AppError(`AI parsing failed: ${error.message || 'Unknown error'}`, error.statusCode || 500);
    }
  },

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
        temperature: 0.0, // Zero temperature for fully deterministic extraction (no creativity)
      });

      // Validate against Zod schema to ensure data integrity and correct type mapping
      const validatedCVData = cvDataSchema.parse(parsedData);

      // Check for uncertain fields and log warning if present
      if (validatedCVData.uncertain_fields && validatedCVData.uncertain_fields.length > 0) {
        logger.warn('AI reported uncertainty during CV parsing - user clarification may be needed', {
          uncertainFields: validatedCVData.uncertain_fields,
          totalUncertainFields: validatedCVData.uncertain_fields.length,
        });
      }

      // Validate extraction against original file content to detect hallucinations
      const validation = parsingValidationService.validateExtraction(validatedCVData, fileContent);
      if (!validation.isValid) {
        logger.warn('CV file parsing validation warnings detected', {
          totalWarnings: validation.warnings.length,
          warnings: validation.warnings,
        });
      }

      return validatedCVData as CvData;
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


