// frontend/src/app/(auth)/signup/page.tsx
"use client";

import { SignupForm } from "@/components/features/auth/SignupForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function SignupPage() {
  const { isLoading, error, register } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center flex-1 p-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
            <CardDescription>
              Enter your details below to create your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm onSubmit={register} isLoading={isLoading} errorMessage={error || undefined} />
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
