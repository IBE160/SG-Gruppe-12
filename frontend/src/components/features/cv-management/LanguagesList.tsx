// frontend/src/components/features/cv-management/LanguagesList.tsx
import React from 'react';
import { LanguageEntry } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';

interface LanguagesListProps {
  languages: LanguageEntry[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  isLoading: boolean;
}

const LanguagesList: React.FC<LanguagesListProps> = ({ languages, onEdit, onDelete, isLoading }) => {
  if (languages.length === 0) {
    return <p className="text-sm text-gray-500">No languages added yet.</p>;
  }

  return (
    <div className="space-y-2">
      {languages.map((lang, index) => (
        <Card key={index}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="font-medium">{lang.name}</span>
              {lang.proficiency && <span className="text-sm text-gray-500 ml-2">- {lang.proficiency}</span>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => onEdit(index)} disabled={isLoading}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => onDelete(index)} disabled={isLoading}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LanguagesList;
