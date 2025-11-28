// frontend/src/app/(dashboard)/create-application/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobDescriptionInput } from "@/components/features/job-analysis/JobDescriptionInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobAnalysis } from "@/lib/hooks/useJobAnalysis"; // Will be created later

export default function CreateApplicationPage() {
  const router = useRouter();
  const [submissionError, setSubmissionError] = useState<string | undefined>(undefined);
  const { analyzeJobDescription, isLoading } = useJobAnalysis(); // Mocking for now, will be implemented with SWR/Zustand

  const handleSubmitJobDescription = async (jobDescription: string) => {
    setSubmissionError(undefined);
    try {
      // Simulate API call and analysis
      const result = await analyzeJobDescription(jobDescription); // This will call the backend API
      console.log("Job analysis initiated:", result);
      // On success, redirect or show next step
      router.push("/dashboard/job-analysis-results"); // Example redirect
    } catch (error: any) {
      setSubmissionError(error.message || "Failed to analyze job description.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Application</CardTitle>
          <CardDescription>
            Paste a job description below to get started with AI-powered analysis and tailoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobDescriptionInput
            onSubmit={handleSubmitJobDescription}
            isLoading={isLoading}
            error={submissionError}
          />
        </CardContent>
      </Card>
    </div>
  );
}
