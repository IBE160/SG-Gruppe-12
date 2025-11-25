'use client'; // This component will be a Client Component

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../../../lib/schemas/auth'; // Import loginSchema and LoginInput
import { useAuth } from '../../../lib/hooks/useAuth'; // Import useAuth hook

// Import shadcn/ui components
// Assuming shadcn/ui components are set up and available at these paths
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

export function LoginForm() {
  const { login: authLogin, loading: authLoading, error: authError } = useAuth(); // Use the actual auth hook

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await authLogin(data);
    } catch (err: any) {
      setError('email', { type: 'manual', message: err.message });
      setError('password', { type: 'manual', message: err.message });
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a href="#" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {authError && ( // Display a general error if present
            <p className="text-sm text-red-500 text-center">{authError}</p>
          )}
          <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
            {authLoading ? 'Logging in...' : 'Login'}
          </Button>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="underline">
              Sign up
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}