// frontend/src/components/features/cv-management/TemplateSelector.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: 'modern' | 'classic';
  onTemplateChange: (template: 'modern' | 'classic') => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onTemplateChange }) => {
  const templates = [
    {
      id: 'modern' as const,
      name: 'Modern',
      description: 'Clean, contemporary design with bold typography',
    },
    {
      id: 'classic' as const,
      name: 'Classic',
      description: 'Traditional, professional layout',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={`cursor-pointer transition-all ${
            selectedTemplate === template.id
              ? 'border-primary border-2'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onTemplateChange(template.id)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              {template.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{template.description}</p>
            {selectedTemplate === template.id && (
              <div className="mt-2">
                <span className="text-xs text-primary font-medium">Selected</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TemplateSelector;
