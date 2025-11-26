import { z } from 'zod';
import {
  personalInfoSchema,
  educationEntrySchema,
  experienceEntrySchema,
  skillEntrySchema,
  languageEntrySchema,
  createCVSchema,
  updateCVSchema
} from '../validators/cv.validator'; // Importing schemas to infer types

export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type SkillEntry = z.infer<typeof skillEntrySchema>;
export type LanguageEntry = z.infer<typeof languageEntrySchema>;

// Type for the incoming CV data
export type CreateCVInput = z.infer<typeof createCVSchema>;

// Type for updating an existing CV
export type UpdateCVInput = z.infer<typeof updateCVSchema>;

// Full CV data structure
export interface CvData {
  personal_info: PersonalInfo;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  languages: LanguageEntry[];
}
