// frontend/src/components/features/auth/LoginForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/schemas/auth"; // Assuming loginSchema is defined here
import Link from "next/link";

interface LoginFormProps {
  onSubmit: (values: z.infer<typeof loginSchema>) => void;
  isLoading: boolean;
  errorMessage?: string;
}

export function LoginForm({ onSubmit, isLoading, errorMessage }: LoginFormProps) {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && <p className="text-sm font-medium text-destructive">{errorMessage}</p>}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging In..." : "Login"}
        </Button>
        <div className="text-sm text-center">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign Up
          </Link>
        </div>
      </form>
    </Form>
  );
}
