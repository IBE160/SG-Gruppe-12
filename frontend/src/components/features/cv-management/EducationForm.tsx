// frontend/src/components/features/cv-management/EducationForm.tsx
"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { EducationEntry } from '@/types/cv'; // Assuming EducationEntry is defined here

// --- Zod Schema for Education ---
const formSchema = z.object({
  education: z.array(z.object({
    institution: z.string().min(1, 'Institution name is required'),
    degree: z.string().min(1, 'Degree is required'),
    location: z.string().optional(),
    start_date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'Start date must be YYYY-MM-DD or YYYY-MM'),
    end_date: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'End date must be YYYY-MM-DD or YYYY-MM').optional(),
    description: z.string().optional(),
  })),
});

interface EducationFormProps {
  cvId: number;
  initialEducation?: EducationEntry[];
  onSave?: (updatedEducation: EducationEntry[]) => void;
}

export function EducationForm({ cvId, initialEducation = [], onSave }: EducationFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      education: initialEducation,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    // In a real application, you would send this to your backend API
    // e.g., fetch(`/api/v1/cvs/${cvId}/education`, { method: 'PATCH', body: JSON.stringify(data.education) })
    // For now, we simulate success
    console.log("Saving education:", data.education);

    try {
      const response = await fetch(`/api/v1/cvs/${cvId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ education: data.education }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save education.');
      }

      toast({
        title: "Education Saved",
        description: "Your education history has been updated successfully.",
      });
      if (onSave) {
        onSave(data.education);
      }
    } catch (error: any) {
      console.error("Failed to save education:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save education. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardDescription>Add, edit, or remove your educational background.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 border p-4 rounded-md">
                <h4 className="font-semibold">Education #{index + 1}</h4>
                <FormField
                  control={form.control}
                  name={`education.${index}.institution`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>Institution</FormLabel>
                      <FormControl>
                        <Input placeholder="University Name" {...formField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`education.${index}.degree`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>Degree</FormLabel>
                      <FormControl>
                        <Input placeholder="Bachelor of Science" {...formField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`education.${index}.location`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...formField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`education.${index}.start_date`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>Start Date (YYYY-MM-DD)</FormLabel>
                        <FormControl>
                          <Input placeholder="2016-09-01" {...formField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`education.${index}.end_date`}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>End Date (YYYY-MM-DD)</FormLabel>
                        <FormControl>
                          <Input placeholder="2020-06-30" {...formField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`education.${index}.description`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Relevant coursework, achievements..." {...formField} />
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
                  disabled={isSaving}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remove Education
                </Button>
                {index < fields.length - 1 && <Separator className="my-4" />}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ institution: "", degree: "", location: "", start_date: "", end_date: "", description: "" })}
              disabled={isSaving}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Education
            </Button>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save All Education'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
