// frontend/src/components/features/cv-management/WorkExperienceForm.tsx
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { experienceEntrySchema } from '@/lib/schemas/cv'; // Frontend Zod schema for validation
import { ExperienceEntry } from '@/types/cv'; // Frontend type for ExperienceEntry

// Define the form schema using the experienceEntrySchema
type WorkExperienceFormValues = z.infer<typeof experienceEntrySchema>;

interface WorkExperienceFormProps {
  cvId: string;
  initialData?: ExperienceEntry; // For editing existing entry
  onSave: (data: WorkExperienceFormValues) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function WorkExperienceForm({ cvId, initialData, onSave, onCancel, isSaving }: WorkExperienceFormProps) {
  const form = useForm<WorkExperienceFormValues>({
    resolver: zodResolver(experienceEntrySchema),
    defaultValues: initialData || {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: WorkExperienceFormValues) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold">{initialData ? 'Edit Work Experience' : 'Add New Work Experience'}</h3>
      
      <div>
        <Label htmlFor="title">Job Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-sm font-medium text-destructive">{errors.title.message}</p>}
      </div>
      
      <div>
        <Label htmlFor="company">Company</Label>
        <Input id="company" {...register('company')} />
        {errors.company && <p className="text-sm font-medium text-destructive">{errors.company.message}</p>}
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" {...register('location')} />
        {errors.location && <p className="text-sm font-medium text-destructive">{errors.location.message}</p>}
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
        <Textarea id="description" {...register('description')} rows={5} />
        {errors.description && <p className="text-sm font-medium text-destructive">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Experience'}
        </Button>
      </div>
    </form>
  );
}
