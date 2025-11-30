// frontend/src/lib/api/jobs.ts
import { apiClient } from './client';

export interface JobPosting {
  id: number;
  title: string;
  company: string | null;
  description: string;
  created_at: string;
}

export interface CreateJobPostingResult {
  jobPostingId: number;
  title: string;
  company: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  message?: string;
  data: T;
}

/**
 * Creates a job posting from a job description.
 * Returns the job posting ID for use in application generation.
 */
export const createJobPosting = async (
  jobDescription: string,
  title?: string,
  company?: string
): Promise<CreateJobPostingResult> => {
  const response = await apiClient<ApiResponse<CreateJobPostingResult>>(
    '/jobs/analyze',
    {
      method: 'POST',
      body: JSON.stringify({ jobDescription, title, company }),
    }
  );
  return response.data;
};

/**
 * Gets all job postings for the authenticated user.
 */
export const getJobPostings = async (): Promise<JobPosting[]> => {
  const response = await apiClient<ApiResponse<JobPosting[]>>('/jobs');
  return response.data;
};

/**
 * Gets a specific job posting by ID.
 */
export const getJobPosting = async (jobPostingId: number): Promise<JobPosting> => {
  const response = await apiClient<ApiResponse<JobPosting>>(`/jobs/${jobPostingId}`);
  return response.data;
};
