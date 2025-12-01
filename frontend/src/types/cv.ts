// frontend/src/types/cv.ts

// Mirroring the backend's Zod schemas and Prisma model for type safety

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  location?: string;
  start_date?: string; // YYYY-MM-DD or YYYY-MM
  end_date?: string;   // YYYY-MM-DD or YYYY-MM
  description?: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  start_date: string; // YYYY-MM-DD or YYYY-MM
  end_date?: string;   // YYYY-MM-DD or YYYY-MM
  description?: string;
}

export interface SkillEntry {
  name: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  keywords?: string[];
}

export interface LanguageEntry {
  name: string;
  proficiency?: 'basic' | 'conversational' | 'fluent' | 'native';
}

// The main CV data structure
export interface CvData {
  id?: number; // Added for frontend context, but not part of JSONB
  title?: string;
  file_path?: string;
  personal_info?: PersonalInfo;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  skills?: SkillEntry[];
  languages?: LanguageEntry[];
  summary?: string;
}

// Interface for the full CV object as it might come from the backend,
// including database-generated fields like id, userId, and timestamps.
// This combines the core CvData with Prisma model fields.
export interface CV extends CvData {
  id: number;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

// Interface for CV version snapshots
export interface CVVersion {
  id: number;
  cv_id: number;
  version_number: number;
  snapshot: CvData; // The actual CvData at that version
  created_at: Date;
}

// Interface for tracking changes in CV comparison view
export interface Change {
  type: 'added' | 'modified' | 'removed' | 'reordered';
  section: string;
  description: string;
  rationale: string;
}