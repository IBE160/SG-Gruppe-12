// frontend/src/types/cv.ts

// Mirroring the backend's Zod schemas and Prisma model for type safety

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

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  description?: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  description?: string;
}

export type SkillEntry = string; // Simple string for a skill

export interface LanguageEntry {
  name: string;
  level?: string; // e.g., "Fluent", "Native", "Intermediate"
}

// The main CV data structure
export interface CVData {
  personal_info: PersonalInfo;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: SkillEntry[];
  languages: LanguageEntry[];
}

// Interface for the full CV object as it might come from the backend,
// including database-generated fields like id, userId, and timestamps.
export interface CV extends CVData {
  id: string;
  userId: string;
  created_at: Date;
  updated_at: Date;
}

// Interface for CV version snapshots
export interface CVVersion {
  id: string;
  cvId: string;
  version_number: number;
  snapshot: CVData; // The actual CVData at that version
  created_at: Date;
}