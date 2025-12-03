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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Loader2, UploadCloud, FileText } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];

// Schema for file upload
const fileFormSchema = z.object({
  cvFile: z.any()
    .refine((files) => {
      // Handle FileList or array-like objects (for test environments)
      if (!files) return false;
      const fileList = files instanceof FileList ? files : (files.length !== undefined ? files : null);
      return fileList && fileList.length > 0;
    }, "CV file is required.")
    .refine((files) => {
      if (!files || files.length === 0) return true;
      const file = files[0];
      return file && file.size <= MAX_FILE_SIZE;
    }, `Max file size is 5MB.`)
    .refine((files) => {
      if (!files || files.length === 0) return true;
      const file = files[0];
      return file && ACCEPTED_FILE_TYPES.includes(file.type);
    }, "Only PDF, DOCX, DOC, and TXT files are accepted."),
});

// Schema for text input
const textFormSchema = z.object({
  cvText: z.string()
    .min(50, 'CV text must be at least 50 characters long.')
    .max(50000, 'CV text cannot exceed 50,000 characters.'),
  title: z.string().optional(),
});

type FileFormValues = z.infer<typeof fileFormSchema>;
type TextFormValues = z.infer<typeof textFormSchema>;

interface CVUploadFormProps {
  onFileUploadSuccess: (cvId: string) => void;
  onFileUploadError: (message: string) => void;
}

export function CVUploadForm({ onFileUploadSuccess, onFileUploadError }: CVUploadFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const fileForm = useForm<FileFormValues>({
    resolver: zodResolver(fileFormSchema),
  });

  const textForm = useForm<TextFormValues>({
    resolver: zodResolver(textFormSchema),
  });

  const onFileSubmit = async (data: FileFormValues) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('cv_file', data.cvFile[0]);

    try {
      const response = await fetch('/api/v1/cvs/parse', {
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

  const onTextSubmit = async (data: TextFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/cvs/parse-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvText: data.cvText,
          title: data.title || 'Untitled CV (from text)',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to parse CV text.');
      }

      const result = await response.json();
      onFileUploadSuccess(result.data.cvId);
      toast({
        title: 'Parsing Successful',
        description: 'Your CV text has been parsed successfully.',
      });
    } catch (error: any) {
      console.error('Text parsing error:', error);
      onFileUploadError(error.message || 'An unexpected error occurred during parsing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="mt-4">Add Your CV</CardTitle>
        <CardDescription>
          Upload a file or paste your CV text to automatically extract your CV data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">
              <UploadCloud className="mr-2 h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="text">
              <FileText className="mr-2 h-4 w-4" />
              Paste Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="mt-4">
            <form onSubmit={fileForm.handleSubmit(onFileSubmit)} className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="cvFile">CV File</Label>
                <Input
                  id="cvFile"
                  type="file"
                  {...fileForm.register('cvFile')}
                  disabled={isLoading}
                  accept={ACCEPTED_FILE_TYPES.join(',')}
                />
                {fileForm.formState.errors.cvFile && (
                  <p className="text-sm font-medium text-destructive">
                    {fileForm.formState.errors.cvFile.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Supported formats: PDF, DOCX, DOC, TXT (max 5MB)
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading and parsing...
                  </>
                ) : (
                  'Upload and Parse'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="text" className="mt-4">
            <form onSubmit={textForm.handleSubmit(onTextSubmit)} className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="title">CV Title (Optional)</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Senior Developer CV"
                  {...textForm.register('title')}
                  disabled={isLoading}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="cvText">CV Text</Label>
                <Textarea
                  id="cvText"
                  placeholder="Paste your CV content here..."
                  rows={15}
                  {...textForm.register('cvText')}
                  disabled={isLoading}
                  className="font-mono text-sm"
                />
                {textForm.formState.errors.cvText && (
                  <p className="text-sm font-medium text-destructive">
                    {textForm.formState.errors.cvText.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  💡 Paste your CV content directly - no file upload needed (min 50 characters)
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing CV text...
                  </>
                ) : (
                  'Parse CV Text'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}