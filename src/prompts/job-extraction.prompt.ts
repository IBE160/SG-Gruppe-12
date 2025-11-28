// src/prompts/job-extraction.prompt.ts

export const JobExtractionPrompt = {
  version: '1.0.0', // Versioning for prompt management

  v1: (jobDescription: string) => `
You are an expert at extracting key information from job descriptions. Your goal is to identify and list the most important skills, qualifications, and requirements mentioned in the provided job description.

INSTRUCTIONS:
1. Identify the core responsibilities and tasks.
2. Extract all technical and soft skills explicitly mentioned or strongly implied.
3. List required qualifications (e.g., education level, years of experience).
4. Ignore generic HR boilerplate language.
5. Provide a concise summary of the key requirements.

JOB DESCRIPTION:
${jobDescription}

IMPORTANT:
- Focus on quantifiable and verifiable requirements where possible.
- Be objective and do not infer beyond what is stated.
- The output should be a structured list of key points.
`,
  // Future versions of the prompt can be added here
  // v2: (jobDescription: string) => `... improved prompt ...`
};
