// src/prompts/tailored-cv.prompt.ts

import { SAFETY_PREAMBLE } from '../utils/llm-safety.util';

export interface CvData {
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    period: string;
    description?: string;
    bullets?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  languages?: Array<{
    language: string;
    level: string;
  }>;
}

export interface JobData {
  title: string;
  company?: string;
  description: string;
  requirements?: string[];
  keywords?: string[];
}

export const TailoredCvPrompt = {
  version: '2.0.0',

  /**
   * Generates a prompt for tailoring CV content to a specific job.
   * The prompt instructs the LLM to rewrite CV sections to emphasize
   * relevant experience without fabricating new information.
   *
   * v2.0.0: Added safety preamble and enhanced anti-fabrication rules
   */
  v1: (cvData: CvData, jobData: JobData) => `
${SAFETY_PREAMBLE}

---

You are an expert career coach helping a candidate tailor their CV to a specific job posting.

YOUR TASK:
Rewrite the candidate's CV content to better match the job requirements while maintaining complete honesty.

ADDITIONAL RULES FOR THIS TASK:
1. ONLY use information that exists in the candidate's CV - never invent new experiences, skills, or qualifications
2. Reword and emphasize existing experiences to highlight relevance to the job
3. Prioritize skills and experiences that match the job requirements
4. Keep language professional, concise, and action-oriented
5. Use industry-relevant keywords from the job description where applicable
6. Do not exaggerate or misrepresent the candidate's background
7. If skills or experience gaps exist, do NOT fill them with fabricated content
8. Use gender-neutral language throughout

JOB DETAILS:
Title: ${jobData.title}
${jobData.company ? `Company: ${jobData.company}` : ''}
Description: ${jobData.description}
${jobData.requirements?.length ? `Key Requirements:\n${jobData.requirements.map(r => `- ${r}`).join('\n')}` : ''}
${jobData.keywords?.length ? `Keywords: ${jobData.keywords.join(', ')}` : ''}

CANDIDATE'S CURRENT CV DATA:
${cvData.summary ? `Summary: ${cvData.summary}` : ''}

Experience:
${cvData.experience.map(exp => `
- ${exp.title} at ${exp.company} (${exp.period})
  ${exp.description || ''}
  ${exp.bullets?.map(b => `  * ${b}`).join('\n') || ''}
`).join('\n')}

Education:
${cvData.education.map(edu => `- ${edu.degree}, ${edu.institution} (${edu.year})`).join('\n')}

Skills: ${cvData.skills.join(', ')}

${cvData.languages?.length ? `Languages: ${cvData.languages.map(l => `${l.language} (${l.level})`).join(', ')}` : ''}

OUTPUT FORMAT:
Return a valid JSON object with the following structure:
{
  "summary": "A tailored professional summary (2-3 sentences)",
  "experience": [
    {
      "title": "Original job title",
      "company": "Original company",
      "period": "Original period",
      "bullets": ["Reworded bullet point emphasizing relevance", "..."]
    }
  ],
  "skills": ["Prioritized and relevant skills from original list"],
  "highlights": ["Key achievements or experiences that match this job"]
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.
`,

  /**
   * A simpler prompt for quick tailoring with minimal context.
   */
  quick: (cvSummary: string, jobTitle: string, jobKeywords: string[]) => `
${SAFETY_PREAMBLE}

---

Rewrite this CV summary to better match a "${jobTitle}" position.
Focus on these keywords: ${jobKeywords.join(', ')}

Original summary: ${cvSummary}

STRICT RULES:
- Only use information from the original summary - NEVER fabricate
- Emphasize relevant skills and experience
- Keep it concise (2-3 sentences)
- Use gender-neutral language

Return only the rewritten summary, no additional text.
`,
};
