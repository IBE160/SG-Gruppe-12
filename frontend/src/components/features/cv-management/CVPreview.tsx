// frontend/src/components/features/cv-management/CVPreview.tsx
import React from 'react';
import { CvData } from '@/types/cv';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CVPreviewProps {
  cvData: CvData | null;
  template: 'modern' | 'classic';
}

const CVPreview: React.FC<CVPreviewProps> = ({ cvData, template }) => {
  if (!cvData) {
    return (
      <Card className="w-full h-full">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No CV data to preview</p>
        </CardContent>
      </Card>
    );
  }

  const isModern = template === 'modern';

  return (
    <Card className="w-full">
      <CardHeader className={isModern ? 'bg-primary text-white' : 'bg-gray-100'}>
        <CardTitle className="text-2xl">
          {cvData.personal_info.firstName} {cvData.personal_info.lastName}
        </CardTitle>
        {cvData.personal_info.email && (
          <p className={isModern ? 'text-gray-100' : 'text-gray-600'}>
            {cvData.personal_info.email}
          </p>
        )}
        {cvData.personal_info.phone && (
          <p className={isModern ? 'text-gray-100' : 'text-gray-600'}>
            {cvData.personal_info.phone}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6 mt-6">
        {cvData.experience.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3">Work Experience</h3>
            <Separator className="mb-3" />
            <div className="space-y-4">
              {cvData.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{exp.title}</p>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </p>
                  </div>
                  {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.education.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3">Education</h3>
            <Separator className="mb-3" />
            <div className="space-y-4">
              {cvData.education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{edu.degree}</p>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-sm text-gray-500">{edu.fieldOfStudy}</p>
                      )}
                    </div>
                    {edu.startDate && (
                      <p className="text-sm text-gray-500">
                        {edu.startDate} - {edu.endDate || 'Present'}
                      </p>
                    )}
                  </div>
                  {edu.description && <p className="text-sm mt-2">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {cvData.skills.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3">Skills</h3>
            <Separator className="mb-3" />
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {cvData.languages.length > 0 && (
          <div>
            <h3 className="text-lg font-bold mb-3">Languages</h3>
            <Separator className="mb-3" />
            <div className="space-y-2">
              {cvData.languages.map((lang, index) => (
                <div key={index} className="flex justify-between">
                  <span>{lang.name}</span>
                  {lang.level && <span className="text-gray-600">{lang.level}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CVPreview;
