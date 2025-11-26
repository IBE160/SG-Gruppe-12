import React from 'react';
import { useCvStore, CvTemplate } from '@/store/cvStore';

const getTemplateStyles = (template: CvTemplate) => {
  switch (template) {
    case 'classic':
      return {
        font: 'font-serif',
        accentColor: 'text-gray-800',
        skillBg: 'bg-gray-200',
        skillText: 'text-gray-800',
        headerBorder: 'border-gray-400',
      };
    case 'simple':
      return {
        font: 'font-mono',
        accentColor: 'text-black',
        skillBg: 'border border-black',
        skillText: 'text-black',
        headerBorder: 'border-black',
      };
    case 'modern':
    default:
      return {
        font: 'font-sans',
        accentColor: 'text-blue-600',
        skillBg: 'bg-blue-100',
        skillText: 'text-blue-800',
        headerBorder: 'border-gray-200',
      };
  }
};

const CVPreview: React.FC = () => {
  const { cvData, template } = useCvStore();
  const { personal_info, experience, education, skills, languages } = cvData;
  const styles = getTemplateStyles(template);

  return (
    <div className={`bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto my-8 ${styles.font}`}>
      {/* Header Section */}
      <header className={`text-center border-b-2 ${styles.headerBorder} pb-4`}>
        <h1 className={`text-4xl font-bold ${styles.accentColor} tracking-wider`}>
          {personal_info.firstName} {personal_info.lastName}
        </h1>
        <div className="flex justify-center space-x-4 mt-2 text-sm text-gray-500">
          {personal_info.email && <span>{personal_info.email}</span>}
          {personal_info.phone && <span>| {personal_info.phone}</span>}
          {personal_info.linkedin && <span>| {personal_info.linkedin}</span>}
          {personal_info.website && <span>| {personal_info.website}</span>}
        </div>
        {personal_info.address && (
          <p className="text-sm text-gray-500 mt-1">
            {personal_info.address}, {personal_info.city}, {personal_info.postalCode}, {personal_info.country}
          </p>
        )}
      </header>

      <main className="mt-6">
        {/* Experience Section */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className={`text-2xl font-semibold ${styles.accentColor} border-b-2 ${styles.headerBorder} pb-2`}>Work Experience</h2>
            <div className="mt-4 space-y-6">
              {experience.map((exp, index) => (
                <div key={index}>
                  <h3 className="text-lg font-bold text-gray-800">{exp.title}</h3>
                  <p className="text-md font-semibold text-gray-600">{exp.company} {exp.location && `| ${exp.location}`}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{exp.startDate} - {exp.endDate || 'Present'}</p>
                  {exp.description && (
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {education && education.length > 0 && (
          <section className="mt-8">
            <h2 className={`text-2xl font-semibold ${styles.accentColor} border-b-2 ${styles.headerBorder} pb-2`}>Education</h2>
            <div className="mt-4 space-y-4">
              {education.map((edu, index) => (
                <div key={index}>
                  <h3 className="text-lg font-bold text-gray-800">{edu.institution}</h3>
                  <p className="text-md font-semibold text-gray-600">{edu.degree} {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{edu.startDate} - {edu.endDate || 'Present'}</p>
                   {edu.description && (
                    <p className="mt-2 text-sm text-gray-700">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <section className="mt-8">
            <h2 className={`text-2xl font-semibold ${styles.accentColor} border-b-2 ${styles.headerBorder} pb-2`}>Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span key={index} className={`${styles.skillBg} ${styles.skillText} text-sm font-medium px-3 py-1 rounded-full`}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Languages Section */}
        {languages && languages.length > 0 && (
          <section className="mt-8">
            <h2 className={`text-2xl font-semibold ${styles.accentColor} border-b-2 ${styles.headerBorder} pb-2`}>Languages</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              {languages.map((lang, index) => (
                <div key={index} className="text-sm">
                  <span className="font-semibold">{lang.name}:</span>
                  <span className="text-gray-600"> {lang.level || ''}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default CVPreview;
