// frontend/src/lib/api/cv.ts
import { CVData, ExperienceEntry, EducationEntry, SkillEntry, LanguageEntry } from '@/types/cv';

// This is a simplified error handling. In a real app, you'd have a more robust system.
const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }
  return response.json();
};

export const getCV = async (cvId: string): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}`);
    const data = await handleApiError(response);
    return data.data;
};

// --- Experience ---
export const addExperience = async (cvId: string, data: ExperienceEntry): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return (await handleApiError(response)).data;
};
export const updateExperience = async (cvId: string, index: number, updates: Partial<ExperienceEntry>): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/experience/${index}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return (await handleApiError(response)).data;
};
export const deleteExperience = async (cvId: string, index: number): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/experience/${index}`, { method: 'DELETE' });
    return (await handleApiError(response)).data;
};

// --- Education ---
export const addEducation = async (cvId: string, data: EducationEntry): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/education`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return (await handleApiError(response)).data;
};
export const updateEducation = async (cvId: string, index: number, updates: Partial<EducationEntry>): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/education/${index}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return (await handleApiError(response)).data;
};
export const deleteEducation = async (cvId: string, index: number): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/education/${index}`, { method: 'DELETE' });
    return (await handleApiError(response)).data;
};

// --- Skills ---
export const addSkill = async (cvId: string, data: { skill: SkillEntry }): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/skills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return (await handleApiError(response)).data;
};
export const deleteSkill = async (cvId: string, index: number): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/skills/${index}`, { method: 'DELETE' });
    return (await handleApiError(response)).data;
};

// --- Languages ---
export const addLanguage = async (cvId: string, data: LanguageEntry): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/languages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return (await handleApiError(response)).data;
};
export const updateLanguage = async (cvId: string, index: number, updates: Partial<LanguageEntry>): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/languages/${index}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    return (await handleApiError(response)).data;
};
export const deleteLanguage = async (cvId: string, index: number): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/languages/${index}`, { method: 'DELETE' });
    return (await handleApiError(response)).data;
};

// --- Document Generation ---
export const requestCvDownload = async (cvId: string, format: 'pdf' | 'docx'): Promise<{ jobId: string }> => {
  const response = await fetch(`/api/v1/cvs/${cvId}/download/${format}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await handleApiError(response);
  return data.data;
};

export const getCvDownloadStatus = async (jobId: string): Promise<any> => {
    const response = await fetch(`/api/v1/cvs/download/status/${jobId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await handleApiError(response);
      return data.data;
};

// --- CV Versioning ---
export const listCvVersions = async (cvId: string): Promise<{ versionNumber: number; createdAt: string }[]> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/versions`);
    const data = await handleApiError(response);
    return data.data;
};

export const getCvVersionDetails = async (cvId: string, versionNumber: number): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/versions/${versionNumber}`);
    const data = await handleApiError(response);
    return data.data;
};

export const restoreCvVersion = async (cvId: string, versionNumber: number): Promise<CVData> => {
    const response = await fetch(`/api/v1/cvs/${cvId}/restore-version/${versionNumber}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await handleApiError(response);
    return data.data;
};
