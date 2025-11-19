export interface JobPosting {
  job_id?: string
  title: string
  company: string
  description: string
  key_requirements: string[]
  preferred_skills?: string[]
  location?: string
  salary_range?: string
  posted_date?: string
}

export interface JobAnalysis {
  match_score: number
  matched_skills: string[]
  missing_skills: Gap[]
  keywords: string[]
  required_vs_preferred: {
    required: string[]
    preferred: string[]
  }
}

export interface Gap {
  skill: string
  priority: 'critical' | 'important' | 'nice-to-have'
  context: string
  suggestion?: string
}

export interface ApplicationAnalysis {
  output_id?: string
  cv_id: string
  job_id: string
  tailored_cv: any
  cover_letter_text: string
  ats_score: number
  feedback_notes: string[]
  match_analysis: JobAnalysis
  created_at?: string
}
