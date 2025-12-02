// frontend/src/store/cvStore.ts
import { create } from 'zustand';
import { CvData, ExperienceEntry, EducationEntry, SkillEntry, LanguageEntry, PersonalInfo } from '@/types/cv';

interface CvState {
  cv: CvData | null;
  setCV: (cv: CvData) => void;
  updatePersonalInfo: (personalInfo: PersonalInfo) => void;
  updateExperience: (experience: ExperienceEntry[]) => void;
  updateEducation: (education: EducationEntry[]) => void;
  updateSkills: (skills: SkillEntry[]) => void;
  updateLanguages: (languages: LanguageEntry[]) => void;
  reset: () => void;
}

const initialState: CvData = {
  personal_info: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    website: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  },
  education: [],
  experience: [],
  skills: [],
  languages: [],
};

export const useCvStore = create<CvState>((set) => ({
  cv: null,

  setCV: (cv) => set({ cv }),

  updatePersonalInfo: (personalInfo) =>
    set((state) => ({
      cv: state.cv ? { ...state.cv, personal_info: personalInfo } : null,
    })),

  updateExperience: (experience) =>
    set((state) => ({
      cv: state.cv ? { ...state.cv, experience } : null,
    })),

  updateEducation: (education) =>
    set((state) => ({
      cv: state.cv ? { ...state.cv, education } : null,
    })),

  updateSkills: (skills) =>
    set((state) => ({
      cv: state.cv ? { ...state.cv, skills } : null,
    })),

  updateLanguages: (languages) =>
    set((state) => ({
      cv: state.cv ? { ...state.cv, languages } : null,
    })),

  reset: () => set({ cv: initialState }),
}));
