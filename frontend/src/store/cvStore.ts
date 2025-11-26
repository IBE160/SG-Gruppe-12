import { create } from 'zustand';
import { CVData, PersonalInfo, ExperienceEntry, EducationEntry, SkillEntry, LanguageEntry } from '@/types/cv';

// Define an initial empty state for the CV
const initialCvData: CVData = {
  personal_info: {
    firstName: 'Your',
    lastName: 'Name',
    email: 'your.email@example.com',
    phone: '123-456-7890',
    linkedin: 'linkedin.com/in/yourprofile',
    website: 'yourportfolio.com',
    address: '123 Main St',
    city: 'Anytown',
    country: 'Country',
    postalCode: '12345',
  },
  experience: [
    {
      title: 'Software Engineer',
      company: 'Tech Company',
      location: 'City, Country',
      startDate: '2022-01-01',
      endDate: 'Present',
      description: 'Developed and maintained web applications using React and Node.js.',
    },
  ],
  education: [
    {
      institution: 'University of Example',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2018-09-01',
      endDate: '2022-05-01',
      description: 'Graduated with honors.',
    },
  ],
  skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  languages: [
    { name: 'English', level: 'Native' },
    { name: 'Spanish', level: 'Intermediate' },
  ],
};

export type CvTemplate = 'modern' | 'classic' | 'simple';

interface CvState {
  cvData: CVData;
  template: CvTemplate;
  setTemplate: (template: CvTemplate) => void;
  setCvData: (data: CVData) => void;
  updatePersonalInfo: (data: Partial<PersonalInfo>) => void;
  addExperience: (entry: ExperienceEntry) => void;
  updateExperience: (index: number, entry: ExperienceEntry) => void;
  removeExperience: (index: number) => void;
  addEducation: (entry: EducationEntry) => void;
  updateEducation: (index: number, entry: EducationEntry) => void;
  removeEducation: (index: number) => void;
  addSkill: (skill: SkillEntry) => void;
  removeSkill: (index: number) => void;
  addLanguage: (lang: LanguageEntry) => void;
  removeLanguage: (index: number) => void;
}

export const useCvStore = create<CvState>((set) => ({
  cvData: initialCvData,
  template: 'modern',
  setTemplate: (template) => set({ template }),
  setCvData: (data) => set({ cvData: data }),
  updatePersonalInfo: (data) =>
    set((state) => ({
      cvData: { ...state.cvData, personal_info: { ...state.cvData.personal_info, ...data } },
    })),
  addExperience: (entry) =>
    set((state) => ({
      cvData: { ...state.cvData, experience: [...state.cvData.experience, entry] },
    })),
  updateExperience: (index, entry) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experience: state.cvData.experience.map((e, i) => (i === index ? entry : e)),
      },
    })),
  removeExperience: (index) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        experience: state.cvData.experience.filter((_, i) => i !== index),
      },
    })),
  addEducation: (entry) =>
    set((state) => ({
      cvData: { ...state.cvData, education: [...state.cvData.education, entry] },
    })),
  updateEducation: (index, entry) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        education: state.cvData.education.map((e, i) => (i === index ? entry : e)),
      },
    })),
  removeEducation: (index) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        education: state.cvData.education.filter((_, i) => i !== index),
      },
    })),
  addSkill: (skill) =>
    set((state) => ({
      cvData: { ...state.cvData, skills: [...state.cvData.skills, skill] },
    })),
  removeSkill: (index) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        skills: state.cvData.skills.filter((_, i) => i !== index),
      },
    })),
  addLanguage: (lang) =>
    set((state) => ({
      cvData: { ...state.cvData, languages: [...state.cvData.languages, lang] },
    })),
  removeLanguage: (index) =>
    set((state) => ({
      cvData: {
        ...state.cvData,
        languages: state.cvData.languages.filter((_, i) => i !== index),
      },
    })),
}));
