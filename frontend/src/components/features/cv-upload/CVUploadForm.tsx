// frontend/src/components/features/cv-upload/CVUploadForm.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];

const formSchema = z.object({
  cvFile: z.instanceof(FileList).refine(fileList => fileList.length > 0, "CV file is required.")
    .refine(fileList => fileList[0].size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(fileList => ACCEPTED_FILE_TYPES.includes(fileList[0].type), "Only PDF, DOCX, DOC, and TXT files are accepted."),
});

type FormValues = z.infer<typeof formSchema>;

interface CVUploadFormProps {
  onFileUploadSuccess: (cvId: string) => void;
  onFileUploadError: (message: string) => void;
}

export function CVUploadForm({ onFileUploadSuccess, onFileUploadError }: CVUploadFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('cv_file', data.cvFile[0]);

    try {
      const response = await fetch('/api/v1/cvs/parse', { // Use the backend API endpoint
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload and parse CV.');
      }

      const result = await response.json();
      onFileUploadSuccess(result.data.cvId);
      toast({
        title: 'Upload Successful',
        description: 'Your CV has been uploaded and parsing has started.',
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      onFileUploadError(error.message || 'An unexpected error occurred during upload.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <UploadCloud className="mx-auto h-12 w-12 text-primary" />
        <CardTitle className="mt-4">Upload Your CV</CardTitle>
        <CardDescription>
          Upload your PDF, DOCX, DOC, or TXT file to automatically extract your CV data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="cvFile">CV File</Label>
            <Input
              id="cvFile"
              type="file"
              {...form.register('cvFile')}
              disabled={isLoading}
              accept={ACCEPTED_FILE_TYPES.join(',')}
            />
            {form.formState.errors.cvFile && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.cvFile.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload and Parse'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}