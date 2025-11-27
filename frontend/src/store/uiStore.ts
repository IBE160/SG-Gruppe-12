// frontend/src/store/uiStore.ts
import { create } from 'zustand';

interface UiState {
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),

  isLoading: false,
  setIsLoading: (value) => set({ isLoading: value }),

  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
