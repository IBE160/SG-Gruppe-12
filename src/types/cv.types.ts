// src/types/cv.types.ts

import { Prisma } from '@prisma/client';

export interface PersonalInfo {
  firstName?: string; // Made optional for cases where it's not present
  lastName?: string;  // Made optional for cases where it's not present
  name?: string;      // Added to accommodate potential test data
  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  portfolio?: string;
  website?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  start_date: string; // ISO 8601 date string
  end_date?: string; // ISO 8601 date string or 'present'
  description?: string; // Markdown or rich text allowed
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  start_date?: string; // ISO 8601 date string
  end_date?: string; // ISO 8601 date string
  description?: string;
}

export interface SkillEntry {
  name: string; // SkillEntry should be an object with a name property
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  keywords?: string[]; // Related keywords
}

export interface LanguageEntry {
  name: string;
  proficiency?: 'basic' | 'conversational' | 'fluent' | 'native';
  level?: string; // Use level from conflicting definition
}

// Type for the entire CV data structure expected by the services
export interface CvData {
  title?: string;
  file_path?: string;
  personal_info?: PersonalInfo;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  skills?: SkillEntry[];
  languages?: LanguageEntry[];
  summary?: string;
}

// Additional types for CV versioning
export interface CVVersionSummary {
  versionNumber: number;
  createdAt: Date;
  // Potentially include a summary of changes here
}

// Used by the controller to abstract CV data coming from parsing
export interface ParsedCvData {
  personal_info?: PersonalInfo;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  skills?: SkillEntry[];
  languages?: LanguageEntry[];
}