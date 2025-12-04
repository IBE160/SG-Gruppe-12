// frontend/src/store/jobAnalysisStore.ts
import { create } from 'zustand';
import { JobAnalysisResult } from '@/types/job.types';

interface JobAnalysisState {
  jobAnalysisResult: JobAnalysisResult | null;
  setJobAnalysisResult: (result: JobAnalysisResult) => void;
  clearJobAnalysisResult: () => void;
}

export const useJobAnalysisStore = create<JobAnalysisState>((set) => ({
  jobAnalysisResult: null,
  setJobAnalysisResult: (result) => set({ jobAnalysisResult: result }),
  clearJobAnalysisResult: () => set({ jobAnalysisResult: null }),
}));
