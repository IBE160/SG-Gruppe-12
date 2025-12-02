// frontend/src/components/features/cv-management/LanguagesForm.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { LanguageEntry } from '@/types/cv'; // Assuming LanguageEntry is defined here

// --- Zod Schema for Languages ---
const formSchema = z.object({
  languages: z.array(z.object({
    name: z.string().min(1, 'Language name is required'),
    proficiency: z.enum(['basic', 'conversational', 'fluent', 'native']).optional(),
  })),
});

interface LanguagesFormProps {
  cvId: string;
  initialLanguages?: LanguageEntry[];
  onSave?: (updatedLanguages: LanguageEntry[]) => void;
}

export function LanguagesForm({ cvId, initialLanguages = [], onSave }: LanguagesFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      languages: initialLanguages,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    // In a real application, you would send this to your backend API
    // e.g., fetch(`/api/v1/cvs/${cvId}/languages`, { method: 'PATCH', body: JSON.stringify(data.languages) })
    // For now, we simulate success
    console.log("Saving languages:", data.languages);

    try {
      const response = await fetch(`/api/v1/cvs/${cvId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ languages: data.languages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save languages.');
      }

      toast({
        title: "Languages Saved",
        description: "Your language proficiencies have been updated successfully.",
      });
      if (onSave) {
        onSave(data.languages);
      }
    } catch (error: any) {
      console.error("Failed to save languages:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save languages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Languages</CardTitle>
        <CardDescription>Add, edit, or remove your language proficiencies.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 border p-4 rounded-md">
                <h4 className="font-semibold">Language #{index + 1}</h4>
                <FormField
                  control={form.control}
                  name={`languages.${index}.name`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>Language Name</FormLabel>
                      <FormControl>
                        <Input placeholder="English" {...formField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`languages.${index}.proficiency`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>Proficiency</FormLabel>
                      <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select proficiency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="fluent">Fluent</SelectItem>
                          <SelectItem value="native">Native</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <Trash2 className="mr-2 h-4 w-4" /> Remove Language
                </Button>
                {index < fields.length - 1 && <Separator className="my-4" />}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "" })}
              disabled={isSaving}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Language
            </Button>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save All Languages'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}