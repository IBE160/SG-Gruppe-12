// frontend/src/components/features/cv-management/EducationList.tsx
import React from 'react';
import { EducationEntry } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from 'lucide-react';

interface EducationListProps {
  educationEntries: EducationEntry[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  isLoading: boolean;
}

const EducationList: React.FC<EducationListProps> = ({ educationEntries, onEdit, onDelete, isLoading }) => {
  if (educationEntries.length === 0) {
    return <p className="text-sm text-gray-500">No education entries added yet.</p>;
  }

  return (
    <div className="space-y-4">
      {educationEntries.map((edu, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{edu.degree} at {edu.institution}</CardTitle>
            <div className="space-x-2">
              <Button variant="outline" size="icon" onClick={() => onEdit(index)} disabled={isLoading}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => onDelete(index)} disabled={isLoading}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">{edu.start_date} - {edu.end_date || 'Present'}</p>
            <p className="mt-2">{edu.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EducationList;