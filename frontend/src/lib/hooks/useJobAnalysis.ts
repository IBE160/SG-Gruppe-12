import { useState, useCallback } from 'react';
import * as api from '@/lib/api/job-analysis';

export const useJobAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const analyzeJobAnalysis = useCallback(async (jobDescription: string, cvId: string) => {
    setIsLoading(true);
    setError(undefined);
    try {
      const result = await api.analyzeJobDescriptionApi(jobDescription, cvId);
      setIsLoading(false);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  return { analyzeJobAnalysis, isLoading, error };
};
