import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null;
  login: (userId: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (userId, email) => set({ isAuthenticated: true, user: { id: userId, email } }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
