// frontend/src/lib/hooks/useJobAnalysis.ts
import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { analyzeJobDescriptionApi } from '@/lib/api/job-analysis'; // Will be created later

interface UseJobAnalysisResult {
  analyzeJobDescription: (jobDescription: string) => Promise<any>;
  isLoading: boolean;
  error: string | undefined;
  data: any; // The result of the analysis
}

export const useJobAnalysis = (): UseJobAnalysisResult => {
  const [jobDescription, setJobDescription] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | undefined>(undefined);
  const [submissionLoading, setSubmissionLoading] = useState<boolean>(false);

  // SWR will handle revalidation and caching if jobDescription changes
  const { data, error: swrError, isLoading: swrLoading } = useSWR(
    jobDescription ? `/api/v1/jobs/analyze?jd_hash=${encodeURIComponent(jobDescription)}` : null, // Unique key for SWR
    async () => {
        if (!jobDescription) return null; // Should not happen if key is null-checked
        // This fetcher will not be directly used for POST, but for revalidation if needed
        // For POST, we use the analyzeJobDescription function directly
        return {}; // Return empty object for initial SWR state, actual data from POST
    },
    {
      revalidateOnFocus: false, // Don't revalidate on focus for this one
      shouldRetryOnError: false,
    }
  );

  const analyzeJobDescription = useCallback(async (jd: string) => {
    setSubmissionLoading(true);
    setSubmissionError(undefined);
    try {
      const result = await analyzeJobDescriptionApi(jd);
      setJobDescription(jd); // Update state to trigger SWR revalidation (if applicable, or just store for context)
      setSubmissionLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred during analysis.';
      setSubmissionError(errorMessage);
      setSubmissionLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  const combinedError = submissionError || swrError?.message;
  const combinedIsLoading = submissionLoading || swrLoading;

  return {
    analyzeJobDescription,
    isLoading: combinedIsLoading,
    error: combinedError,
    data,
  };
};
