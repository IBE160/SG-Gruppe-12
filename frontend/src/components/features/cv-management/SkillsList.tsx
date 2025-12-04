// frontend/src/components/features/cv-management/SkillsList.tsx
import React from 'react';
import { SkillEntry } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface SkillsListProps {
  skills: SkillEntry[];
  onDelete: (index: number) => void;
  isLoading: boolean;
}

const SkillsList: React.FC<SkillsListProps> = ({ skills, onDelete, isLoading }) => {
  if (skills.length === 0) {
    return <p className="text-sm text-gray-500">No skills added yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <Badge key={index} variant="secondary" className="flex items-center gap-1 px-3 py-1">
          <span>{skill.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onDelete(index)}
            disabled={isLoading}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
};

export default SkillsList;
