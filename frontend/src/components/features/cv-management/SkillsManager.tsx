// frontend/src/components/features/cv-management/SkillsManager.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { SkillEntry } from '@/types/cv'; // Assuming SkillEntry is defined here

// --- Zod Schema for Skills ---
const formSchema = z.object({
  skills: z.array(z.object({
    name: z.string().min(1, 'Skill name is required'),
    proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    keywords: z.array(z.string()).optional(),
  })),
});

interface SkillsManagerProps {
  cvId: string;
  initialSkills?: SkillEntry[];
  onSave?: (updatedSkills: SkillEntry[]) => void;
}

export function SkillsManager({ cvId, initialSkills = [], onSave }: SkillsManagerProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: initialSkills,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    // In a real application, you would send this to your backend API
    // e.g., fetch(`/api/v1/cvs/${cvId}/skills`, { method: 'PATCH', body: JSON.stringify(data.skills) })
    // For now, we simulate success
    console.log("Saving skills:", data.skills);

    try {
      const response = await fetch(`/api/v1/cvs/${cvId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills: data.skills }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save skills.');
      }

      toast({
        title: "Skills Saved",
        description: "Your skills have been updated successfully.",
      });
      if (onSave) {
        onSave(data.skills);
      }
    } catch (error: any) {
      console.error("Failed to save skills:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save skills. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>Add, edit, or remove your technical and soft skills.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 border p-4 rounded-md">
                <h4 className="font-semibold">Skill #{index + 1}</h4>
                <FormField
                  control={form.control}
                  name={`skills.${index}.name`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>Skill Name</FormLabel>
                      <FormControl>
                        <Input placeholder="JavaScript" {...formField} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`skills.${index}.proficiency`}
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
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`skills.${index}.keywords`}
                  render={({ field: formField }) => (
                    <FormItem>
                      <FormLabel>Keywords (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Node.js, React, Express"
                          {...formField}
                          value={formField.value?.join(', ') || ''}
                          onChange={e => formField.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        />
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
                  <Trash2 className="mr-2 h-4 w-4" /> Remove Skill
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
              <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
            </Button>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save All Skills'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
