// frontend/src/app/(auth)/login/page.tsx
"use client";

import { LoginForm } from "@/components/features/auth/LoginForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function LoginPage() {
  const { isLoading, error, login } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center flex-1 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm onSubmit={login} isLoading={isLoading} errorMessage={error || undefined} />
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
