// frontend/src/app/(dashboard)/cv/manage/page.tsx
"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { CVData, ExperienceEntry, EducationEntry, SkillEntry, LanguageEntry } from '@/types/cv';
import { useCvStore } from '@/store/cvStore';
import { useUiStore } from '@/store/uiStore';
import { useAutosave } from '@/lib/hooks/useAutosave';
import { useUnsavedChanges } from '@/lib/hooks/useUnsavedChanges';

import CVPreview from '@/components/features/cv-management/CVPreview';
import TemplateSelector from '@/components/features/cv-management/TemplateSelector';
import WorkExperienceList from '@/components/features/cv-management/WorkExperienceList';
import WorkExperienceForm from '@/components/features/cv-management/WorkExperienceForm';
import EducationList from '@/components/features/cv-management/EducationList';
import EducationForm from '@/components/features/cv-management/EducationForm';
import SkillsList from '@/components/features/cv-management/SkillsList';
import SkillsForm from '@/components/features/cv-management/SkillsForm';
import LanguagesList from '@/components/features/cv-management/LanguagesList';
import LanguagesForm from '@/components/features/cv-management/LanguagesForm';
import CVVersionHistory from '@/components/features/cv-management/CVVersionHistory'; // Import new component
import { Skeleton } from '@/components/ui/skeleton';
import * as api from '@/lib/api/cv';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(data => data.data);

type EditableSection = 'experience' | 'education' | 'skill' | 'language' | null;

export default function ManageCVPage() {
  const { toast } = useToast();
  const cvId = "mock-cv-id"; // For MVP, assume a single, known CV ID.
  
  const { cv: cvData, setCV, updateExperience, updateEducation, updateSkills, updateLanguages } = useCvStore();
  const { hasUnsavedChanges, setHasUnsavedChanges } = useUiStore();
  
  // Fetch initial data and populate the store
  const { error, isLoading } = useSWR<CVData>(cvId ? `/api/v1/cvs/${cvId}` : null, fetcher, {
      onSuccess: (data) => setCV(data),
      revalidateOnFocus: false, // Prevent re-fetching on window focus for consistent Zustand state
  });

  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic'>('modern');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSection, setEditingSection] = useState<EditableSection>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Setup unsaved changes warning for browser tab close/navigation
  useUnsavedChanges(hasUnsavedChanges);

  // --- Generic Handlers ---
  const handleEdit = (section: EditableSection, index: number) => {
    setEditingSection(section);
    setEditingIndex(index);
  };
  const handleAddNew = (section: EditableSection) => {
    setEditingSection(section);
    setEditingIndex(null);
  };
  const handleCancel = () => {
    setEditingSection(null);
    setEditingIndex(null);
  };

  const createAutosaveHandler = (apiUpdateFunction: Function, updateStoreFunction: Function, sectionName: string) => {
    return useAutosave(async (data: any) => {
        try {
            // Special handling for skill add/update as it's a direct string
            const isSkillUpdate = sectionName === 'Skills';
            const payload = isSkillUpdate ? { skill: data } : data;

            let updatedCv: CVData;
            // For updates, pass index; for adds, just data
            if (editingIndex !== null) {
                updatedCv = await apiUpdateFunction(cvId, editingIndex, payload);
            } else {
                updatedCv = await apiUpdateFunction(cvId, payload); // For skills, add is also treated as update for now
            }
            
            // The API returns the full updated CV. Extract the specific section to update the store.
            const updatedSectionData = sectionName === 'Skills' ? updatedCv.skills : (updatedCv[sectionName.toLowerCase() as keyof CVData]);
            updateStoreFunction(updatedSectionData);
            
            setHasUnsavedChanges(false); // Mark as saved after autosave
            toast({ title: 'Autosaved!', description: 'Your changes have been saved.' });
        } catch (e: any) {
            toast({ title: 'Autosave Failed', description: e.message || 'An error occurred during autosave.', variant: 'destructive' });
        }
    }, 3000); // 3-second debounce
  };

  const createSubmitHandler = (apiFunction: Function, updateStore: Function, sectionName: string, isUpdate: boolean) => async (data: any) => {
    setIsSubmitting(true);
    try {
        const payload = sectionName === 'Skills' ? { skill: data.skill } : data; // Skills form passes { skill: string }
        const updatedCv = isUpdate ? await apiFunction(cvId, editingIndex, payload) : await apiFunction(cvId, payload);
        
        const updatedSectionData = sectionName === 'Skills' ? updatedCv.skills : (updatedCv[sectionName.toLowerCase() as keyof CVData]);
        updateStore(updatedSectionData);
        
        toast({ title: 'Success', description: `${sectionName} saved.` });
        setHasUnsavedChanges(false); // Mark as saved after manual submission
        handleCancel();
    } catch (e: any) {
        toast({ title: 'Error', description: e.message || 'An error occurred.', variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const createDeleteHandler = (apiFunction: Function, updateStore: Function, sectionName: string) => async (index: number) => {
    setIsSubmitting(true);
    try {
        const updatedCv = await apiFunction(cvId, index);
        const updatedSectionData = sectionName === 'Skills' ? updatedCv.skills : (updatedCv[sectionName.toLowerCase() as keyof CVData]);
        updateStore(updatedSectionData);
        toast({ title: 'Success', description: `${sectionName} deleted.` });
        setHasUnsavedChanges(false); // Mark as saved after deletion
        handleCancel();
    } catch (e: any) {
        toast({ title: 'Error', description: e.message || 'An error occurred.', variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  // Handlers for onDataChange to trigger autosave and mark changes
  const handleDataChange = (autosaveFunction: Function) => (data: any) => {
    setHasUnsavedChanges(true);
    autosaveFunction(data);
  };

  // --- Specific Autosave Hooks (passed to forms) ---
  const autosaveExperience = createAutosaveHandler(api.updateExperience, updateExperience, 'Experience');
  const autosaveEducation = createAutosaveHandler(api.updateEducation, updateEducation, 'Education');
  const autosaveLanguage = createAutosaveHandler(api.updateLanguage, updateLanguages, 'Languages');
  // For Skills, onDataChange is simplified as it's typically add/delete, not in-place edit with form
  
  // --- Specific Submit Handlers (manual save) ---
  const handleExperienceSubmit = createSubmitHandler(editingIndex !== null ? api.updateExperience : api.addExperience, updateExperience, 'Experience', editingIndex !== null);
  const handleDeleteExperience = createDeleteHandler(api.deleteExperience, updateExperience, 'Experience');
  
  const handleEducationSubmit = createSubmitHandler(editingIndex !== null ? api.updateEducation : api.addEducation, updateEducation, 'Education', editingIndex !== null);
  const handleDeleteEducation = createDeleteHandler(api.deleteEducation, updateEducation, 'Education');
  
  const handleSkillSubmit = createSubmitHandler(api.addSkill, updateSkills, 'Skills', false); // Skills are always added, no separate update form
  const handleDeleteSkill = createDeleteHandler(api.deleteSkill, updateSkills, 'Skills');
  
  const handleLanguageSubmit = createSubmitHandler(editingIndex !== null ? api.updateLanguage : api.addLanguage, updateLanguages, 'Languages', editingIndex !== null);
  const handleDeleteLanguage = createDeleteHandler(api.deleteLanguage, updateLanguages, 'Languages');

  if (isLoading || !cvData) return <div className="p-8"><Skeleton className="h-10 w-1/4" /><Skeleton className="h-[200px] w-full mt-4" /></div>;
  if (error) return <div className="p-8">Error loading CV data: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
      {/* Left Column: Forms & Lists */}
      <div className="flex flex-col gap-8">
        {/* Template Selector */}
        <TemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={setSelectedTemplate} />

        {/* Work Experience Section */}
        <Card>
          <CardHeader><div className="flex justify-between items-center"><CardTitle>Work Experience</CardTitle>{editingSection !== 'experience' && <Button size="sm" onClick={() => handleAddNew('experience')}>Add</Button>}</div></CardHeader>
          <CardContent>
            {editingSection === 'experience' && (
             <div className="mb-4 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4">{editingIndex !== null ? 'Edit' : 'Add'} Experience</h3>
                <WorkExperienceForm onSubmit={handleExperienceSubmit} onDataChange={handleDataChange(autosaveExperience)} initialData={editingIndex !== null ? cvData.experience[editingIndex] : undefined} isLoading={isSubmitting}/>
                <Button variant="ghost" size="sm" onClick={handleCancel} className="mt-2">Cancel</Button>
             </div>
            )}
            <WorkExperienceList experiences={cvData.experience} onEdit={(i) => handleEdit('experience', i)} onDelete={handleDeleteExperience} isLoading={isSubmitting}/>
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card>
          <CardHeader><div className="flex justify-between items-center"><CardTitle>Education</CardTitle>{editingSection !== 'education' && <Button size="sm" onClick={() => handleAddNew('education')}>Add</Button>}</div></CardHeader>
          <CardContent>
            {editingSection === 'education' && (
             <div className="mb-4 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-4">{editingIndex !== null ? 'Edit' : 'Add'} Education</h3>
                <EducationForm onSubmit={handleEducationSubmit} onDataChange={handleDataChange(autosaveEducation)} initialData={editingIndex !== null ? cvData.education[editingIndex] : undefined} isLoading={isSubmitting}/>
                <Button variant="ghost" size="sm" onClick={handleCancel} className="mt-2">Cancel</Button>
             </div>
            )}
            <EducationList educationEntries={cvData.education} onEdit={(i) => handleEdit('education', i)} onDelete={handleDeleteEducation} isLoading={isSubmitting}/>
          </CardContent>
        </Card>
        
        {/* Skills Section */}
        <Card>
            <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
            <CardContent>
                <div className="mb-4"><SkillsForm onSubmit={handleSkillSubmit} isLoading={isSubmitting} /></div>
                <SkillsList skills={cvData.skills} onDelete={handleDeleteSkill} isLoading={isSubmitting}/>
            </CardContent>
        </Card>

        {/* Languages Section */}
        <Card>
            <CardHeader><div className="flex justify-between items-center"><CardTitle>Languages</CardTitle>{editingSection !== 'language' && <Button size="sm" onClick={() => handleAddNew('language')}>Add</Button>}</div></CardHeader>
            <CardContent>
                {editingSection === 'language' && (
                    <div className="mb-4 p-4 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-4">{editingIndex !== null ? 'Edit' : 'Add'} Language</h3>
                        <LanguagesForm onSubmit={handleLanguageSubmit} onDataChange={handleDataChange(autosaveLanguage)} initialData={editingIndex !== null ? cvData.languages[editingIndex] : undefined} isLoading={isSubmitting}/>
                        <Button variant="ghost" size="sm" onClick={handleCancel} className="mt-2">Cancel</Button>
                    </div>
                )}
                <LanguagesList languages={cvData.languages} onEdit={(i) => handleEdit('language', i)} onDelete={handleDeleteLanguage} isLoading={isSubmitting}/>
            </CardContent>
        </Card>

        {/* CV Version History */}
        <CVVersionHistory cvId={cvId} />

      </div>

      {/* Right Column: Preview */}
      <div>
        <CVPreview cvData={cvData} template={selectedTemplate} />
      </div>
    </div>
  );
}
