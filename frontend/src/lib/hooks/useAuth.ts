// frontend/src/lib/hooks/useAuth.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { SignupFormValues, LoginFormValues } from '@/lib/schemas/auth'; // Import LoginFormValues
import { registerUser, loginUser, logoutUser } from '@/lib/api/auth'; // Import loginUser and logoutUser
import { useToast } from "@/components/ui/use-toast";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setAuth, logout: storeLogout } = useAuthStore();
  const { toast } = useToast();

  const register = async (values: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerUser(values);
      if (response.success) {
        toast({ title: "Registration Successful!", description: "Account created. Please login." }); // Updated message
        router.push('/login');
      } else {
        setError(response.message || 'Registration failed.');
        toast({ title: "Registration Failed", description: response.message || "An unexpected error occurred.", variant: "destructive" });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during registration.');
      toast({ title: "Error", description: err.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(values);
      if (response.success) {
        setAuth(response.data, response.accessToken, response.refreshToken); // Store user and tokens
        toast({ title: "Login Successful!", description: "Welcome back!" });
        router.push('/dashboard'); // Redirect to dashboard after successful login
      } else {
        setError(response.message || 'Login failed.');
        toast({ title: "Login Failed", description: response.message || "Invalid credentials.", variant: "destructive" });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
      toast({ title: "Error", description: err.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logoutUser();
      storeLogout(); // Clear auth state in Zustand
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login'); // Redirect to login page after logout
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during logout.');
      toast({ title: "Error", description: err.message || "An unexpected error occurred during logout.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    register,
    login,
    logout,
  };
}