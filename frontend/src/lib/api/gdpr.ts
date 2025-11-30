// frontend/src/lib/api/gdpr.ts
import { apiClient } from "./client";

// Types
export interface ConsentPreferences {
  essential: boolean;
  aiTraining: boolean;
  marketing: boolean;
}

export interface UpdateConsentsRequest {
  aiTraining?: boolean;
  marketing?: boolean;
}

export interface DataSummary {
  userId: string;
  email: string;
  name: string;
  memberSince: string;
  dataCounts: {
    cvs: number;
    cvComponents: number;
    jobPostings: number;
    applications: number;
  };
}

export interface UserDataExport {
  exportedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    emailVerified: boolean;
    createdAt: string;
    consents: ConsentPreferences;
  };
  cvs: unknown[];
  cvComponents: unknown[];
  jobPostings: unknown[];
  applications: unknown[];
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

// API Functions

/**
 * Get current consent preferences
 */
export const getConsents = async (): Promise<ConsentPreferences> => {
  const response = await apiClient<ApiResponse<ConsentPreferences>>("/gdpr/consents");
  return response.data;
};

/**
 * Update consent preferences
 */
export const updateConsents = async (
  consents: UpdateConsentsRequest
): Promise<ConsentPreferences> => {
  const response = await apiClient<ApiResponse<ConsentPreferences>>("/gdpr/consents", {
    method: "PATCH",
    body: JSON.stringify(consents),
  });
  return response.data;
};

/**
 * Get summary of stored user data
 */
export const getDataSummary = async (): Promise<DataSummary> => {
  const response = await apiClient<ApiResponse<DataSummary>>("/gdpr/data-summary");
  return response.data;
};

/**
 * Export all user data (GDPR Right to Access)
 */
export const exportUserData = async (): Promise<UserDataExport> => {
  const response = await apiClient<ApiResponse<UserDataExport>>("/gdpr/export");
  return response.data;
};

/**
 * Delete user account and all data (GDPR Right to be Forgotten)
 */
export const deleteAccount = async (): Promise<{ deleted: boolean; deletedAt: string }> => {
  const response = await apiClient<ApiResponse<{ deleted: boolean; deletedAt: string }>>(
    "/gdpr/delete-account",
    {
      method: "DELETE",
      body: JSON.stringify({ confirmDelete: true }),
    }
  );
  return response.data;
};
