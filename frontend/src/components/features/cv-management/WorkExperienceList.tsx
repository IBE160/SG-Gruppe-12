// frontend/src/components/features/cv-management/WorkExperienceList.tsx
"use client";

import { useState } from 'react';
import { ExperienceEntry } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { WorkExperienceForm } from './WorkExperienceForm';
import { useToast } from '@/components/ui/use-toast';

interface WorkExperienceListProps {
  cvId: string;
  experience: ExperienceEntry[];
  onAdd: (data: ExperienceEntry) => Promise<void>;
  onUpdate: (index: number, data: Partial<ExperienceEntry>) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
}

export function WorkExperienceList({ cvId, experience, onAdd, onUpdate, onDelete }: WorkExperienceListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSave = async (data: ExperienceEntry) => {
    setIsSaving(true);
    try {
      if (editingIndex !== null) {
        await onUpdate(editingIndex, data);
        toast({ title: 'Success', description: 'Experience updated.' });
      } else {
        await onAdd(data);
        toast({ title: 'Success', description: 'Experience added.' });
      }
      setEditingIndex(null); // Exit edit mode
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save experience.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this work experience entry?')) {
      setIsSaving(true);
      try {
        await onDelete(index);
        toast({ title: 'Success', description: 'Experience deleted.' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to delete experience.' });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {experience.map((entry, index) => (
        <Card key={index} className="relative">
          <CardHeader>
            <CardTitle>{entry.title} at {entry.company}</CardTitle>
            <p className="text-sm text-muted-foreground">{entry.startDate} - {entry.endDate || 'Present'}</p>
          </CardHeader>
          <CardContent>
            {editingIndex === index ? (
              <WorkExperienceForm
                cvId={cvId}
                initialData={entry}
                onSave={(data) => handleSave(data)}
                onCancel={() => setEditingIndex(null)}
                isSaving={isSaving}
              />
            ) : (
              <>
                <p className="text-sm">{entry.description}</p>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => setEditingIndex(index)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                    <TrashIcon className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {editingIndex === null && (
        <WorkExperienceForm
          cvId={cvId}
          onSave={(data) => handleSave(data)}
          onCancel={() => {}} // No cancel option when adding new
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
