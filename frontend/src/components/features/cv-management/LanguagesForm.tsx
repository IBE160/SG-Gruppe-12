// frontend/src/components/features/cv-management/LanguagesForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LanguageEntry } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languageEntrySchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  level: z.string().optional(),
});

interface LanguagesFormProps {
  onSubmit: (data: LanguageEntry) => void;
  onDataChange?: (data: LanguageEntry) => void;
  initialData?: Partial<LanguageEntry>;
  isLoading: boolean;
}

const LanguagesForm: React.FC<LanguagesFormProps> = ({ onSubmit, onDataChange, initialData, isLoading }) => {
  const form = useForm<LanguageEntry>({
    resolver: zodResolver(languageEntrySchema),
    defaultValues: initialData || {
      name: '',
      level: '',
    },
  });

  useEffect(() => {
    if (onDataChange) {
      const subscription = form.watch((value) => {
        onDataChange(value as LanguageEntry);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, onDataChange]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <FormControl>
                <Input placeholder="e.g., English, Spanish" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proficiency Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Native">Native</SelectItem>
                  <SelectItem value="Fluent">Fluent</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Basic">Basic</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Language'}
        </Button>
      </form>
    </Form>
  );
};

export default LanguagesForm;
