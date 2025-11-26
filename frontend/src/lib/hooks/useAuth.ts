// frontend/src/lib/hooks/useAuth.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { SignupFormValues } from '@/lib/schemas/auth';
import { registerUser } from '@/lib/api/auth';
import { useToast } from "@/components/ui/use-toast"; // Assuming useToast is available

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setAuth } = useAuthStore(); // Not used for registration, but for future login
  const { toast } = useToast();

  const register = async (values: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await registerUser(values);
      if (response.success) {
        toast({ title: "Registration Successful!", description: response.message || "Please check your email for verification." });
        router.push('/login'); // Redirect to login page after successful registration
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

  // You would add login, logout, and token refresh functions here later
  const login = async () => { /* ... */ };
  const logout = () => { /* ... */ };

  return {
    isLoading,
    error,
    register,
    login,
    logout,
  };
}