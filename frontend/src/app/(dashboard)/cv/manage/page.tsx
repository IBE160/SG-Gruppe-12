// frontend/src/app/(dashboard)/cv/manage/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ExperienceEntry, CV } from '@/types/cv'; // Assuming CV type and ExperienceEntry
import { WorkExperienceList } from '@/components/features/cv-management/WorkExperienceList';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming shadcn/ui skeleton

export default function ManageCVPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cvData, setCvData] = useState<CV | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // For MVP, assume there's always one CV for the logged-in user
  // In a real app, you'd fetch the user's current/default CV ID
  const userId = "mock-user-id"; // TODO: Replace with actual logged-in user ID
  const cvId = "mock-cv-id";     // TODO: Replace with actual CV ID (e.g., from user's default CV)

  useEffect(() => {
    const fetchCV = async () => {
      setIsLoading(true);
      try {
        // Fetch CV data for the current user/CV ID
        const response = await fetch(`/api/v1/cvs/${cvId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch CV data');
        }
        const result = await response.json();
        setCvData(result.data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load your CV.',
          variant: 'destructive',
        });
        // Redirect to upload page if no CV found or error
        // router.push('/dashboard/cv/upload');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCV();
  }, [cvId, toast, router]);

  const handleUpdateCV = async (updatedFields: Partial<CV>) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/v1/cvs/${cvId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update CV');
      }
      const result = await response.json();
      setCvData(result.data); // Update local state with new CV data
      toast({ title: 'Success', description: 'CV updated successfully.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update CV.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddExperience = async (newEntry: ExperienceEntry) => {
    // Optimistic update
    const prevExperience = cvData?.experience || [];
    setCvData(prev => prev ? { ...prev, experience: [...prevExperience, newEntry] } : null);

    try {
      const response = await fetch(`/api/v1/cvs/${cvId}/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add work experience');
      }
      const result = await response.json();
      setCvData(result.data); // Backend returns updated CV
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to add work experience.' });
      setCvData(prev => prev ? { ...prev, experience: prevExperience } : null); // Revert optimistic update
    }
  };

  const handleUpdateExperience = async (index: number, updatedEntry: Partial<ExperienceEntry>) => {
    // Optimistic update
    const prevExperience = cvData?.experience || [];
    const newExperienceArray = [...prevExperience];
    newExperienceArray[index] = { ...newExperienceArray[index], ...updatedEntry };
    setCvData(prev => prev ? { ...prev, experience: newExperienceArray } : null);

    try {
      const response = await fetch(`/api/v1/cvs/${cvId}/experience/${index}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEntry),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update work experience');
      }
      const result = await response.json();
      setCvData(result.data); // Backend returns updated CV
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update work experience.' });
      setCvData(prev => prev ? { ...prev, experience: prevExperience } : null); // Revert optimistic update
    }
  };

  const handleDeleteExperience = async (index: number) => {
    // Optimistic update
    const prevExperience = cvData?.experience || [];
    const newExperienceArray = prevExperience.filter((_, i) => i !== index);
    setCvData(prev => prev ? { ...prev, experience: newExperienceArray } : null);

    try {
      const response = await fetch(`/api/v1/cvs/${cvId}/experience/${index}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete work experience');
      }
      const result = await response.json();
      setCvData(result.data); // Backend returns updated CV
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete work experience.' });
      setCvData(prev => prev ? { ...prev, experience: prevExperience } : null); // Revert optimistic update
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!cvData) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>No CV Found</CardTitle>
          <CardDescription>
            You don't have a CV yet. Please upload or create one to manage it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/dashboard/cv/upload')}>Upload New CV</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Manage Your CV</h1>

      {/* Work Experience Section */}
      <Card>
        <CardHeader>
          <CardTitle>Work Experience</CardTitle>
          <CardDescription>Add, edit, or remove your professional experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkExperienceList
            cvId={cvData.id}
            experience={cvData.experience || []}
            onAdd={handleAddExperience}
            onUpdate={handleUpdateExperience}
            onDelete={handleDeleteExperience}
          />
        </CardContent>
      </Card>

      {/* Other CV sections will go here */}
      {/* <Card>
        <CardHeader><CardTitle>Education</CardTitle></CardHeader>
        <CardContent>
          // EducationList component
        </CardContent>
      </Card> */}
    </div>
  );
}
