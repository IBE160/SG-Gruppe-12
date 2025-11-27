// frontend/src/lib/hooks/useAuth.ts
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { SignupFormValues, LoginFormValues } from '@/lib/schemas/auth'; // Import LoginFormValues
import { registerUser, loginUser, logoutUser, refreshAccessToken } from '@/lib/api/auth'; // Import refresh function
import { useToast } from "@/components/ui/use-toast";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();
  const { toast } = useToast();
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Automatic token refresh mechanism - refreshes every 14 minutes (before 15min expiry)
  useEffect(() => {
    if (isAuthenticated) {
      const startRefreshTimer = async () => {
        // Clear existing timer
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }

        // Refresh immediately on mount (in case token is close to expiry)
        try {
          await refreshAccessToken();
        } catch (err) {
          console.error('Failed to refresh token on mount:', err);
        }

        // Set up automatic refresh every 14 minutes
        refreshTimerRef.current = setInterval(async () => {
          try {
            await refreshAccessToken();
          } catch (err) {
            console.error('Token refresh failed:', err);
            // If refresh fails, log user out
            storeLogout();
            router.push('/login');
            toast({
              title: "Session Expired",
              description: "Please log in again.",
              variant: "destructive"
            });
          }
        }, 14 * 60 * 1000); // 14 minutes
      };

      startRefreshTimer();
    }

    // Cleanup on unmount or when auth state changes
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [isAuthenticated, router, storeLogout]);

  const register = async (values: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerUser(values);
      toast({ title: "Registration Successful!", description: "Account created. Please login." });
      router.push('/login');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during registration.';
      setError(message);
      toast({ title: "Registration Failed", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginUser(values);
      if (response.data?.user) {
        setAuth(response.data.user); // Store user data only (tokens are in HTTP-only cookies)
        toast({ title: "Login Successful!", description: "Welcome back!" });
        router.push('/cv/upload'); // Redirect to CV upload after successful login
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during login.';
      setError(message);
      toast({ title: "Login Failed", description: message, variant: "destructive" });
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during logout.';
      setError(message);
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
  };
}