// frontend/src/app/(dashboard)/applications/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { generateTailoredCV, generateCoverLetter, CoverLetterOptions } from "@/lib/api/applications";

type GenerationStep = "input" | "generating" | "complete";

export default function NewApplicationPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<GenerationStep>("input");
  const [jobDescription, setJobDescription] = useState("");
  const [cvId, setCvId] = useState<string>("1"); // Default CV ID - in production, would select from user's CVs
  const [jobPostingId, setJobPostingId] = useState<number | null>(null);
  const [generateCV, setGenerateCV] = useState(true);
  const [generateLetter, setGenerateLetter] = useState(true);
  const [letterTone, setLetterTone] = useState<"professional" | "enthusiastic" | "formal">("professional");
  const [letterLength, setLetterLength] = useState<"short" | "medium" | "long">("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>("");

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setStep("generating");

    try {
      // For MVP, we assume jobPostingId is already created or we use a mock
      // In production, this would first create a job posting from the description
      const mockJobPostingId = jobPostingId || 1;
      let resultApplicationId: number | null = null;

      if (generateCV) {
        setGenerationProgress("Generating tailored CV...");
        const cvResult = await generateTailoredCV(parseInt(cvId), mockJobPostingId);
        resultApplicationId = cvResult.applicationId;
        toast({
          title: "Success",
          description: "Tailored CV generated successfully!",
        });
      }

      if (generateLetter) {
        setGenerationProgress("Generating cover letter...");
        const letterOptions: CoverLetterOptions = {
          tone: letterTone,
          length: letterLength,
        };
        const letterResult = await generateCoverLetter(
          parseInt(cvId),
          mockJobPostingId,
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

              {/* CV Selection (simplified for MVP) */}
              <div className="space-y-2">
                <Label htmlFor="cvSelect">Select CV</Label>
                <Select value={cvId} onValueChange={setCvId}>
                  <SelectTrigger id="cvSelect">
                    <SelectValue placeholder="Select your CV" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">My Primary CV</SelectItem>
                  </SelectContent>
                </Select>
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
                  disabled={isGenerating || (!generateCV && !generateLetter)}
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
