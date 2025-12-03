// frontend/src/store/jobAnalysisStore.ts
import { create } from 'zustand';
import { JobAnalysisResult } from '../../src/types/job.types'; // Adjusted path to backend types for now.
// In a proper monorepo setup, these types would ideally be shared from a common package or generated.

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
