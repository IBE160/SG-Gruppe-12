// src/validators/application.validator.ts
import { z } from 'zod';

// Schema for generating tailored CV
export const generateTailoredCvSchema = z.object({
  body: z.object({
    cvId: z.number().int().positive('CV ID must be a positive integer'),
    jobPostingId: z.number().int().positive('Job Posting ID must be a positive integer'),
  }),
});

// Schema for generating cover letter
export const generateCoverLetterSchema = z.object({
  body: z.object({
    cvId: z.number().int().positive('CV ID must be a positive integer'),
    jobPostingId: z.number().int().positive('Job Posting ID must be a positive integer'),
  }),
});

// Schema for updating generated content
export const updateApplicationSchema = z.object({
  body: z.object({
    generatedCvContent: z.string().optional(),
    generatedApplicationContent: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

// Schema for getting application by ID
export const getApplicationSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number'),
  }),
});

// Types for request bodies
export type GenerateTailoredCvInput = z.infer<typeof generateTailoredCvSchema>['body'];
export type GenerateCoverLetterInput = z.infer<typeof generateCoverLetterSchema>['body'];
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>['body'];
