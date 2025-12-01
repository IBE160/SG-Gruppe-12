// frontend/src/components/features/cv-preview/TemplateSelector.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, FileText, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface TemplateSelectorProps {
  cvId: number;
  onTemplateSelect?: (templateName: string) => void;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
}

export function TemplateSelector({ cvId, onTemplateSelect, onDownloadStart, onDownloadComplete }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const templates = [
    { name: 'Modern', value: 'modern' },
    { name: 'Classic', value: 'classic' },
    // Add more templates as they become available
  ];

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    setIsDownloading(true);
    if (onDownloadStart) {
      onDownloadStart();
    }

    try {
      const response = await fetch(`/api/v1/cvs/${cvId}/download/${format}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to request ${format} generation.`);
      }

      const { data: { jobId } } = await response.json();

      toast({
        title: `Generating ${format.toUpperCase()}...`,
        description: 'Your document is being prepared. It will download automatically.',
      });

      // Poll for job status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/v1/cvs/download/status/${jobId}`);
          if (!statusResponse.ok) {
            throw new Error('Failed to fetch job status.');
          }
          const statusResult = await statusResponse.json();

          if (statusResult.data.state === 'completed') {
            clearInterval(pollInterval);
            const downloadResponse = await fetch(`/api/v1/cvs/download/file/${jobId}`);
            if (!downloadResponse.ok) {
              throw new Error('Failed to download generated file.');
            }

            // Create a blob from the response and trigger download
            const blob = await downloadResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = statusResult.data.result.fileName; // Use filename from job result
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast({
              title: 'Download Complete',
              description: `Your ${format.toUpperCase()} is ready!`,
            });
            if (onDownloadComplete) {
              onDownloadComplete();
            }
            setIsDownloading(false);
          } else if (statusResult.data.state === 'failed') {
            clearInterval(pollInterval);
            throw new Error(statusResult.data.reason || 'Document generation failed.');
          }
        } catch (pollError: any) {
          clearInterval(pollInterval);
          console.error('Polling error:', pollError);
          toast({
            title: 'Download Failed',
            description: pollError.message || `Could not generate ${format.toUpperCase()}. Please try again.`,
            variant: 'destructive',
          });
          setIsDownloading(false);
        }
      }, 3000); // Poll every 3 seconds

    } catch (error: any) {
      console.error('Document generation request error:', error);
      toast({
        title: 'Download Failed',
        description: error.message || 'An unexpected error occurred during download.',
        variant: 'destructive',
      });
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isDownloading}>
            <FileText className="mr-2 h-4 w-4" />
            Template: {templates.find(t => t.value === selectedTemplate)?.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Select Template</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {templates.map((template) => (
            <DropdownMenuItem key={template.value} onClick={() => handleTemplateChange(template.value)}>
              {template.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={() => handleDownload('pdf')} disabled={isDownloading}>
        {isDownloading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Download PDF
      </Button>
      <Button onClick={() => handleDownload('docx')} disabled={isDownloading} variant="outline">
        {isDownloading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Download DOCX
      </Button>
    </div>
  );
}
