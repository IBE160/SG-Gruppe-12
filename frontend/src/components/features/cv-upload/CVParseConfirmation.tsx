// frontend/src/components/features/cv-upload/CVParseConfirmation.tsx
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { CvData } from '@/types/cv'; // Assuming CvData type exists in frontend types
import { ScrollArea } from '@/components/ui/scroll-area';

interface CVParseConfirmationProps {
  cvId: string;
  onConfirm: () => void;
}

export function CVParseConfirmation({ cvId, onConfirm }: CVParseConfirmationProps) {
  const [cvData, setCvData] = useState<CvData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCvData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/v1/cvs/${cvId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch parsed CV data');
        }
        const result = await response.json();
        setCvData(result.data);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred while fetching CV data.');
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCvData();
  }, [cvId, toast, error]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading parsed CV data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error Loading CV</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setError(null)}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>No CV Data Found</CardTitle>
            <CardDescription>Could not retrieve parsed CV data. Please try uploading again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Review & Confirm Your CV Data</CardTitle>
        <CardDescription>
          Please review the extracted information. You can edit any section after confirmation.
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[70vh]">
        <ScrollArea className="h-full pr-4">
          <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
          {cvData.personal_info ? (
            <div className="pl-4 border-l-2 border-primary/50 mb-4">
              <p><strong>Name:</strong> {cvData.personal_info.name}</p>
              <p><strong>Email:</strong> {cvData.personal_info.email}</p>
              <p><strong>Phone:</strong> {cvData.personal_info.phone}</p>
              <p><strong>LinkedIn:</strong> {cvData.personal_info.linkedin}</p>
              <p><strong>Portfolio:</strong> {cvData.personal_info.portfolio}</p>
              <p><strong>Address:</strong> {cvData.personal_info.address}</p>
            </div>
          ) : <p className="text-muted-foreground">No personal information extracted.</p>}

          <h3 className="text-lg font-semibold mb-2 mt-4">Experience</h3>
          {cvData.experience && cvData.experience.length > 0 ? (
            <div className="space-y-3 pl-4 border-l-2 border-primary/50 mb-4">
              {cvData.experience.map((exp, index) => (
                <div key={index} className="p-2 border rounded-md">
                  <p><strong>Title:</strong> {exp.title}</p>
                  <p><strong>Company:</strong> {exp.company}</p>
                  <p><strong>Location:</strong> {exp.location}</p>
                  <p><strong>Dates:</strong> {exp.start_date} - {exp.end_date || 'Present'}</p>
                  <p><strong>Description:</strong> {exp.description}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No experience extracted.</p>}

          <h3 className="text-lg font-semibold mb-2 mt-4">Education</h3>
          {cvData.education && cvData.education.length > 0 ? (
            <div className="space-y-3 pl-4 border-l-2 border-primary/50 mb-4">
              {cvData.education.map((edu, index) => (
                <div key={index} className="p-2 border rounded-md">
                  <p><strong>Degree:</strong> {edu.degree}</p>
                  <p><strong>Institution:</strong> {edu.institution}</p>
                  <p><strong>Location:</strong> {edu.location}</p>
                  <p><strong>Dates:</strong> {edu.start_date} - {edu.end_date}</p>
                  <p><strong>Description:</strong> {edu.description}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No education extracted.</p>}

          <h3 className="text-lg font-semibold mb-2 mt-4">Skills</h3>
          {cvData.skills && cvData.skills.length > 0 ? (
            <div className="space-y-3 pl-4 border-l-2 border-primary/50 mb-4">
              {cvData.skills.map((skill, index) => (
                <div key={index} className="p-2 border rounded-md">
                  <p><strong>Skill:</strong> {skill.name}</p>
                  <p><strong>Proficiency:</strong> {skill.proficiency}</p>
                  <p><strong>Keywords:</strong> {skill.keywords?.join(', ')}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No skills extracted.</p>}

          <h3 className="text-lg font-semibold mb-2 mt-4">Languages</h3>
          {cvData.languages && cvData.languages.length > 0 ? (
            <div className="space-y-3 pl-4 border-l-2 border-primary/50 mb-4">
              {cvData.languages.map((lang, index) => (
                <div key={index} className="p-2 border rounded-md">
                  <p><strong>Language:</strong> {lang.name}</p>
                  <p><strong>Proficiency:</strong> {lang.proficiency}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No languages extracted.</p>}

          <h3 className="text-lg font-semibold mb-2 mt-4">Summary</h3>
          {cvData.summary ? (
            <div className="pl-4 border-l-2 border-primary/50 mb-4">
              <p>{cvData.summary}</p>
            </div>
          ) : <p className="text-muted-foreground">No summary extracted.</p>}

        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onConfirm}>
          Confirm and Proceed to Editing
        </Button>
      </CardFooter>
    </Card>
  );
}
