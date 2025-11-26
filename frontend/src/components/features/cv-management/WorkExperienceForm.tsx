// frontend/src/components/features/cv-management/WorkExperienceForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { experienceEntrySchema } from '@/lib/schemas/cv';
import { ExperienceEntry } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface WorkExperienceFormProps {
  onSubmit: (data: ExperienceEntry) => void;
  onDataChange?: (data: ExperienceEntry) => void;
  initialData?: Partial<ExperienceEntry>;
  isLoading: boolean;
}

const WorkExperienceForm: React.FC<WorkExperienceFormProps> = ({ onSubmit, onDataChange, initialData, isLoading }) => {
  const form = useForm<ExperienceEntry>({
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

  const watchedData = form.watch();

  useEffect(() => {
    if (onDataChange) {
      const subscription = form.watch((value) => {
        onDataChange(value as ExperienceEntry);
      });
      return () => subscription.unsubscribe();
    }
  }, [form.watch, onDataChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ... form fields ... */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Experience'}
        </Button>
      </form>
    </Form>
  );
};

export default WorkExperienceForm;