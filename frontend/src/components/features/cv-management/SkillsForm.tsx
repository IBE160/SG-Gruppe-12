// frontend/src/components/features/cv-management/SkillsForm.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface SkillsFormProps {
  onSubmit: (data: { skill: string }) => void;
  isLoading: boolean;
}

const SkillsForm: React.FC<SkillsFormProps> = ({ onSubmit, isLoading }) => {
  const [skill, setSkill] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (skill.trim()) {
      onSubmit({ skill: skill.trim() });
      setSkill('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        placeholder="Enter a skill (e.g., React, TypeScript)"
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading || !skill.trim()}>
        <Plus className="h-4 w-4 mr-1" />
        {isLoading ? 'Adding...' : 'Add'}
      </Button>
    </form>
  );
};

export default SkillsForm;
