// frontend/src/components/features/cv-upload/CVUploadForm.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast'; // Assuming shadcn/ui toast

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  cvFile: z
    .any()
    .refine((file) => file?.length > 0, 'CV file is required.')
    .refine((file) => file?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file?.[0]?.type),
      'Only .pdf, .docx, and .txt formats are supported.'
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface CVUploadFormProps {
  onFileUploadSuccess: (cvId: string) => void;
  onFileUploadError: (message: string) => void;
}

export function CVUploadForm({ onFileUploadSuccess, onFileUploadError }: CVUploadFormProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: FormValues) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('cv_file', data.cvFile[0]);

    try {
      const response = await fetch('/api/v1/cvs/parse', {
        method: 'POST',
        body: formData,
        // Headers like 'Content-Type': 'multipart/form-data' are usually
        // automatically set by the browser when using FormData.
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'File upload failed');
      }

      const result = await response.json();
      toast({
        title: 'Upload Successful!',
        description: result.message,
      });
      onFileUploadSuccess(result.data.cvId);
    } catch (error: any) {
      toast({
        title: 'Upload Failed!',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
      onFileUploadError(error.message || 'Unknown error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload Your CV</CardTitle>
        <CardDescription>
          Upload your existing CV (PDF, DOCX, or TXT) to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="cvFile">CV File</Label>
            <Input
              id="cvFile"
              type="file"
              {...register('cvFile')}
              disabled={isUploading}
            />
            {errors.cvFile && (
              <p className="text-sm font-medium text-destructive">{String(errors.cvFile.message)}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Max file size: 5MB. Supported formats: .pdf, .docx, .txt
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload & Parse CV'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
