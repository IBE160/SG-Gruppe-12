// src/types/cv.types.ts
// Type definitions for CV data structures

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export type SkillEntry = string;

export interface LanguageEntry {
  name: string;
  level?: string;
}

export interface CvData {
  personal_info: PersonalInfo;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  languages: LanguageEntry[];
}
