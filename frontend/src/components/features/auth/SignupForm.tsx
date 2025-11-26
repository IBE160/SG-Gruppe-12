'use client'; // This component will be a Client Component

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupInput } from '../../../lib/schemas/auth'; // Import signupSchema
import { useAuth } from '../../../lib/hooks/useAuth'; // Import useAuth hook

// Import shadcn/ui components
// Assuming shadcn/ui components are set up and available at these paths
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

export function SignupForm() {
  const { register: authRegister, loading: authLoading, error: authError } = useAuth(); // Use the auth hook

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema), // Use signupSchema
  });

  const onSubmit = async (data: SignupInput) => {
    await authRegister(data); // Call the register function from useAuth hook
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2"> {/* Changed to single column for simplicity */}
            <Label htmlFor="firstName">First name (optional)</Label>
            <Input
              id="firstName"
              placeholder="Max"
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="text-sm text-red-500">{errors.firstName.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name (optional)</Label>
            <Input
              id="lastName"
              placeholder="Robinson"
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500">{errors.lastName.message}</p>
            )}
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          {authError && <p className="text-sm text-red-500">{authError}</p>} {/* Display backend error */}
          <Button type="submit" className="w-full" disabled={isSubmitting || authLoading}>
            {authLoading ? 'Creating account...' : 'Create an account'}
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <a href="/login" className="underline">
              Sign in
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}