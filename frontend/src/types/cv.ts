export interface CVData {
  cv_id?: string
  user_id?: string
  upload_date?: string
  file_path?: string
  personal_info: PersonalInfo
  education: Education[]
  experience: Experience[]
  skills: string[]
  skills_extracted?: string[]
}

export interface PersonalInfo {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
  portfolio?: string
}

export interface Education {
  institution: string
  degree: string
  field_of_study?: string
  start_date: string
  end_date?: string
  description?: string
}

export interface Experience {
  company: string
  title: string
  start_date: string
  end_date?: string
  current?: boolean
  description: string
  achievements?: string[]
}

export interface Change {
  section: string
  type: 'added' | 'modified' | 'removed' | 'reordered'
  description: string
  rationale: string
  originalText?: string
  modifiedText?: string
}
