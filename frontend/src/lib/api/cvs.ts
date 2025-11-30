// frontend/src/lib/api/cvs.ts
import { apiClient } from './client';

export interface CVSummary {
  id: number;
  title: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Gets all CVs for the authenticated user.
 */
export const getUserCVs = async (): Promise<CVSummary[]> => {
  const response = await apiClient<ApiResponse<CVSummary[]>>('/cvs');
  return response.data;
};
