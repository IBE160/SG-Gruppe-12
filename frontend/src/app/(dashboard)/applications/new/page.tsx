// frontend/src/app/(dashboard)/applications/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { generateTailoredCV, generateCoverLetter, CoverLetterOptions } from "@/lib/api/applications";
import { createJobPosting } from "@/lib/api/jobs";
import { getUserCVs, CVSummary } from "@/lib/api/cvs";

type GenerationStep = "input" | "generating" | "complete";

export default function NewApplicationPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<GenerationStep>("input");
  const [jobDescription, setJobDescription] = useState("");
  const [cvId, setCvId] = useState<string>("");
  const [userCVs, setUserCVs] = useState<CVSummary[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(true);
  const [generateCV, setGenerateCV] = useState(true);
  const [generateLetter, setGenerateLetter] = useState(true);
  const [letterTone, setLetterTone] = useState<"professional" | "enthusiastic" | "formal">("professional");
  const [letterLength, setLetterLength] = useState<"short" | "medium" | "long">("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>("");

  // Fetch user's CVs on mount
  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const cvs = await getUserCVs();
        setUserCVs(cvs);
        if (cvs.length > 0) {
          setCvId(cvs[0].id.toString());
        }
      } catch (err: any) {
        toast({
          title: "Error",
          description: "Failed to load your CVs",
          variant: "destructive",
        });
      } finally {
        setLoadingCVs(false);
      }
    };
    fetchCVs();
  }, [toast]);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    if (!cvId) {
      toast({
        title: "Error",
        description: "Please select a CV",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setStep("generating");

    try {
      // Step 1: Create job posting from description
      setGenerationProgress("Analyzing job description...");
      const jobResult = await createJobPosting(jobDescription);
      const newJobPostingId = jobResult.jobPostingId;

      let resultApplicationId: number | null = null;

      // Step 2: Generate tailored CV if selected
      if (generateCV) {
        setGenerationProgress("Generating tailored CV...");
        const cvResult = await generateTailoredCV(parseInt(cvId), newJobPostingId);
        resultApplicationId = cvResult.applicationId;
        toast({
          title: "Success",
          description: "Tailored CV generated successfully!",
        });
      }

      // Step 3: Generate cover letter if selected
      if (generateLetter) {
        setGenerationProgress("Generating cover letter...");
        const letterOptions: CoverLetterOptions = {
          tone: letterTone,
          length: letterLength,
        };
        const letterResult = await generateCoverLetter(
          parseInt(cvId),
          newJobPostingId,
          letterOptions
        );
        resultApplicationId = letterResult.applicationId;
        toast({
          title: "Success",
          description: "Cover letter generated successfully!",
        });
      }

      if (resultApplicationId) {
        setApplicationId(resultApplicationId);
        setStep("complete");
      }
    } catch (err: any) {
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate application materials",
        variant: "destructive",
      });
      setStep("input");
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  };

  const handleViewApplication = () => {
    if (applicationId) {
      router.push(`/applications/${applicationId}`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Application</CardTitle>
          <CardDescription>
            Generate a tailored CV and cover letter based on a job description
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "input" && (
            <div className="space-y-6">
              {/* Job Description Input */}
              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Paste the job description here..."
                  className="min-h-[200px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {/* CV Selection */}
              <div className="space-y-2">
                <Label htmlFor="cvSelect">Select CV</Label>
                {loadingCVs ? (
                  <div className="h-10 bg-muted animate-pulse rounded-md" />
                ) : userCVs.length === 0 ? (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">
                      You haven&apos;t uploaded any CVs yet.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/cv/upload")}
                    >
                      Upload a CV
                    </Button>
                  </div>
                ) : (
                  <Select value={cvId} onValueChange={setCvId}>
                    <SelectTrigger id="cvSelect">
                      <SelectValue placeholder="Select your CV" />
                    </SelectTrigger>
                    <SelectContent>
                      {userCVs.map((cv) => (
                        <SelectItem key={cv.id} value={cv.id.toString()}>
                          {cv.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Generation Options */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-medium">Generation Options</h3>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="generateCV"
                    checked={generateCV}
                    onChange={(e) => setGenerateCV(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="generateCV">Generate Tailored CV</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="generateLetter"
                    checked={generateLetter}
                    onChange={(e) => setGenerateLetter(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="generateLetter">Generate Cover Letter</Label>
                </div>

                {generateLetter && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="tone">Tone</Label>
                      <Select value={letterTone} onValueChange={(v) => setLetterTone(v as typeof letterTone)}>
                        <SelectTrigger id="tone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="length">Length</Label>
                      <Select value={letterLength} onValueChange={(v) => setLetterLength(v as typeof letterLength)}>
                        <SelectTrigger id="length">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || (!generateCV && !generateLetter) || !cvId || loadingCVs}
                  className="flex-1"
                >
                  Generate Application Materials
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/applications")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === "generating" && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg font-medium">{generationProgress || "Processing..."}</p>
              <p className="text-muted-foreground mt-2">
                This may take up to 30 seconds. Please don&apos;t close this page.
              </p>
            </div>
          )}

          {step === "complete" && (
            <div className="text-center py-12">
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-2">Application Generated!</h3>
              <p className="text-muted-foreground mb-6">
                Your tailored application materials are ready.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleViewApplication}>
                  View Application
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("input");
                    setJobDescription("");
                    setApplicationId(null);
                  }}
                >
                  Create Another
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
