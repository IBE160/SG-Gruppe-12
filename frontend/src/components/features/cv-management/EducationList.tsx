// frontend/src/components/features/cv-management/EducationList.tsx
"use client";

import { useState } from 'react';
import { EducationEntry } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { EducationForm } from './EducationForm';
import { useToast } from '@/components/ui/use-toast';

interface EducationListProps {
  cvId: string;
  education: EducationEntry[];
  onAdd: (data: EducationEntry) => Promise<void>;
  onUpdate: (index: number, data: Partial<EducationEntry>) => Promise<void>;
  onDelete: (index: number) => Promise<void>;
}

export function EducationList({ cvId, education, onAdd, onUpdate, onDelete }: EducationListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSave = async (data: EducationEntry) => {
    setIsSaving(true);
    try {
      if (editingIndex !== null) {
        await onUpdate(editingIndex, data);
        toast({ title: 'Success', description: 'Education entry updated.' });
      } else {
        await onAdd(data);
        toast({ title: 'Success', description: 'Education entry added.' });
      }
      setEditingIndex(null); // Exit edit mode
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save education entry.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this education entry?')) {
      setIsSaving(true);
      try {
        await onDelete(index);
        toast({ title: 'Success', description: 'Education entry deleted.' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to delete education entry.' });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {education.map((entry, index) => (
        <Card key={index} className="relative">
          <CardHeader>
            <CardTitle>{entry.degree} at {entry.institution}</CardTitle>
            <p className="text-sm text-muted-foreground">{entry.startDate} - {entry.endDate || 'Present'}</p>
          </CardHeader>
          <CardContent>
            {editingIndex === index ? (
              <EducationForm
                cvId={cvId}
                initialData={entry}
                onSave={(data) => handleSave(data)}
                onCancel={() => setEditingIndex(null)}
                isSaving={isSaving}
              />
            ) : (
              <>
                <p className="text-sm">{entry.fieldOfStudy}</p>
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
        <EducationForm
          cvId={cvId}
          onSave={(data) => handleSave(data)}
          onCancel={() => {}} // No cancel option when adding new
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
