// frontend/src/components/features/cv-management/EducationForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { educationEntrySchema } from '@/lib/schemas/cv';
import { EducationEntry } from '@/types/cv';
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

interface EducationFormProps {
  onSubmit: (data: EducationEntry) => void;
  onDataChange?: (data: EducationEntry) => void;
  initialData?: Partial<EducationEntry>;
  isLoading: boolean;
}

const EducationForm: React.FC<EducationFormProps> = ({ onSubmit, onDataChange, initialData, isLoading }) => {
  const form = useForm<EducationEntry>({
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

  useEffect(() => {
    if (onDataChange) {
      const subscription = form.watch((value) => {
        onDataChange(value as EducationEntry);
      });
      return () => subscription.unsubscribe();
    }
  }, [form.watch, onDataChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ... form fields ... */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Education'}
        </Button>
      </form>
    </Form>
  );
};

export default EducationForm;