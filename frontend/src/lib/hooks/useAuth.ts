'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, loginUser, logoutUser } from '../api/auth'; // Import logoutUser
import { SignupInput, LoginInput } from '../schemas/auth';
import { useAuthStore } from '../../store/authStore';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: zustandLogin, logout: zustandLogout } = useAuthStore();
  const router = useRouter();

  const register = async (data: SignupInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(data);
      zustandLogin(response.userId, data.email);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(data);
      zustandLogin(response.userId, data.email);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser(); // Call backend logout endpoint
      zustandLogout(); // Clear local authentication state
      router.push('/login'); // Redirect to login page
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during logout.');
    } finally {
      setLoading(false);
    }
  };

  return { register, login, logout, loading, error };
}
