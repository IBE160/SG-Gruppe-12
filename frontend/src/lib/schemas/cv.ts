// frontend/src/lib/schemas/cv.ts
import { z } from 'zod';

// Define schemas for individual CV components (what goes inside the JSON fields)

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional(),
  website: z.string().url('Invalid website URL').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
});

export const educationEntrySchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
  description: z.string().optional(),
});

export const experienceEntrySchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
  description: z.string().optional(),
});

export const skillEntrySchema = z.string().min(1, 'Skill cannot be empty');

export const languageEntrySchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  level: z.string().optional(), // e.g., "Fluent", "Native", "Intermediate"
});


// Main schema for creating a new CV
export const createCVSchema = z.object({
  personal_info: personalInfoSchema,
  education: z.array(educationEntrySchema),
  experience: z.array(experienceEntrySchema),
  skills: z.array(skillEntrySchema),
  languages: z.array(languageEntrySchema),
});

// Type for the incoming CV data
export type CreateCVInput = z.infer<typeof createCVSchema>;

// Main schema for updating an existing CV (all fields optional)
export const updateCVSchema = z.object({
  personal_info: personalInfoSchema.partial().optional(),
  education: z.array(educationEntrySchema).optional(),
  experience: z.array(experienceEntrySchema).optional(),
  skills: z.array(skillEntrySchema).optional(),
  languages: z.array(languageEntrySchema).optional(),
}).partial(); // Make all top-level fields optional for partial updates

export type UpdateCVInput = z.infer<typeof updateCVSchema>;
