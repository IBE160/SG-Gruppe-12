// frontend/src/components/features/cv-management/WorkExperienceList.tsx
import React from 'react';
import { ExperienceEntry } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from 'lucide-react';

interface WorkExperienceListProps {
  experiences: ExperienceEntry[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  isLoading: boolean;
}

const WorkExperienceList: React.FC<WorkExperienceListProps> = ({ experiences, onEdit, onDelete, isLoading }) => {
  if (experiences.length === 0) {
    return <p className="text-sm text-gray-500">No work experience added yet.</p>;
  }

  return (
    <div className="space-y-4">
      {experiences.map((exp, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{exp.title} at {exp.company}</CardTitle>
            <div className="space-x-2">
              <Button variant="outline" size="icon" onClick={() => onEdit(index)} disabled={isLoading} aria-label="Edit">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => onDelete(index)} disabled={isLoading} aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{exp.location}</p>
            <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</p>
            <p className="mt-2">{exp.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WorkExperienceList;