import React from 'react';
import { useCvStore, CvTemplate } from '@/store/cvStore';

const TemplateSelector: React.FC = () => {
  const { template, setTemplate } = useCvStore();

  const templates: { id: CvTemplate; name: string }[] = [
    { id: 'modern', name: 'Modern' },
    { id: 'classic', name: 'Classic' },
    { id: 'simple', name: 'Simple' },
  ];

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">CV Template</h3>
      <div className="flex space-x-2">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => setTemplate(tpl.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              template === tpl.id
                ? 'bg-blue-600 text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tpl.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
