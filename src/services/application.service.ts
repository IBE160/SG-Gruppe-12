// src/services/application.service.ts
import { genAI } from '../config/ai-providers';
import { applicationRepository } from '../repositories/application.repository';
import { cvRepository } from '../repositories/cv.repository';
import { prisma } from '../config/database';
import { AppError, NotFoundError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';
import { TailoredCvPrompt, CvData, JobData } from '../prompts/tailored-cv.prompt';
import { CoverLetterPrompt, CoverLetterOptions } from '../prompts/cover-letter.prompt';
import { CV, JobPosting, CVComponent } from '@prisma/client';
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
  cv: CV;
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
      logger.warn('AI-generated CV content contains potentially unverified claims', {
        suspiciousContent: validation.suspiciousContent,
        warnings: validation.warnings,
      });
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
      logger.warn('AI-generated cover letter contains potentially unverified claims', {
        suspiciousContent: validation.suspiciousContent,
        warnings: validation.warnings,
      });
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

    if (!application || application.user_id !== userId) {
      throw new NotFoundError('Application not found or access denied');
    }

    return {
      id: application.id,
      cvId: application.cv_id,
      jobPostingId: application.job_posting_id,
      tailoredCv: this.safeJsonParse(application.generated_cv_content),
      coverLetter: this.safeJsonParse(application.generated_application_content),
      atsFeedback: application.ats_feedback,
      qualityFeedback: application.quality_feedback,
      createdAt: application.created_at,
    };
  },

  /**
   * Gets all applications for a user.
   */
  async getUserApplications(userId: string) {
    const applications = await applicationRepository.findByUserId(userId);

    return applications.map(app => ({
      id: app.id,
      cvId: app.cv_id,
      jobPostingId: app.job_posting_id,
      hasTailoredCv: !!app.generated_cv_content,
      hasCoverLetter: !!app.generated_application_content,
      createdAt: app.created_at,
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

    if (!application || application.user_id !== userId) {
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
    if (!cv || cv.user_id !== userId) {
      throw new NotFoundError('CV not found or access denied');
    }

    // Fetch job posting
    const jobPosting = await prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });
    if (!jobPosting) {
      throw new NotFoundError('Job posting not found');
    }

    // Fetch CV components and build data
    const components = await cvRepository.findComponentsByIds(cv.component_ids);
    const cvData = this.buildCvDataFromComponents(components);

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
   */
  buildCvDataFromComponents(components: CVComponent[]): CvData {
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
  },

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
   */
  async callAIForTailoredCV(cvData: CvData, jobData: JobData): Promise<TailoredCvResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = TailoredCvPrompt.v1(cvData, jobData);

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Sanitize output to remove any leaked system content
    text = llmSafetyService.sanitizeOutput(text);

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AppError('Failed to parse AI response', 500);
    }

    const parsed = JSON.parse(jsonMatch[0]) as TailoredCvResult;

    // Validate required fields
    if (!parsed.summary || !parsed.experience || !parsed.skills) {
      throw new AppError('Invalid AI response structure', 500);
    }

    return parsed;
  },

  /**
   * Calls the AI provider to generate cover letter.
   */
  async callAIForCoverLetter(
    cvData: CvData,
    jobData: JobData,
    options?: CoverLetterOptions
  ): Promise<CoverLetterResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = CoverLetterPrompt.v1(cvData, jobData, options || {});

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Sanitize output to remove any leaked system content
    text = llmSafetyService.sanitizeOutput(text);

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AppError('Failed to parse AI response', 500);
    }

    const parsed = JSON.parse(jsonMatch[0]) as CoverLetterResult;

    // Validate required fields
    if (!parsed.fullText) {
      throw new AppError('Invalid AI response structure', 500);
    }

    return parsed;
  },
};
