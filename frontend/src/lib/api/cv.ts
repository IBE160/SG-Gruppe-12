// frontend/src/lib/api/cv.ts
import { CVData, ExperienceEntry, EducationEntry, SkillEntry, LanguageEntry } from '@/types/cv';
import { apiClient, API_BASE_URL } from './client';

interface ApiResponse<T> {
  message: string;
  data: T;
}

export const getCV = async (cvId: string): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}`);
  return response.data;
};

export const parseCV = async (file: File): Promise<{ cvId: string; message: string }> => {
  const formData = new FormData();
  formData.append('cv_file', file);

  const response = await fetch(`${API_BASE_URL}/cvs/parse`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
};

// --- Experience ---
export const addExperience = async (cvId: string, data: ExperienceEntry): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/experience`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};

export const updateExperience = async (cvId: string, index: number, updates: Partial<ExperienceEntry>): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/experience/${index}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return response.data;
};

export const deleteExperience = async (cvId: string, index: number): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/experience/${index}`, {
    method: 'DELETE',
  });
  return response.data;
};

// --- Education ---
export const addEducation = async (cvId: string, data: EducationEntry): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/education`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};

export const updateEducation = async (cvId: string, index: number, updates: Partial<EducationEntry>): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/education/${index}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return response.data;
};

export const deleteEducation = async (cvId: string, index: number): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/education/${index}`, {
    method: 'DELETE',
  });
  return response.data;
};

// --- Skills ---
export const addSkill = async (cvId: string, data: { skill: SkillEntry }): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/skills`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};

export const deleteSkill = async (cvId: string, index: number): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/skills/${index}`, {
    method: 'DELETE',
  });
  return response.data;
};

// --- Languages ---
export const addLanguage = async (cvId: string, data: LanguageEntry): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/languages`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};

export const updateLanguage = async (cvId: string, index: number, updates: Partial<LanguageEntry>): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/languages/${index}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return response.data;
};

export const deleteLanguage = async (cvId: string, index: number): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/languages/${index}`, {
    method: 'DELETE',
  });
  return response.data;
};

// --- Document Generation ---
export const requestCvDownload = async (cvId: string, format: 'pdf' | 'docx'): Promise<{ jobId: string }> => {
  const response = await apiClient<ApiResponse<{ jobId: string }>>(`/cvs/${cvId}/download/${format}`);
  return response.data;
};

export const getCvDownloadStatus = async (jobId: string): Promise<{ status: string; fileUrl?: string }> => {
  const response = await apiClient<ApiResponse<{ status: string; fileUrl?: string }>>(`/cvs/download/status/${jobId}`);
  return response.data;
};

// --- CV Versioning ---
export const listCvVersions = async (cvId: string): Promise<{ versionNumber: number; createdAt: string }[]> => {
  const response = await apiClient<ApiResponse<{ versionNumber: number; createdAt: string }[]>>(`/cvs/${cvId}/versions`);
  return response.data;
};

export const getCvVersionDetails = async (cvId: string, versionNumber: number): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/versions/${versionNumber}`);
  return response.data;
};

export const restoreCvVersion = async (cvId: string, versionNumber: number): Promise<CVData> => {
  const response = await apiClient<ApiResponse<CVData>>(`/cvs/${cvId}/restore-version/${versionNumber}`, {
    method: 'POST',
  });
  return response.data;
};
