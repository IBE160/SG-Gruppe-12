// frontend/src/components/features/cv-upload/CVParseConfirmation.tsx
"use client";

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { CvData } from '@/types/cv';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cvDataSchema } from '@/lib/schemas/cv';

interface CVParseConfirmationProps {
  cvId: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function CVParseConfirmation({ cvId, onConfirm, onCancel }: CVParseConfirmationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<CvData>({
    resolver: zodResolver(cvDataSchema),
    defaultValues: {
      personal_info: {},
      education: [],
      experience: [],
      skills: [],
      languages: [],
      summary: '',
    },
  });

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control: form.control,
    name: 'experience',
  });

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control: form.control,
    name: 'education',
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: 'skills',
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control: form.control,
    name: 'languages',
  });

  useEffect(() => {
    const fetchCvData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/v1/cvs/${cvId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch parsed CV data');
        }
        const result = await response.json();
        const cvData = result.data;

        // Reset form with fetched data
        form.reset({
          personal_info: cvData.personal_info || {},
          education: cvData.education || [],
          experience: cvData.experience || [],
          skills: cvData.skills || [],
          languages: cvData.languages || [],
          summary: cvData.summary || '',
        });
      } catch (err: any) {
        const errorMsg = err.message || 'An unexpected error occurred while fetching CV data.';
        setError(errorMsg);
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCvData();
  }, [cvId]);

  const onSubmit = async (data: CvData) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/v1/cvs/${cvId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save CV data');
      }

      toast({
        title: 'Success',
        description: 'CV data saved successfully',
      });

      onConfirm();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save CV data',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading parsed CV data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Error Loading CV</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="w-full max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Review & Edit Your CV Data</CardTitle>
          <CardDescription>
            Please review and edit the extracted information. All fields can be modified before saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[70vh]">
          <ScrollArea className="h-full pr-4">
            {/* Personal Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/50">
                <div>
                  <Label htmlFor="personal_info.name">Name</Label>
                  <Input id="personal_info.name" {...form.register('personal_info.name')} />
                  {form.formState.errors.personal_info?.name && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.personal_info.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="personal_info.email">Email</Label>
                  <Input id="personal_info.email" type="email" {...form.register('personal_info.email')} />
                  {form.formState.errors.personal_info?.email && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.personal_info.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="personal_info.phone">Phone</Label>
                  <Input id="personal_info.phone" {...form.register('personal_info.phone')} />
                </div>
                <div>
                  <Label htmlFor="personal_info.address">Address</Label>
                  <Input id="personal_info.address" {...form.register('personal_info.address')} />
                </div>
                <div>
                  <Label htmlFor="personal_info.linkedin">LinkedIn</Label>
                  <Input id="personal_info.linkedin" {...form.register('personal_info.linkedin')} />
                </div>
                <div>
                  <Label htmlFor="personal_info.portfolio">Portfolio</Label>
                  <Input id="personal_info.portfolio" {...form.register('personal_info.portfolio')} />
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Experience</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendExperience({ title: '', company: '', location: '', start_date: '', end_date: '', description: '' })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Experience
                </Button>
              </div>
              <div className="space-y-4 pl-4 border-l-2 border-primary/50">
                {experienceFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(index)}
                        aria-label={`Remove Experience ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`experience.${index}.title`}>Title *</Label>
                        <Input {...form.register(`experience.${index}.title`)} />
                        {form.formState.errors.experience?.[index]?.title && (
                          <p className="text-sm text-destructive mt-1">{form.formState.errors.experience[index]?.title?.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`experience.${index}.company`}>Company *</Label>
                        <Input {...form.register(`experience.${index}.company`)} />
                        {form.formState.errors.experience?.[index]?.company && (
                          <p className="text-sm text-destructive mt-1">{form.formState.errors.experience[index]?.company?.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`experience.${index}.location`}>Location</Label>
                        <Input {...form.register(`experience.${index}.location`)} />
                      </div>
                      <div>
                        <Label htmlFor={`experience.${index}.start_date`}>Start Date</Label>
                        <Input {...form.register(`experience.${index}.start_date`)} placeholder="YYYY-MM or YYYY-MM-DD" />
                      </div>
                      <div>
                        <Label htmlFor={`experience.${index}.end_date`}>End Date</Label>
                        <Input {...form.register(`experience.${index}.end_date`)} placeholder="YYYY-MM or Present" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`experience.${index}.description`}>Description</Label>
                      <Textarea {...form.register(`experience.${index}.description`)} rows={3} />
                    </div>
                  </div>
                ))}
                {experienceFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">No experience added. Click "Add Experience" to add an entry.</p>
                )}
              </div>
            </div>

            {/* Education Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Education</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendEducation({ institution: '', degree: '', location: '', start_date: '', end_date: '', description: '' })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Education
                </Button>
              </div>
              <div className="space-y-4 pl-4 border-l-2 border-primary/50">
                {educationFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-md space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEducation(index)}
                        aria-label={`Remove Education ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`education.${index}.institution`}>Institution *</Label>
                        <Input {...form.register(`education.${index}.institution`)} />
                        {form.formState.errors.education?.[index]?.institution && (
                          <p className="text-sm text-destructive mt-1">{form.formState.errors.education[index]?.institution?.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`education.${index}.degree`}>Degree *</Label>
                        <Input {...form.register(`education.${index}.degree`)} />
                        {form.formState.errors.education?.[index]?.degree && (
                          <p className="text-sm text-destructive mt-1">{form.formState.errors.education[index]?.degree?.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`education.${index}.location`}>Location</Label>
                        <Input {...form.register(`education.${index}.location`)} />
                      </div>
                      <div>
                        <Label htmlFor={`education.${index}.start_date`}>Start Date</Label>
                        <Input {...form.register(`education.${index}.start_date`)} placeholder="YYYY-MM or YYYY-MM-DD" />
                      </div>
                      <div>
                        <Label htmlFor={`education.${index}.end_date`}>End Date</Label>
                        <Input {...form.register(`education.${index}.end_date`)} placeholder="YYYY-MM or YYYY-MM-DD" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`education.${index}.description`}>Description</Label>
                      <Textarea {...form.register(`education.${index}.description`)} rows={2} />
                    </div>
                  </div>
                ))}
                {educationFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">No education added. Click "Add Education" to add an entry.</p>
                )}
              </div>
            </div>

            {/* Skills Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Skills</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendSkill({ name: '', proficiency: 'intermediate', keywords: [] })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Skill
                </Button>
              </div>
              <div className="space-y-3 pl-4 border-l-2 border-primary/50">
                {skillFields.map((field, index) => (
                  <div key={field.id} className="p-3 border rounded-md flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`skills.${index}.name`}>Skill Name *</Label>
                        <Input id={`skills.${index}.name`} {...form.register(`skills.${index}.name`)} />
                        {form.formState.errors.skills?.[index]?.name && (
                          <p className="text-sm text-destructive mt-1">{form.formState.errors.skills[index]?.name?.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`skills.${index}.proficiency`}>Proficiency</Label>
                        <Select
                          value={form.watch(`skills.${index}.proficiency`)}
                          onValueChange={(value) => form.setValue(`skills.${index}.proficiency`, value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`skills.${index}.keywords`}>Keywords (comma-separated)</Label>
                        <Input
                          {...form.register(`skills.${index}.keywords`)}
                          placeholder="e.g., React, TypeScript"
                          onChange={(e) => {
                            const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
                            form.setValue(`skills.${index}.keywords`, keywords);
                          }}
                          value={form.watch(`skills.${index}.keywords`)?.join(', ') || ''}
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkill(index)}
                      aria-label={`Remove Skill ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {skillFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills added. Click "Add Skill" to add an entry.</p>
                )}
              </div>
            </div>

            {/* Languages Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Languages</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendLanguage({ name: '', proficiency: 'conversational' })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Language
                </Button>
              </div>
              <div className="space-y-3 pl-4 border-l-2 border-primary/50">
                {languageFields.map((field, index) => (
                  <div key={field.id} className="p-3 border rounded-md flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`languages.${index}.name`}>Language *</Label>
                        <Input {...form.register(`languages.${index}.name`)} />
                        {form.formState.errors.languages?.[index]?.name && (
                          <p className="text-sm text-destructive mt-1">{form.formState.errors.languages[index]?.name?.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor={`languages.${index}.proficiency`}>Proficiency</Label>
                        <Select
                          value={form.watch(`languages.${index}.proficiency`)}
                          onValueChange={(value) => form.setValue(`languages.${index}.proficiency`, value as any)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="conversational">Conversational</SelectItem>
                            <SelectItem value="fluent">Fluent</SelectItem>
                            <SelectItem value="native">Native</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLanguage(index)}
                      aria-label={`Remove Language ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {languageFields.length === 0 && (
                  <p className="text-sm text-muted-foreground">No languages added. Click "Add Language" to add an entry.</p>
                )}
              </div>
            </div>

            {/* Summary Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Professional Summary</h3>
              <div className="pl-4 border-l-2 border-primary/50">
                <Textarea {...form.register('summary')} rows={4} placeholder="Write a brief professional summary..." />
              </div>
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving} className="flex-1">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSaving} className="flex-1">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Confirm & Save'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
