// frontend/src/store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: number; name: string; email: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: { id: number; name: string; email: string }, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  setAuth: (user, accessToken, refreshToken) => set({ isAuthenticated: true, user, accessToken, refreshToken }),
  logout: () => set({ isAuthenticated: false, user: null, accessToken: null, refreshToken: null }),
}));