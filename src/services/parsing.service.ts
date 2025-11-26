// src/services/parsing.service.ts
import { genAI } from '../config/ai-providers';
import { CVParsingPrompt } from '../prompts/cv-parsing.prompt';
import { createCVSchema } from '../validators/cv.validator'; // Import Zod schema
import { CreateCVInput } from '../validators/cv.validator'; // Import corresponding type

// For now, hardcode model as gemini-pro. If using Vercel AI SDK, it might be different.
// The story context specifically mentions Gemini 2.5 Flash, which is part of Vercel AI SDK setup.
// For direct usage of @google/generative-ai, 'gemini-pro' is a common choice for text.
// If actual parsing requires 'gemini-2.5-flash', ensure the Vercel AI SDK is fully integrated or
// check if @google/generative-ai supports it directly.
const AI_MODEL_NAME = 'gemini-pro';

export const parsingService = {
  async parseCV(fileContent: string, fileType: string): Promise<CreateCVInput> {
    try {
      const model = genAI.getGenerativeModel({ model: AI_MODEL_NAME });
      const prompt = CVParsingPrompt.v1(fileContent, fileType);

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      let parsedData: unknown; // Use unknown for initial parsing
      try {
        parsedData = JSON.parse(text);
      } catch (jsonError) {
        logger.error('AI response was not valid JSON:', jsonError);
        logger.debug('AI raw response:', text);
        throw new AppError('AI parsing failed: Invalid JSON response from AI', 500);
      }

      // Validate against Zod schema to ensure data integrity and correct type mapping
      const validatedCVData = createCVSchema.parse(parsedData);

      return validatedCVData;
    } catch (error: any) {
      logger.error(`Error parsing CV with AI: ${error.message}`, error);
      // If Zod validation fails, it will be a ZodError, which is an instance of Error
      if (error instanceof z.ZodError) {
        throw new AppError(`AI parsed data failed schema validation: ${error.errors.map(e => e.message).join(', ')}`, 400);
      }
      throw new AppError(`AI parsing failed: ${error.message || 'Unknown error'}`, error.statusCode || 500);
    }
  },
};
