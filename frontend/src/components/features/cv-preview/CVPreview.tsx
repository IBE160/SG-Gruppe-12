// frontend/src/components/features/cv-preview/CVPreview.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CvData, PersonalInfo, ExperienceEntry, EducationEntry, SkillEntry, LanguageEntry } from '@/types/cv'; // Assuming CvData is defined

interface CVPreviewProps {
  cvData: CvData;
  isLoading?: boolean;
}

export function CVPreview({ cvData, isLoading }: CVPreviewProps) {
  if (isLoading) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading CV Preview...</p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto my-8 p-6">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold mb-2">{cvData.personal_info?.name || 'Unnamed CV'}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {cvData.personal_info?.email && <span>{cvData.personal_info.email} | </span>}
          {cvData.personal_info?.phone && <span>{cvData.personal_info.phone} | </span>}
          {cvData.personal_info?.linkedin && <a href={cvData.personal_info.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {cvData.summary && (
          <section className="border-b pb-4">
            <h3 className="text-xl font-semibold mb-2">Summary</h3>
            <p className="text-gray-700">{cvData.summary}</p>
          </section>
        )}

        {cvData.experience && cvData.experience.length > 0 && (
          <section className="border-b pb-4">
            <h3 className="text-xl font-semibold mb-4">Experience</h3>
            {cvData.experience.map((exp: ExperienceEntry, index: number) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-lg">{exp.title} at {exp.company}</h4>
                  <span className="text-sm text-gray-500">{exp.start_date} - {exp.end_date || 'Present'}</span>
                </div>
                {exp.location && <p className="text-sm text-gray-600 mb-1">{exp.location}</p>}
                {exp.description && <p className="text-gray-700 text-sm">{exp.description}</p>}
              </div>
            ))}
          </section>
        )}

        {cvData.education && cvData.education.length > 0 && (
          <section className="border-b pb-4">
            <h3 className="text-xl font-semibold mb-4">Education</h3>
            {cvData.education.map((edu: EducationEntry, index: number) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-lg">{edu.degree} from {edu.institution}</h4>
                  <span className="text-sm text-gray-500">{edu.start_date} - {edu.end_date}</span>
                </div>
                {edu.location && <p className="text-sm text-gray-600 mb-1">{edu.location}</p>}
                {edu.description && <p className="text-gray-700 text-sm">{edu.description}</p>}
              </div>
            ))}
          </section>
        )}

        {cvData.skills && cvData.skills.length > 0 && (
          <section className="border-b pb-4">
            <h3 className="text-xl font-semibold mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill: SkillEntry, index: number) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                  {skill.name} {skill.proficiency && `(${skill.proficiency})`}
                </span>
              ))}
            </div>
          </section>
        )}

        {cvData.languages && cvData.languages.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {cvData.languages.map((lang: LanguageEntry, index: number) => (
                <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                  {lang.name} {lang.proficiency && `(${lang.proficiency})`}
                </span>
              ))}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}