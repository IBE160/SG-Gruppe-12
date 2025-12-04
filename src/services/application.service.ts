// src/services/application.service.ts
import { generateText } from 'ai';
import { gemini } from '../config/ai-providers';
import { applicationRepository } from '../repositories/application.repository';
import { cvRepository } from '../repositories/cv.repository';
import { prisma } from '../config/database';
import { AppError, NotFoundError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';
import { TailoredCvPrompt, CvData, JobData } from '../prompts/tailored-cv.prompt';
import { CoverLetterPrompt, CoverLetterOptions } from '../prompts/cover-letter.prompt';
import { Cv, JobPosting } from '@prisma/client';
import {
  llmSafetyService,
  ValidationContext,
} from '../utils/llm-safety.util';

// Constants
const AI_TIMEOUT_MS = 30000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export interface TailoredCvResult {
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    period: string;
    bullets: string[];
  }>;
  skills: string[];
  highlights: string[];
}

export interface CoverLetterResult {
  greeting: string;
  opening: string;
  body: string[];
  closing: string;
  signature: string;
  fullText: string;
}

// Types for CV component content
interface ExperienceContent {
  title?: string;
  jobTitle?: string;
  company?: string;
  employer?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  bullets?: string[];
  responsibilities?: string[];
}

interface EducationContent {
  degree?: string;
  qualification?: string;
  institution?: string;
  school?: string;
  year?: string;
  graduationYear?: string;
}

interface LanguageContent {
  language?: string;
  name?: string;
  level?: string;
  proficiency?: string;
}

// Shared context for generation
interface GenerationContext {
  cv: Cv;
  jobPosting: JobPosting;
  cvData: CvData;
  jobData: JobData;
  validationContext: ValidationContext;
}

export const applicationService = {
  /**
   * Generates a tailored CV based on user's CV data and job posting.
   */
  async generateTailoredCV(
    userId: string,
    cvId: number,
    jobPostingId: number
  ): Promise<{ applicationId: number; tailoredCv: TailoredCvResult }> {
    const context = await this.prepareGenerationContext(userId, cvId, jobPostingId);

    logger.info(`Generating tailored CV for user ${userId}, CV ${cvId}, Job ${jobPostingId}`);

    const tailoredCv = await this.callAIWithRetry(
      () => this.callAIForTailoredCV(context.cvData, context.jobData),
      'tailored CV'
    );

    // Validate generated content for potential fabrication
    const fullText = JSON.stringify(tailoredCv);
    const validation = llmSafetyService.validateGeneratedContent(fullText, context.validationContext);

    if (!validation.isValid) {
      logger.error('AI-generated CV failed validation - BLOCKING to prevent hallucination', {
        suspiciousContent: validation.suspiciousContent,
        warnings: validation.warnings,
      });

      throw new AppError(
        'Generated CV content contains unverified information and cannot be used. ' +
        'The system detected potential additions that were not in your original CV. ' +
        `Suspicious content: ${validation.suspiciousContent.join(', ')}. ` +
        'Please review your CV data and try again.',
        400
      );
    }

    const application = await this.saveOrUpdateApplication(
      userId,
      cvId,
      jobPostingId,
      { generatedCvContent: JSON.stringify(tailoredCv) }
    );

    logger.info(`Tailored CV generated successfully. Application ID: ${application.id}`);

    return {
      applicationId: application.id,
      tailoredCv,
    };
  },

  /**
   * Generates a personalized cover letter.
   */
  async generateCoverLetter(
    userId: string,
    cvId: number,
    jobPostingId: number,
    options?: CoverLetterOptions
  ): Promise<{ applicationId: number; coverLetter: CoverLetterResult }> {
    const context = await this.prepareGenerationContext(userId, cvId, jobPostingId);

    logger.info(`Generating cover letter for user ${userId}, CV ${cvId}, Job ${jobPostingId}`);

    const coverLetter = await this.callAIWithRetry(
      () => this.callAIForCoverLetter(context.cvData, context.jobData, options),
      'cover letter'
    );

    // Validate generated content for potential fabrication
    const validation = llmSafetyService.validateGeneratedContent(
      coverLetter.fullText,
      context.validationContext
    );

    if (!validation.isValid) {
      logger.error('AI-generated cover letter failed validation - BLOCKING to prevent hallucination', {
        suspiciousContent: validation.suspiciousContent,
        warnings: validation.warnings,
      });

      throw new AppError(
        'Generated cover letter contains unverified information and cannot be used. ' +
        'The system detected potential additions that were not in your original CV. ' +
        `Suspicious content: ${validation.suspiciousContent.join(', ')}. ` +
        'Please review your CV data and try again.',
        400
      );
    }

    // Check for biased language
    const biasCheck = llmSafetyService.detectBias(coverLetter.fullText);
    if (biasCheck.hasBias) {
      logger.warn('AI-generated cover letter contains potentially biased language', {
        patterns: biasCheck.detectedPatterns,
      });
    }

    const application = await this.saveOrUpdateApplication(
      userId,
      cvId,
      jobPostingId,
      { generatedApplicationContent: JSON.stringify(coverLetter) }
    );

    logger.info(`Cover letter generated successfully. Application ID: ${application.id}`);

    return {
      applicationId: application.id,
      coverLetter,
    };
  },

  /**
   * Retrieves an existing application by ID.
   */
  async getApplication(userId: string, applicationId: number) {
    const application = await applicationRepository.findById(applicationId);

    if (!application || application.userId !== userId) {
      throw new NotFoundError('Application not found or access denied');
    }

    return {
      id: application.id,
      cvId: application.cvId,
      jobPostingId: application.jobPostingId,
      tailoredCv: this.safeJsonParse(application.generatedCvContent),
      coverLetter: this.safeJsonParse(application.generatedApplicationContent),
      atsFeedback: application.atsFeedback,
      qualityFeedback: application.qualityFeedback,
      createdAt: application.createdAt,
    };
  },

  /**
   * Gets all applications for a user.
   */
  async getUserApplications(userId: string) {
    const applications = await applicationRepository.findByUserId(userId);

    return applications.map(app => ({
      id: app.id,
      cvId: app.cvId,
      jobPostingId: app.jobPostingId,
      hasTailoredCv: !!app.generatedCvContent,
      hasCoverLetter: !!app.generatedApplicationContent,
      createdAt: app.createdAt,
    }));
  },

  /**
   * Updates user-edited content for an application.
   */
  async updateApplication(
    userId: string,
    applicationId: number,
    updates: { generatedCvContent?: string; generatedApplicationContent?: string }
  ) {
    const application = await applicationRepository.findById(applicationId);

    if (!application || application.userId !== userId) {
      throw new NotFoundError('Application not found or access denied');
    }

    return applicationRepository.update(applicationId, updates);
  },

  // --- Private Helper Methods ---

  /**
   * Prepares the shared context needed for both CV and cover letter generation.
   */
  async prepareGenerationContext(
    userId: string,
    cvId: number,
    jobPostingId: number
  ): Promise<GenerationContext> {
    // Fetch CV with ownership check
    const cv = await cvRepository.findById(cvId);
    if (!cv || cv.userId !== userId) {
      throw new NotFoundError('CV not found or access denied');
    }

    // Fetch job posting
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });
    if (!jobPosting) {
      throw new NotFoundError('Job posting not found');
    }

    // Build CV data from JSON fields
    // Note: CvData here is from prompts/tailored-cv.prompt.ts, not types/cv.types.ts
    const cvData: CvData = {
      summary: cv.summary || undefined,
      experience: (cv.experience as any[]) || [],
      education: (cv.education as any[]) || [],
      skills: (cv.skills as any[]) || [],
      languages: (cv.languages as any[]) || undefined,
    };

    // Build job data
    const jobData: JobData = {
      title: jobPosting.title,
      company: jobPosting.company || undefined,
      description: jobPosting.description,
    };

    // Build validation context for LLM output verification
    const validationContext: ValidationContext = {
      userSkills: cvData.skills,
      userExperience: cvData.experience.map(exp => ({
        title: exp.title,
        company: exp.company,
        dates: exp.period,
      })),
      userEducation: cvData.education.map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        year: edu.year,
      })),
    };

    return { cv, jobPosting, cvData, jobData, validationContext };
  },

  /**
   * Saves or updates an application analysis record.
   */
  async saveOrUpdateApplication(
    userId: string,
    cvId: number,
    jobPostingId: number,
    content: { generatedCvContent?: string; generatedApplicationContent?: string }
  ) {
    let application = await applicationRepository.findByUserAndJob(userId, cvId, jobPostingId);

    if (application) {
      return applicationRepository.update(application.id, content);
    }

    return applicationRepository.create({
      userId,
      cvId,
      jobPostingId,
      ...content,
    });
  },

  /**
   * Safely parses JSON, returning null on failure.
   */
  safeJsonParse(value: string | null | undefined): unknown {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      logger.warn('Failed to parse stored JSON content');
      return null;
    }
  },

  /**
   * Builds CvData structure from CV components with proper typing.
   * @deprecated No longer used - CV data is now stored directly in JSON fields
   */
  /*
  buildCvDataFromComponents(components: any[]): CvData {
    const cvData: CvData = {
      experience: [],
      education: [],
      skills: [],
    };

    for (const component of components) {
      const content = component.content as Record<string, unknown>;

      switch (component.component_type) {
        case 'summary':
        case 'personal_info':
          if (content.summary && typeof content.summary === 'string') {
            cvData.summary = content.summary;
          }
          break;

        case 'work_experience':
        case 'experience': {
          const exp = content as ExperienceContent;
          cvData.experience.push({
            title: exp.title || exp.jobTitle || '',
            company: exp.company || exp.employer || '',
            period: exp.period || `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
            description: exp.description || '',
            bullets: exp.bullets || exp.responsibilities || [],
          });
          break;
        }

        case 'education': {
          const edu = content as EducationContent;
          cvData.education.push({
            degree: edu.degree || edu.qualification || '',
            institution: edu.institution || edu.school || '',
            year: edu.year || edu.graduationYear || '',
          });
          break;
        }

        case 'skills':
        case 'skill':
          if (Array.isArray(content)) {
            cvData.skills.push(...content.filter((s): s is string => typeof s === 'string'));
          } else if (Array.isArray(content.skills)) {
            cvData.skills.push(...content.skills.filter((s): s is string => typeof s === 'string'));
          } else if (content.name && typeof content.name === 'string') {
            cvData.skills.push(content.name);
          }
          break;

        case 'languages': {
          if (!cvData.languages) cvData.languages = [];
          if (Array.isArray(content)) {
            cvData.languages.push(
              ...content.map((l: LanguageContent) => ({
                language: l.language || l.name || '',
                level: l.level || l.proficiency || '',
              }))
            );
          } else {
            const lang = content as LanguageContent;
            if (lang.language || lang.name) {
              cvData.languages.push({
                language: lang.language || lang.name || '',
                level: lang.level || lang.proficiency || '',
              });
            }
          }
          break;
        }
      }
    }

    return cvData;
  }
  */

  /**
   * Wraps an AI call with retry logic and exponential backoff.
   */
  async callAIWithRetry<T>(
    aiCall: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await this.withTimeout(aiCall(), AI_TIMEOUT_MS);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
          logger.warn(
            `AI ${operationName} generation attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
            { error: lastError.message }
          );
          await this.sleep(delay);
        }
      }
    }

    logger.error(`AI ${operationName} generation failed after ${MAX_RETRIES + 1} attempts`, {
      error: lastError?.message,
    });
    throw new AppError(`Failed to generate ${operationName}. Please try again later.`, 500);
  },

  /**
   * Wraps a promise with a timeout.
   */
  async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new AppError('AI request timed out', 504));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId!);
    }
  },

  /**
   * Sleep utility for retry delays.
   */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Calls the AI provider to generate tailored CV content.
   * Uses Vercel AI SDK generateText with Gemini model.
   */
  async callAIForTailoredCV(cvData: CvData, jobData: JobData): Promise<TailoredCvResult> {
    const prompt = TailoredCvPrompt.v1(cvData, jobData);

    const { text } = await generateText({
      model: gemini('gemini-1.5-flash'),
      prompt,
      temperature: 0.0, // Zero temperature for fully deterministic generation (no creativity)
    });

    // Sanitize output to remove any leaked system content
    const sanitizedText = llmSafetyService.sanitizeOutput(text);

    // Parse JSON response
    const jsonMatch = sanitizedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.error('Failed to parse AI response for tailored CV', { text: sanitizedText });
      throw new AppError('Failed to parse AI response', 500);
    }

    let parsed: TailoredCvResult;
    try {
      parsed = JSON.parse(jsonMatch[0]) as TailoredCvResult;
    } catch (parseError) {
      logger.error('JSON parse error for tailored CV', { error: parseError, text: jsonMatch[0] });
      throw new AppError('Failed to parse AI response JSON', 500);
    }

    // Validate required fields
    if (!parsed.summary || !parsed.experience || !parsed.skills) {
      logger.error('Invalid AI response structure for tailored CV', { parsed });
      throw new AppError('Invalid AI response structure', 500);
    }

    return parsed;
  },

  /**
   * Calls the AI provider to generate cover letter.
   * Uses Vercel AI SDK generateText with Gemini model.
   */
  async callAIForCoverLetter(
    cvData: CvData,
    jobData: JobData,
    options?: CoverLetterOptions
  ): Promise<CoverLetterResult> {
    const prompt = CoverLetterPrompt.v1(cvData, jobData, options || {});

    const { text } = await generateText({
      model: gemini('gemini-1.5-flash'),
      prompt,
      temperature: 0.0, // Zero temperature for fully deterministic generation (no creativity)
    });

    // Sanitize output to remove any leaked system content
    const sanitizedText = llmSafetyService.sanitizeOutput(text);

    // Parse JSON response
    const jsonMatch = sanitizedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.error('Failed to parse AI response for cover letter', { text: sanitizedText });
      throw new AppError('Failed to parse AI response', 500);
    }

    let parsed: CoverLetterResult;
    try {
      parsed = JSON.parse(jsonMatch[0]) as CoverLetterResult;
    } catch (parseError) {
      logger.error('JSON parse error for cover letter', { error: parseError, text: jsonMatch[0] });
      throw new AppError('Failed to parse AI response JSON', 500);
    }

    // Validate required fields
    if (!parsed.fullText) {
      logger.error('Invalid AI response structure for cover letter', { parsed });
      throw new AppError('Invalid AI response structure', 500);
    }

    return parsed;
  },
};
