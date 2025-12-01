// frontend/src/app/(dashboard)/cv/upload/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { CVUploadForm } from '@/components/features/cv-upload/CVUploadForm';
import { CVParseConfirmation } from '@/components/features/cv-upload/CVParseConfirmation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const POLLING_INTERVAL = 3000; // Poll every 3 seconds

export default function CVUploadPage() {
  const [cvId, setCvId] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsingStatus, setParsingStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [parsingProgress, setParsingProgress] = useState<number>(0); // Placeholder for actual progress if available
  const { toast } = useToast();
  const router = useRouter();

  const checkCVStatus = useCallback(async (currentCvId: string) => {
    try {
      const response = await fetch(`/api/v1/cvs/${currentCvId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch CV status');
      }
      const cvData = await response.json();

      // Assuming a non-empty personal_info or other key field indicates parsing completion
      if (cvData.data && cvData.data.personal_info && cvData.data.personal_info.name) {
        setParsingStatus('completed');
        setIsParsing(false);
        setParsingProgress(100);
        toast({
          title: 'Parsing Complete!',
          description: 'Your CV has been parsed and is ready for review.',
        });
      } else {
        // Still parsing, update progress if available from backend, otherwise simulate
        setParsingProgress(prev => Math.min(prev + 10, 99)); // Simulate progress to 99%
      }
    } catch (error: any) {
      setParsingStatus('failed');
      setIsParsing(false);
      setParsingProgress(0);
      toast({
        title: 'Parsing Failed!',
        description: error.message || 'There was an issue parsing your CV. Please try again.',
        variant: 'destructive',
      });
      console.error('Polling CV status error:', error);
    }
  }, [toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (cvId && isParsing && parsingStatus === 'pending') {
      interval = setInterval(() => checkCVStatus(cvId), POLLING_INTERVAL);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cvId, isParsing, parsingStatus, checkCVStatus]);


  const handleFileUploadSuccess = (uploadedCvId: string) => {
    setCvId(uploadedCvId);
    setIsParsing(true);
    setParsingStatus('pending');
    setParsingProgress(10); // Start progress bar
    checkCVStatus(uploadedCvId); // Initial check
  };

  const handleFileUploadError = (message: string) => {
    toast({
      title: 'Upload Failed',
      description: message,
      variant: 'destructive',
    });
  };

  const handleConfirmParsedData = () => {
    // Logic to save confirmed parsed data and redirect
    toast({
      title: 'CV Saved!',
      description: 'Your structured CV data has been saved.',
    });
    router.push(`/dashboard/cv/manage`); // Redirect to CV management page
  };

  if (cvId && isParsing && parsingStatus === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Parsing Your CV...</CardTitle>
            <CardDescription>
              Our AI is extracting structured data. This may take a few moments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={parsingProgress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              {parsingProgress < 99 ? `Processing... (Current progress: ${parsingProgress}%)` : 'Almost done...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cvId && parsingStatus === 'completed') {
    return (
      <CVParseConfirmation cvId={cvId} onConfirm={handleConfirmParsedData} />
    );
  }

  if (parsingStatus === 'failed' && cvId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>CV Parsing Failed</CardTitle>
            <CardDescription>
              We encountered an issue parsing your CV. Please try again or upload a different file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => { setCvId(null); setParsingStatus('pending'); setParsingProgress(0); }}>
              Try Another Upload
            </Button>
            {/* Potentially add options for manual entry here */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
      <CVUploadForm onFileUploadSuccess={handleFileUploadSuccess} onFileUploadError={handleFileUploadError} />
    </div>
  );
}
