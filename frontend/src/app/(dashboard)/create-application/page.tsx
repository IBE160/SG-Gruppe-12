// frontend/src/app/(dashboard)/create-application/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { JobDescriptionInput } from "@/components/features/job-analysis/JobDescriptionInput";
import { analyzeJobDescriptionApi } from "@/lib/api/job-analysis";
import { listCVs } from "@/lib/api/cv"; // Import listCVs
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { FileText } from "lucide-react";
import { useJobAnalysisStore } from "@/store/jobAnalysisStore"; // Import the job analysis store
import { MatchScoreGauge } from "@/components/features/job-analysis/MatchScoreGauge"; // Import the MatchScoreGauge
import { Button } from "@/components/ui/button"; // Import Button component
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading states
import { JobAnalysisResult } from "../../../../src/types/job.types"; // Assuming types are shared from backend
import { ATSScoreCard } from "@/components/features/job-analysis/ATSScoreCard"; // Import ATSScoreCard


export default function CreateApplicationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [userCvId, setUserCvId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false); // New state to control view
  const router = useRouter();
  const { toast } = useToast();
  const { jobAnalysisResult, setJobAnalysisResult, clearJobAnalysisResult } = useJobAnalysisStore();

  useEffect(() => {
    // Fetch user's CVs to get a default cvId
    const fetchUserCVs = async () => {
      setIsLoading(true);
      try {
        const cvs = await listCVs();
        if (cvs && cvs.length > 0) {
          setUserCvId(cvs[0].id); // Use the first CV as default
        } else {
          setError("No CVs found. Please upload a CV first.");
          toast({
            title: "No CVs",
            description: "Please upload your CV before analyzing a job description.",
            variant: "destructive",
          });
          // Redirect to CV upload page or show a prominent message
          // router.push("/cv/upload");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch CVs.";
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

    if (!userCvId) { // Only fetch if cvId is not set
      fetchUserCVs();
    }
  }, [userCvId, toast]);

  const handleSubmit = async (data: { jobDescription: string }) => {
    if (!userCvId) {
      setError("No CV selected. Please upload a CV first.");
      toast({
        title: "Error",
        description: "No CV available for analysis. Please upload one.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const response = await analyzeJobDescriptionApi(data.jobDescription, userCvId); // Pass cvId

      if (response.success && response.data) {
        setJobAnalysisResult(response.data); // Store the result
        setShowResults(true); // Show results view
        toast({
          title: "Success!",
          description: "Job description has been analyzed successfully.",
        });
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

  const handleAnalyzeAnotherJob = () => {
    clearJobAnalysisResult(); // Clear stored result
    setShowResults(false);    // Show input form
    setError(undefined);
  };

  if (isLoading && !jobAnalysisResult) { // Show skeleton while initially loading CV or analyzing
    return (
      <div className="max-w-4xl mx-auto space-y-4" data-testid="loading-skeleton">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    );
  }

  if (error && !jobAnalysisResult) { // Display error if no CV or analysis failed
    return (
      <div className="max-w-4xl mx-auto text-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-4">Error</h2>
        <p className="text-red-700 mb-6">{error}</p>
        <Button onClick={handleAnalyzeAnotherJob}>Try Again</Button>
      </div>
    );
  }


  if (showResults && jobAnalysisResult) {
    // Display Analysis Results
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">Job Analysis Results</h1>
          </div>
          <p className="text-gray-600">
            Here's a detailed breakdown of your CV's match with the job description.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Match Score</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchScoreGauge score={jobAnalysisResult.matchScore} showLabel showMessage size="lg" />
          </CardContent>
        </Card>

        {jobAnalysisResult.atsScore !== undefined && jobAnalysisResult.atsSuggestions !== undefined && jobAnalysisResult.atsQualitativeRating !== undefined && (
            <Card>
                <CardHeader>
                    <CardTitle>ATS Compatibility Score</CardTitle>
                </CardHeader>
                <CardContent>
                    <ATSScoreCard 
                        score={jobAnalysisResult.atsScore}
                        suggestions={jobAnalysisResult.atsSuggestions}
                        qualitativeRating={jobAnalysisResult.atsQualitativeRating}
                        showDetails={true}
                        atsBreakdown={jobAnalysisResult.atsBreakdown}
                    />
                </CardContent>
            </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Key Strengths</CardTitle>
            <CardDescription>{jobAnalysisResult.strengthsSummary}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {jobAnalysisResult.presentKeywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                {keyword}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
            <CardDescription>{jobAnalysisResult.weaknessesSummary}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {jobAnalysisResult.missingKeywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="bg-amber-100 text-amber-800">
                {keyword}
              </Badge>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleAnalyzeAnotherJob}>
            Analyze Another Job
          </Button>
          {/* Future: Button to generate tailored CV/cover letter */}
          <Button>Generate Tailored Application</Button>
        </div>
      </div>
    );
  }

  // Input Form
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