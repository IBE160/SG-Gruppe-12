// frontend/src/lib/api/job-analysis.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface AnalyzeJobResponse {
  success: boolean;
  message: string;
  data: any; // Define a more specific type later
}

export const analyzeJobDescriptionApi = async (jobDescription: string): Promise<AnalyzeJobResponse> => {
  try {
    const response = await axios.post<AnalyzeJobResponse>(
      `${API_BASE_URL}/jobs/analyze`,
      { jobDescription },
      { withCredentials: true } // Important for sending HTTP-only cookies
    );
    return response.data;
  } catch (error: any) {
    console.error('API call to /jobs/analyze failed:', error);
    throw error;
  }
};
