// frontend/src/components/features/job-analysis/JobDescriptionInput.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Define the schema directly in the component file to avoid test environment module resolution issues.
const analyzeJobDescriptionSchema = z.object({
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters long'),
});

interface JobDescriptionInputProps {
  onSubmit: (data: z.infer<typeof analyzeJobDescriptionSchema>) => void;
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
    mode: "onBlur",
  });

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))} className={cn("space-y-4", className)}>
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
          <p role="alert" className="text-red-500 text-sm mt-1">{errors.jobDescription.message}</p>
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Analyzing..." : "Analyze Job Description"}
      </Button>
    </form>
  );
}
