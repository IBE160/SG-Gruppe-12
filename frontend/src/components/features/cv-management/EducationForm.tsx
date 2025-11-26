// frontend/src/components/features/cv-management/EducationForm.tsx
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { educationEntrySchema } from '@/lib/schemas/cv'; // Frontend Zod schema for validation
import { EducationEntry } from '@/types/cv'; // Frontend type for EducationEntry

type EducationFormValues = z.infer<typeof educationEntrySchema>;

interface EducationFormProps {
  cvId: string;
  initialData?: EducationEntry; // For editing existing entry
  onSave: (data: EducationFormValues) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function EducationForm({ cvId, initialData, onSave, onCancel, isSaving }: EducationFormProps) {
  const form = useForm<EducationFormValues>({
    resolver: zodResolver(educationEntrySchema),
    defaultValues: initialData || {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: EducationFormValues) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold">{initialData ? 'Edit Education Entry' : 'Add New Education Entry'}</h3>
      
      <div>
        <Label htmlFor="institution">Institution</Label>
        <Input id="institution" {...register('institution')} />
        {errors.institution && <p className="text-sm font-medium text-destructive">{errors.institution.message}</p>}
      </div>
      
      <div>
        <Label htmlFor="degree">Degree</Label>
        <Input id="degree" {...register('degree')} />
        {errors.degree && <p className="text-sm font-medium text-destructive">{errors.degree.message}</p>}
      </div>

      <div>
        <Label htmlFor="fieldOfStudy">Field of Study</Label>
        <Input id="fieldOfStudy" {...register('fieldOfStudy')} />
        {errors.fieldOfStudy && <p className="text-sm font-medium text-destructive">{errors.fieldOfStudy.message}</p>}
      </div>

      <div>
        <Label htmlFor="startDate">Start Date (YYYY-MM-DD)</Label>
        <Input id="startDate" type="date" {...register('startDate')} />
        {errors.startDate && <p className="text-sm font-medium text-destructive">{errors.startDate.message}</p>}
      </div>

      <div>
        <Label htmlFor="endDate">End Date (YYYY-MM-DD) - Leave blank if current</Label>
        <Input id="endDate" type="date" {...register('endDate')} />
        {errors.endDate && <p className="text-sm font-medium text-destructive">{errors.endDate.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={3} />
        {errors.description && <p className="text-sm font-medium text-destructive">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Education'}
        </Button>
      </div>
    </form>
  );
}
