// frontend/src/app/(dashboard)/applications/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  getApplication,
  updateApplication,
  ApplicationDetails,
  TailoredCvResult,
  CoverLetterResult,
} from "@/lib/api/applications";

type ViewMode = "preview" | "edit";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const applicationId = parseInt(params.id as string);

  const [application, setApplication] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [editedCvContent, setEditedCvContent] = useState<string>("");
  const [editedLetterContent, setEditedLetterContent] = useState<string>("");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const data = await getApplication(applicationId);
        setApplication(data);
        // Initialize edit fields
        if (data.tailoredCv) {
          setEditedCvContent(JSON.stringify(data.tailoredCv, null, 2));
        }
        if (data.coverLetter) {
          setEditedLetterContent(data.coverLetter.fullText);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load application");
        toast({
          title: "Error",
          description: err.message || "Failed to load application",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId, toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: { generatedCvContent?: string; generatedApplicationContent?: string } = {};

      if (application?.tailoredCv) {
        updates.generatedCvContent = editedCvContent;
      }
      if (application?.coverLetter) {
        // Reconstruct the cover letter object with updated fullText
        const updatedLetter = {
          ...application.coverLetter,
          fullText: editedLetterContent,
        };
        updates.generatedApplicationContent = JSON.stringify(updatedLetter);
      }

      await updateApplication(applicationId, updates);
      toast({
        title: "Saved",
        description: "Your changes have been saved.",
      });
      setViewMode("preview");

      // Refresh data
      const refreshed = await getApplication(applicationId);
      setApplication(refreshed);
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message || "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error || "Application not found"}</p>
            <Button
              className="mt-4 mx-auto block"
              onClick={() => router.push("/applications")}
            >
              Back to Applications
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Application #{application.id}</h1>
          <p className="text-muted-foreground">Created: {formatDate(application.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {viewMode === "preview" ? (
            <Button onClick={() => setViewMode("edit")}>Edit</Button>
          ) : (
            <>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setViewMode("preview")}>
                Cancel
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => router.push("/applications")}>
            Back
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tailored CV Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tailored CV</CardTitle>
            <CardDescription>
              AI-optimized CV content for this job application
            </CardDescription>
          </CardHeader>
          <CardContent>
            {application.tailoredCv ? (
              viewMode === "preview" ? (
                <TailoredCVPreview cv={application.tailoredCv} />
              ) : (
                <Textarea
                  className="min-h-[400px] font-mono text-sm"
                  value={editedCvContent}
                  onChange={(e) => setEditedCvContent(e.target.value)}
                />
              )
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No tailored CV generated yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cover Letter Section */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Letter</CardTitle>
            <CardDescription>
              Personalized cover letter for this position
            </CardDescription>
          </CardHeader>
          <CardContent>
            {application.coverLetter ? (
              viewMode === "preview" ? (
                <CoverLetterPreview letter={application.coverLetter} />
              ) : (
                <Textarea
                  className="min-h-[400px]"
                  value={editedLetterContent}
                  onChange={(e) => setEditedLetterContent(e.target.value)}
                />
              )
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No cover letter generated yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Section */}
      {(application.atsFeedback || application.qualityFeedback) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>AI Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.atsFeedback && (
              <div>
                <h4 className="font-medium mb-2">ATS Compatibility</h4>
                <p className="text-muted-foreground">{application.atsFeedback}</p>
              </div>
            )}
            {application.qualityFeedback && (
              <div>
                <h4 className="font-medium mb-2">Quality Assessment</h4>
                <p className="text-muted-foreground">{application.qualityFeedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Component to render tailored CV in preview mode
function TailoredCVPreview({ cv }: { cv: TailoredCvResult }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      {cv.summary && (
        <div>
          <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
            Professional Summary
          </h4>
          <p>{cv.summary}</p>
        </div>
      )}

      <Separator />

      {/* Experience */}
      {cv.experience && cv.experience.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-3">
            Experience
          </h4>
          <div className="space-y-4">
            {cv.experience.map((exp, index) => (
              <div key={index}>
                <div className="font-medium">{exp.title}</div>
                <div className="text-sm text-muted-foreground">
                  {exp.company} | {exp.period}
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Skills */}
      {cv.skills && cv.skills.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
            Key Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Highlights */}
      {cv.highlights && cv.highlights.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-2">
              Key Highlights
            </h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {cv.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// Component to render cover letter in preview mode
function CoverLetterPreview({ letter }: { letter: CoverLetterResult }) {
  return (
    <div className="prose prose-sm max-w-none">
      <p className="font-medium">{letter.greeting}</p>
      <p>{letter.opening}</p>
      {letter.body && letter.body.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
      <p>{letter.closing}</p>
      <p className="font-medium">{letter.signature}</p>
    </div>
  );
}
