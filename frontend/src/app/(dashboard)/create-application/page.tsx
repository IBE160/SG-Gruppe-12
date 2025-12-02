// frontend/src/app/(dashboard)/create-application/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobDescriptionInput } from "@/components/features/job-analysis/JobDescriptionInput";
import { analyzeJobDescriptionApi } from "@/lib/api/job-analysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { FileText } from "lucide-react";

export default function CreateApplicationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: { jobDescription: string }) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await analyzeJobDescriptionApi(data.jobDescription);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Job description has been analyzed successfully.",
        });

        // Redirect to applications page or show results
        // For now, redirect to applications list as the analysis results
        // display will be implemented in a future story
        router.push("/applications");
      } else {
        throw new Error(response.message || "Failed to analyze job description");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error
        ? err.message
        : "An unexpected error occurred. Please try again.";

      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Create New Application</h1>
        </div>
        <p className="text-gray-600">
          Paste or type the job description below to start creating a tailored application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
          <CardDescription>
            Enter the full job description from the job posting. This will be used to analyze
            key requirements and tailor your CV and cover letter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobDescriptionInput
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Tips for best results:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Include the complete job description with all requirements and responsibilities</li>
          <li>Make sure to include company information and job title if available</li>
          <li>The more detailed the description, the better the AI can tailor your application</li>
        </ul>
      </div>
    </div>
  );
}
