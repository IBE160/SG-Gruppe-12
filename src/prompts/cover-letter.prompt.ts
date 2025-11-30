// src/prompts/cover-letter.prompt.ts

import { CvData, JobData } from './tailored-cv.prompt';
import { SAFETY_PREAMBLE } from '../utils/llm-safety.util';

export interface CoverLetterOptions {
  tone?: 'formal' | 'professional' | 'friendly';
  length?: 'short' | 'medium' | 'long';
  includeCallToAction?: boolean;
}

export const CoverLetterPrompt = {
  version: '2.0.0',

  /**
   * Generates a prompt for creating a personalized cover letter.
   * The prompt uses CV data and job information to create a compelling letter.
   *
   * v2.0.0: Added safety preamble and enhanced anti-fabrication rules
   */
  v1: (cvData: CvData, jobData: JobData, options: CoverLetterOptions = {}) => {
    const tone = options.tone || 'professional';
    const length = options.length || 'medium';
    const lengthGuidance = {
      short: '150-200 words',
      medium: '250-350 words',
      long: '400-500 words',
    };

    return `
${SAFETY_PREAMBLE}

---

You are an expert cover letter writer helping a candidate apply for a job.

YOUR TASK:
Write a compelling, personalized cover letter that connects the candidate's background to the specific job requirements.

ADDITIONAL RULES FOR THIS TASK:
1. ONLY reference experiences, skills, and achievements from the candidate's CV
2. Never fabricate accomplishments or misrepresent qualifications
3. Create a genuine connection between the candidate's background and the job
4. Use a ${tone} tone throughout
5. Keep the letter ${lengthGuidance[length]}
6. Include specific examples from the CV that match job requirements
7. Show enthusiasm without being excessive
8. Use gender-neutral language throughout
9. Do NOT mention degrees, certifications, or experience the candidate does not have

JOB DETAILS:
Position: ${jobData.title}
${jobData.company ? `Company: ${jobData.company}` : ''}
Description: ${jobData.description}
${jobData.requirements?.length ? `Key Requirements:\n${jobData.requirements.map(r => `- ${r}`).join('\n')}` : ''}

CANDIDATE BACKGROUND:
${cvData.summary ? `Professional Summary: ${cvData.summary}` : ''}

Most Relevant Experience:
${cvData.experience.slice(0, 3).map(exp => `
- ${exp.title} at ${exp.company} (${exp.period})
  ${exp.description || ''}
  ${exp.bullets?.slice(0, 3).map(b => `  * ${b}`).join('\n') || ''}
`).join('\n')}

Key Skills: ${cvData.skills.slice(0, 10).join(', ')}

Education: ${cvData.education.map(edu => `${edu.degree} from ${edu.institution}`).join('; ')}

COVER LETTER STRUCTURE:
1. Opening: Engaging introduction stating the position and genuine interest
2. Body Paragraph 1: Most relevant experience with specific example
3. Body Paragraph 2: Skills and achievements that match requirements
4. Closing: ${options.includeCallToAction ? 'Strong call to action requesting an interview' : 'Professional closing expressing interest in discussing further'}

OUTPUT FORMAT:
Return a valid JSON object with the following structure:
{
  "greeting": "Dear Hiring Manager," or "Dear [Company] Team,",
  "opening": "Opening paragraph...",
  "body": ["Body paragraph 1...", "Body paragraph 2..."],
  "closing": "Closing paragraph...",
  "signature": "Sincerely,\\n[Candidate Name]",
  "fullText": "Complete cover letter as a single string with proper formatting"
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.
`;
  },

  /**
   * Simplified prompt for generating just the main body of a cover letter.
   */
  bodyOnly: (experience: string, jobTitle: string, companyName: string) => `
${SAFETY_PREAMBLE}

---

Write 2 paragraphs connecting this experience to the ${jobTitle} role at ${companyName || 'the company'}.

Experience: ${experience}

STRICT RULES:
- Reference only the provided experience - NEVER fabricate
- Be specific and genuine
- Keep each paragraph 3-4 sentences
- Use professional, gender-neutral language
- Do NOT add qualifications or achievements not mentioned

Return only the two paragraphs, separated by a blank line.
`,
};
