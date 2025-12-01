// frontend/src/components/features/cv-management/WorkExperienceForm.tsx
"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { ExperienceEntry } from '@/types/cv'; // Assuming ExperienceEntry is defined here

// --- Zod Schema for Work Experience ---
const formSchema = z.object({
  experiences: z.array(z.object({
    title: z.string().min(1, 'Job title is required'),
    company: z.string().min(1, 'Company name is required'),
    location: z.string().optional(),
    start_date: z.string().min(1, 'Start date is required').regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'Start date must be YYYY-MM-DD or YYYY-MM'),
    end_date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/).optional().or(z.literal('')),
    description: z.string().optional(),
  })),
});

interface WorkExperienceFormProps {
  cvId: string;
  initialExperiences?: ExperienceEntry[];
  onSubmit?: (data: z.infer<typeof formSchema>) => void;
  isLoading?: boolean;
}

export function WorkExperienceForm({ cvId, initialExperiences = [], onSubmit, isLoading = false }: WorkExperienceFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      experiences: initialExperiences,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    if (onSubmit) {
      await onSubmit(data);
    } else {
      // Fallback behavior if no onSubmit is provided
      console.log("Saving experiences:", data.experiences);
      try {
        const response = await fetch(`/api/v1/cvs/${cvId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ experience: data.experiences }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save work experience.');
        }

        toast({
          title: "Work Experience Saved",
          description: "Your work experience has been updated successfully.",
        });
      } catch (error: any) {
        console.error("Failed to save work experience:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to save work experience. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Experience</CardTitle>
        <CardDescription>Add, edit, or remove your professional experience.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 border p-4 rounded-md">
                <h4 className="font-semibold">Experience #{index + 1}</h4>
                <FormField
                  control={form.control}
                  name={`experiences.${index}.title`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel htmlFor={`experience-${index}-title`}>Job Title</FormLabel>
                      <FormControl>
                        <Input id={`experience-${index}-title`} placeholder="Software Engineer" {...formField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`experiences.${index}.company`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel htmlFor={`experience-${index}-company`}>Company</FormLabel>
                      <FormControl>
                        <Input id={`experience-${index}-company`} placeholder="Tech Solutions Inc." {...formField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`experiences.${index}.location`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel htmlFor={`experience-${index}-location`}>Location</FormLabel>
                      <FormControl>
                        <Input id={`experience-${index}-location`} placeholder="City, Country" {...formField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`experiences.${index}.start_date`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel htmlFor={`experience-${index}-startDate`}>Start Date (YYYY-MM-DD)</FormLabel>
                        <FormControl>
                          <Input id={`experience-${index}-startDate`} placeholder="2020-01-01" {...formField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`experiences.${index}.end_date`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel htmlFor={`experience-${index}-endDate`}>End Date (YYYY-MM-DD or Present)</FormLabel>
                        <FormControl>
                          <Input id={`experience-${index}-endDate`} placeholder="2022-12-31 or present" {...formField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`experiences.${index}.description`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel htmlFor={`experience-${index}-description`}>Description</FormLabel>
                      <FormControl>
                        <Textarea id={`experience-${index}-description`} placeholder="Key responsibilities and achievements..." {...formField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 text-destructive hover:text-destructive"
                  onClick={() => remove(index)}
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remove Experience
                </Button>
                {index < fields.length - 1 && <Separator className="my-4" />}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ title: "", company: "", location: "", start_date: "", end_date: "", description: "" })}
              disabled={isLoading}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
            </Button>

            <Button type="submit" className="w-full" disabled={isLoading || !fields.length}>
              {isLoading ? 'Saving...' : 'Save All Work Experiences'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
