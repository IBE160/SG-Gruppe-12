// src/validators/cv.validator.ts
import { z } from 'zod';

// Define schemas for individual CV components to match src/types/cv.types.ts

export const personalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional(),
  portfolio: z.string().url('Invalid portfolio URL').optional(),
});

export const educationEntrySchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  location: z.string().optional(),
  start_date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'Start date must be in YYYY-MM-DD or YYYY-MM format'),
  end_date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'End date must be in YYYY-MM-DD or YYYY-MM format').optional(),
  description: z.string().optional(),
});

export const experienceEntrySchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  start_date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'Start date must be in YYYY-MM-DD or YYYY-MM format'),
  end_date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'End date must be in YYYY-MM-DD or YYYY-MM format').optional(),
  description: z.string().optional(),
});

export const skillEntrySchema = z.object({
  name: z.string().min(1, 'Skill name cannot be empty'),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  keywords: z.array(z.string()).optional(),
});

export const languageEntrySchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  proficiency: z.enum(['basic', 'conversational', 'fluent', 'native']).optional(),
});


// Main schema for CvData (used for AI parsing output and full CV storage)
export const cvDataSchema = z.object({
  personal_info: personalInfoSchema.optional(),
  education: z.array(educationEntrySchema).optional(),
  experience: z.array(experienceEntrySchema).optional(),
  skills: z.array(skillEntrySchema).optional(),
  languages: z.array(languageEntrySchema).optional(),
  summary: z.string().optional(),
});

// Type for the full CV data
export type CvDataSchema = z.infer<typeof cvDataSchema>;

// Schema for creating a new CV (could be a subset or include additional fields)
// For parsing, we directly use cvDataSchema as the output
export const createCVInputSchema = z.object({
  title: z.string().min(1, 'CV title is required').optional(),
  file_path: z.string().url('Invalid file path URL').optional(), // If CV is from an uploaded file
  personal_info: personalInfoSchema.optional(),
  education: z.array(educationEntrySchema).optional(),
  experience: z.array(experienceEntrySchema).optional(),
  skills: z.array(skillEntrySchema).optional(),
  languages: z.array(languageEntrySchema).optional(),
  summary: z.string().optional(),
}).partial(); // All fields optional for initial creation, will be filled by parsing

export type CreateCVInput = z.infer<typeof createCVInputSchema>;

// Main schema for updating an existing CV (all fields optional)
export const updateCVSchema = cvDataSchema.partial(); // Update uses partial of the full CV data

export type UpdateCVInput = z.infer<typeof updateCVSchema>;

/**
 * CV Parse Response Schema
 * Story 3.6: Data Schema Contract Enforcement
 * Response from POST /api/v1/cvs/parse endpoint
 */
export const cvParseResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    cvId: z.number().int().positive(),
    supabaseFilePath: z.string(),
  }),
  message: z.string(),
});

export type CVParseResponse = z.infer<typeof cvParseResponseSchema>;
