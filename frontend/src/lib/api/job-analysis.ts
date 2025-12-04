// frontend/src/lib/api/job-analysis.ts
import axios from 'axios';
import { JobAnalysisResult } from '@/types/job.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface AnalyzeJobResponse {
  success: boolean;
  message: string;
  data: JobAnalysisResult; // Now correctly typed
}

export const analyzeJobDescriptionApi = async (
  jobDescription: string,
  cvId: string // New parameter
): Promise<AnalyzeJobResponse> => {
  try {
    const response = await axios.post<AnalyzeJobResponse>(
      `${API_BASE_URL}/jobs/analyze`,
      { jobDescription, cvId }, // Pass cvId in the request body
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    console.error('API call to /jobs/analyze failed:', error);
    throw error;
  }
};
