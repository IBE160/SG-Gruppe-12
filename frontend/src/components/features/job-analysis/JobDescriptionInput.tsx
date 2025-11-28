// frontend/src/components/features/job-analysis/JobDescriptionInput.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import { Textarea } from "@/components/ui/textarea"; // Assuming shadcn/ui Textarea
import { Label } from "@/components/ui/label"; // Assuming shadcn/ui Label
import { cn } from "@/lib/utils"; // Utility for class names
import { analyzeJobDescriptionSchema } from "@/lib/schemas/job"; // Frontend Zod schema

// This component will be used on the client side, so "use client" is necessary for hooks.

interface JobDescriptionInputProps {
  onSubmit: (jobDescription: string) => void;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export function JobDescriptionInput({
  onSubmit,
  isLoading,
  error,
  className,
}: JobDescriptionInputProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof analyzeJobDescriptionSchema>>({
    resolver: zodResolver(analyzeJobDescriptionSchema),
  });

  const handleFormSubmit = (data: z.infer<typeof analyzeJobDescriptionSchema>) => {
    onSubmit(data.jobDescription);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn("space-y-4", className)}>
      <div className="grid w-full gap-1.5">
        <Label htmlFor="jobDescription">Job Description</Label>
        <Textarea
          id="jobDescription"
          placeholder="Paste the job description here..."
          rows={15}
          {...register("jobDescription")}
          className={cn({ "border-red-500": errors.jobDescription })}
          disabled={isLoading}
        />
        {errors.jobDescription && (
          <p className="text-red-500 text-sm mt-1">{errors.jobDescription.message}</p>
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Analyzing..." : "Analyze Job Description"}
      </Button>
    </form>
  );
}
