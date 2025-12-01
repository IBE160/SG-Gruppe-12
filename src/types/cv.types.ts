// src/types/cv.types.ts

// Type for the entire CV data structure expected by the services
// This will align with the JSON structure stored in CVComponent content fields
export interface CvData {
  personal_info?: PersonalInfo;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  skills?: SkillEntry[];
  languages?: LanguageEntry[];
  summary?: string;
  // Other potential top-level CV fields
}

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  portfolio?: string;
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
  degree: string;
  institution: string;
  location?: string;
  start_date: string; // ISO 8601 date string
  end_date?: string; // ISO 8601 date string
  description?: string;
}

export interface SkillEntry {
  name: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  keywords?: string[]; // Related keywords
}

export interface LanguageEntry {
  name: string;
  proficiency?: 'basic' | 'conversational' | 'fluent' | 'native';
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
