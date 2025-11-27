// frontend/src/components/features/cv-upload/CVParseConfirmation.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Assuming shadcn/ui textarea
import { CVData, PersonalInfo, EducationEntry, ExperienceEntry, SkillEntry, LanguageEntry } from '@/types/cv'; // Import frontend CV types
import { ChevronDown, ChevronUp } from 'lucide-react'; // Assuming lucide-react for icons

interface CVParseConfirmationProps {
  cvId: string;
  onConfirm: () => void;
}

export function CVParseConfirmation({ cvId, onConfirm }: CVParseConfirmationProps) {
  const { toast } = useToast();
  const [parsedCV, setParsedCV] = useState<CVData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalInfo: true,
    education: false,
    experience: false,
    skills: false,
    languages: false,
  });

  useEffect(() => {
    // In a real application, you would fetch the parsed CV data using the cvId
    // For now, simulate fetching
    const fetchParsedCV = async () => {
      setIsLoading(true);
      try {
        // Simulate API call to fetch parsed CV data
        const response = await fetch(`/api/v1/cvs/${cvId}`); // Assuming an API to get CV data by ID
        if (!response.ok) {
          throw new Error('Failed to fetch parsed CV data');
        }
        const result = await response.json();
        setParsedCV(result.data); // Assuming result.data contains CVData
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load parsed CV data.',
          variant: 'destructive',
        });
        setParsedCV({ // Fallback to empty structure on error
            personal_info: { firstName: '', lastName: '' },
            education: [],
            experience: [],
            skills: [],
            languages: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchParsedCV();
  }, [cvId, toast]);

  const handleFieldChange = (
    section: keyof CVData,
    field: string,
    value: string | string[] | PersonalInfo | EducationEntry | ExperienceEntry | SkillEntry[] | LanguageEntry[],
    index?: number, // For array sections like education, experience
    subField?: string // For fields within array items
  ) => {
    if (!parsedCV) return;

    const updatedCV = { ...parsedCV };

    if (index !== undefined && Array.isArray(updatedCV[section])) {
      // Handle changes in array items (Education, Experience, Languages)
      const item = (updatedCV[section] as any[])[index];
      if (typeof item === 'string') { // Skills array is string[]
        (updatedCV[section] as string[])[index] = value as string;
      } else if (subField) {
        (updatedCV[section] as any[])[index] = { ...item, [subField]: value };
      }
    } else if (section === 'personal_info') {
      updatedCV.personal_info = { ...updatedCV.personal_info, [field]: value };
    } else if (section === 'skills' && Array.isArray(updatedCV.skills)) {
      // Directly update skills if it's a string array, although this specific logic
      // is complex for a simple input and might need a dedicated skill management component.
      // For now, assuming direct array replacement or editing of existing items.
    }

    setParsedCV(updatedCV);
  };

  const handleSaveConfirmedData = async () => {
    if (!parsedCV) return;

    setIsSaving(true);
    try {
      // Simulate API call to update/confirm CV data after review
      const response = await fetch(`/api/v1/cvs/${cvId}`, {
        method: 'PATCH', // Assuming PATCH for updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedCV),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save CV data');
      }

      toast({
        title: 'CV Confirmed!',
        description: 'Your CV data has been successfully saved after review.',
      });
      onConfirm(); // Trigger the parent's onConfirm to redirect
    } catch (error: any) {
      toast({
        title: 'Save Failed!',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Loading Parsed CV Data...</CardTitle>
            <CardDescription>
              Please wait while we prepare your CV for review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add a skeleton loader here */}
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!parsedCV) {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>No CV Data Found</CardTitle>
                <CardDescription>
                    We couldn't retrieve your parsed CV. Please try uploading again.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => window.location.reload()}>Try Uploading Again</Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Review & Edit Your CV</CardTitle>
        <CardDescription>
          Please review the extracted information. Make any necessary corrections before saving.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Info */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold flex justify-between items-center cursor-pointer" onClick={() => toggleSection('personalInfo')}>
            Personal Information
            {expandedSections.personalInfo ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </h3>
          {expandedSections.personalInfo && parsedCV.personal_info && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={parsedCV.personal_info.firstName || ''} onChange={(e) => handleFieldChange('personal_info', 'firstName', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={parsedCV.personal_info.lastName || ''} onChange={(e) => handleFieldChange('personal_info', 'lastName', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={parsedCV.personal_info.email || ''} onChange={(e) => handleFieldChange('personal_info', 'email', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={parsedCV.personal_info.phone || ''} onChange={(e) => handleFieldChange('personal_info', 'phone', e.target.value)} />
              </div>
              {/* Add more personal info fields as needed */}
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold flex justify-between items-center cursor-pointer" onClick={() => toggleSection('experience')}>
            Work Experience
            {expandedSections.experience ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </h3>
          {expandedSections.experience && parsedCV.experience && parsedCV.experience.map((entry, index) => (
            <div key={index} className="space-y-2 mt-4 p-3 border rounded-md">
              <div>
                <Label htmlFor={`exp-title-${index}`}>Title</Label>
                <Input id={`exp-title-${index}`} value={entry.title} onChange={(e) => handleFieldChange('experience', 'title', e.target.value, index, 'title')} />
              </div>
              <div>
                <Label htmlFor={`exp-company-${index}`}>Company</Label>
                <Input id={`exp-company-${index}`} value={entry.company} onChange={(e) => handleFieldChange('experience', 'company', e.target.value, index, 'company')} />
              </div>
              <div>
                <Label htmlFor={`exp-desc-${index}`}>Description</Label>
                <Textarea id={`exp-desc-${index}`} value={entry.description || ''} onChange={(e) => handleFieldChange('experience', 'description', e.target.value, index, 'description')} />
              </div>
              {/* Add more experience fields */}
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold flex justify-between items-center cursor-pointer" onClick={() => toggleSection('education')}>
            Education
            {expandedSections.education ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </h3>
          {expandedSections.education && parsedCV.education && parsedCV.education.map((entry, index) => (
            <div key={index} className="space-y-2 mt-4 p-3 border rounded-md">
              <div>
                <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
                <Input id={`edu-institution-${index}`} value={entry.institution} onChange={(e) => handleFieldChange('education', 'institution', e.target.value, index, 'institution')} />
              </div>
              <div>
                <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                <Input id={`edu-degree-${index}`} value={entry.degree} onChange={(e) => handleFieldChange('education', 'degree', e.target.value, index, 'degree')} />
              </div>
              {/* Add more education fields */}
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold flex justify-between items-center cursor-pointer" onClick={() => toggleSection('skills')}>
            Skills
            {expandedSections.skills ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </h3>
          {expandedSections.skills && parsedCV.skills && (
            <div className="mt-4">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Textarea
                id="skills"
                value={parsedCV.skills.join(', ')}
                onChange={(e) => handleFieldChange('skills', 'skills', e.target.value.split(',').map(s => s.trim()) as SkillEntry[])}
              />
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold flex justify-between items-center cursor-pointer" onClick={() => toggleSection('languages')}>
            Languages
            {expandedSections.languages ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </h3>
          {expandedSections.languages && parsedCV.languages && parsedCV.languages.map((entry, index) => (
            <div key={index} className="space-y-2 mt-4 p-3 border rounded-md">
              <div>
                <Label htmlFor={`lang-name-${index}`}>Language</Label>
                <Input id={`lang-name-${index}`} value={entry.name} onChange={(e) => handleFieldChange('languages', 'name', e.target.value, index, 'name')} />
              </div>
              <div>
                <Label htmlFor={`lang-level-${index}`}>Level</Label>
                <Input id={`lang-level-${index}`} value={entry.level || ''} onChange={(e) => handleFieldChange('languages', 'level', e.target.value, index, 'level')} />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSaveConfirmedData} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Confirm & Save CV'}
        </Button>
      </CardContent>
    </Card>
  );
}