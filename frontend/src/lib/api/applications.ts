// frontend/src/lib/api/applications.ts
import { apiClient } from './client';

// Types matching backend service
export interface TailoredCvResult {
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    period: string;
    bullets: string[];
  }>;
  skills: string[];
  highlights: string[];
}

export interface CoverLetterResult {
  greeting: string;
  opening: string;
  body: string[];
  closing: string;
  signature: string;
  fullText: string;
}

export interface ApplicationSummary {
  id: number;
  cvId: number;
  jobPostingId: number;
  hasTailoredCv: boolean;
  hasCoverLetter: boolean;
  createdAt: string;
}

export interface ApplicationDetails {
  id: number;
  cvId: number;
  jobPostingId: number;
  tailoredCv: TailoredCvResult | null;
  coverLetter: CoverLetterResult | null;
  atsFeedback: string | null;
  qualityFeedback: string | null;
  createdAt: string;
}

export interface CoverLetterOptions {
  tone?: 'professional' | 'enthusiastic' | 'formal';
  length?: 'short' | 'medium' | 'long';
  focusAreas?: string[];
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

// Generate tailored CV
export const generateTailoredCV = async (
  cvId: number,
  jobPostingId: number
): Promise<{ applicationId: number; tailoredCv: TailoredCvResult }> => {
  const response = await apiClient<ApiResponse<{ applicationId: number; tailoredCv: TailoredCvResult }>>(
    '/applications/generate-cv',
    {
      method: 'POST',
      body: JSON.stringify({ cvId, jobPostingId }),
    }
  );
  return response.data;
};

// Generate cover letter
export const generateCoverLetter = async (
  cvId: number,
  jobPostingId: number,
  options?: CoverLetterOptions
): Promise<{ applicationId: number; coverLetter: CoverLetterResult }> => {
  const response = await apiClient<ApiResponse<{ applicationId: number; coverLetter: CoverLetterResult }>>(
    '/applications/generate-cover-letter',
    {
      method: 'POST',
      body: JSON.stringify({ cvId, jobPostingId, options }),
    }
  );
  return response.data;
};

// Get all user applications
export const getUserApplications = async (): Promise<ApplicationSummary[]> => {
  const response = await apiClient<ApiResponse<ApplicationSummary[]>>('/applications');
  return response.data;
};

// Get specific application details
export const getApplication = async (applicationId: number): Promise<ApplicationDetails> => {
  const response = await apiClient<ApiResponse<ApplicationDetails>>(`/applications/${applicationId}`);
  return response.data;
};

// Update application content
export const updateApplication = async (
  applicationId: number,
  updates: { generatedCvContent?: string; generatedApplicationContent?: string }
): Promise<ApplicationDetails> => {
  const response = await apiClient<ApiResponse<ApplicationDetails>>(
    `/applications/${applicationId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }
  );
  return response.data;
};
