// src/services/job-interpretation.service.ts

import { generateText } from 'ai';
import { gemini } from '../config/ai-providers';
import { logger } from '../utils/logger.util';
import { AppError } from '../utils/errors.util';
import { ExtractedJobData } from './KeywordExtractionService';

const AI_MODEL_NAME = 'gemini-1.5-flash';

export interface JobRequirementInterpretation {
  requirement: string;
  literalMeaning: string;
  realMeaning: string;
  implicitExpectations: string[];
  redFlags?: string[];
}

export interface JobInterpretationResult {
  overallAssessment: string;
  interpretations: JobRequirementInterpretation[];
  culturalSignals: string[];
  compensationInsights: string[];
  growthPotential: string;
}

/**
 * Job Interpretation Service
 * Story: Phase 3 Task 2 - Job requirement interpretation
 *
 * Analyzes job requirements and explains what employers REALLY mean.
 * Helps candidates understand implicit expectations and cultural signals.
 */
export const jobInterpretationService = {
  /**
   * Interprets job requirements to reveal real expectations and red flags.
   *
   * @param jobRequirements - Extracted job data from job posting
   * @param rawJobDescription - Original job posting text for context
   * @returns Detailed interpretation with insights
   */
  async interpretJobRequirements(
    jobRequirements: ExtractedJobData,
    rawJobDescription: string
  ): Promise<JobInterpretationResult> {
    try {
      logger.info('Starting job requirement interpretation');

      const prompt = this.buildInterpretationPrompt(jobRequirements, rawJobDescription);

      const { text } = await generateText({
        model: gemini(AI_MODEL_NAME),
        prompt,
        temperature: 0.3, // Slightly higher for nuanced interpretation
      });

      const interpretation = this.parseInterpretation(text, jobRequirements);

      logger.info('Job requirement interpretation completed', {
        interpretationCount: interpretation.interpretations.length,
        culturalSignalsCount: interpretation.culturalSignals.length,
      });

      return interpretation;
    } catch (error: any) {
      logger.error(`Error interpreting job requirements: ${error.message}`, error);
      throw new AppError('Failed to interpret job requirements', 500);
    }
  },

  /**
   * Builds the AI prompt for job requirement interpretation.
   */
  buildInterpretationPrompt(jobRequirements: ExtractedJobData, rawJobDescription: string): string {
    return `
You are an expert career advisor and job market analyst. Analyze the following job requirements and provide honest, direct insights into what the employer REALLY means.

JOB REQUIREMENTS:
Qualifications: ${jobRequirements.qualifications.join(', ')}
Responsibilities: ${jobRequirements.responsibilities.join(', ')}
Skills: ${jobRequirements.skills.join(', ')}
Keywords: ${jobRequirements.keywords.join(', ')}

FULL JOB DESCRIPTION:
${rawJobDescription.substring(0, 2000)} ${rawJobDescription.length > 2000 ? '...' : ''}

TASK:
Provide a structured analysis in the following format:

## OVERALL ASSESSMENT
[2-3 sentences summarizing the role, level, and type of environment]

## KEY REQUIREMENT INTERPRETATIONS
For each major requirement, provide:
- REQUIREMENT: [the requirement]
- LITERAL: [what it says]
- REAL MEANING: [what they actually want]
- IMPLICIT EXPECTATIONS: [bullet list of unstated expectations]
- RED FLAGS: [any concerns or warnings, if applicable]

[Repeat for 3-5 most important requirements]

## CULTURAL SIGNALS
[Bullet list of what the language reveals about company culture]

## COMPENSATION INSIGHTS
[What you can infer about pay, benefits, work-life balance from the posting]

## GROWTH POTENTIAL
[Assessment of career growth opportunities based on the description]

Be honest, direct, and help the candidate understand what they're really signing up for.
`.trim();
  },

  /**
   * Parses AI-generated interpretation into structured format.
   */
  parseInterpretation(text: string, jobRequirements: ExtractedJobData): JobInterpretationResult {
    // Simple parsing - in production, you might want more robust parsing
    const lines = text.split('\n');

    let overallAssessment = '';
    const interpretations: JobRequirementInterpretation[] = [];
    const culturalSignals: string[] = [];
    const compensationInsights: string[] = [];
    let growthPotential = '';

    let currentSection = '';
    let currentInterpretation: Partial<JobRequirementInterpretation> = {};

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('## OVERALL ASSESSMENT')) {
        currentSection = 'overall';
      } else if (trimmed.startsWith('## KEY REQUIREMENT INTERPRETATIONS')) {
        currentSection = 'interpretations';
      } else if (trimmed.startsWith('## CULTURAL SIGNALS')) {
        currentSection = 'cultural';
      } else if (trimmed.startsWith('## COMPENSATION INSIGHTS')) {
        currentSection = 'compensation';
      } else if (trimmed.startsWith('## GROWTH POTENTIAL')) {
        currentSection = 'growth';
      } else if (trimmed.startsWith('- REQUIREMENT:')) {
        if (currentInterpretation.requirement) {
          interpretations.push(currentInterpretation as JobRequirementInterpretation);
        }
        currentInterpretation = {
          requirement: trimmed.replace('- REQUIREMENT:', '').trim(),
          implicitExpectations: [],
        };
      } else if (trimmed.startsWith('- LITERAL:')) {
        currentInterpretation.literalMeaning = trimmed.replace('- LITERAL:', '').trim();
      } else if (trimmed.startsWith('- REAL MEANING:')) {
        currentInterpretation.realMeaning = trimmed.replace('- REAL MEANING:', '').trim();
      } else if (trimmed.startsWith('- IMPLICIT EXPECTATIONS:')) {
        // Next lines will be bullet points
      } else if (trimmed.startsWith('- RED FLAGS:')) {
        const redFlagText = trimmed.replace('- RED FLAGS:', '').trim();
        if (redFlagText && redFlagText !== 'None') {
          currentInterpretation.redFlags = [redFlagText];
        }
      } else if (trimmed.startsWith('  -')) {
        // Implicit expectation bullet point
        if (currentInterpretation.implicitExpectations) {
          currentInterpretation.implicitExpectations.push(trimmed.replace('  -', '').trim());
        }
      } else if (trimmed.startsWith('-') && currentSection === 'cultural') {
        culturalSignals.push(trimmed.replace('-', '').trim());
      } else if (trimmed.startsWith('-') && currentSection === 'compensation') {
        compensationInsights.push(trimmed.replace('-', '').trim());
      } else if (trimmed && currentSection === 'overall' && !trimmed.startsWith('#')) {
        overallAssessment += ' ' + trimmed;
      } else if (trimmed && currentSection === 'growth' && !trimmed.startsWith('#')) {
        growthPotential += ' ' + trimmed;
      }
    }

    // Add the last interpretation if exists
    if (currentInterpretation.requirement) {
      interpretations.push(currentInterpretation as JobRequirementInterpretation);
    }

    // If parsing failed, create a fallback structure
    if (interpretations.length === 0) {
      // Create interpretations from qualifications
      jobRequirements.qualifications.slice(0, 3).forEach(qual => {
        interpretations.push({
          requirement: qual,
          literalMeaning: qual,
          realMeaning: 'See full interpretation in overall assessment',
          implicitExpectations: [],
        });
      });
    }

    return {
      overallAssessment: overallAssessment.trim() || text.substring(0, 300),
      interpretations,
      culturalSignals: culturalSignals.length > 0 ? culturalSignals : ['Analysis available in overall assessment'],
      compensationInsights: compensationInsights.length > 0 ? compensationInsights : ['See job description for details'],
      growthPotential: growthPotential.trim() || 'Varies based on company and role',
    };
  },

  /**
   * Quick interpretation for specific phrases (non-AI fallback).
   */
  getQuickInterpretation(phrase: string): string {
    const interpretations: Record<string, string> = {
      'fast-paced environment': 'Likely means long hours, frequent context switching, and high pressure',
      'wear many hats': 'You\'ll handle tasks outside your job description, possibly understaffed',
      'self-starter': 'Minimal training/onboarding, you\'re expected to figure things out alone',
      'startup mentality': 'Expect uncertainty, pivots, and possibly equity instead of higher salary',
      'work hard, play hard': 'Long hours with occasional team events, work-life balance may suffer',
      'flexible hours': 'Could mean WFH options OR expectation to work whenever needed',
      'competitive salary': 'Usually means market rate or below, not necessarily generous',
      'unlimited pto': 'Often results in less time off due to guilt/peer pressure',
    };

    const lowerPhrase = phrase.toLowerCase();
    for (const [key, value] of Object.entries(interpretations)) {
      if (lowerPhrase.includes(key)) {
        return value;
      }
    }

    return '';
  },
};
