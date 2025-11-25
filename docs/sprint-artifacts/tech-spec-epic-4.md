# Epic 4 – Tailored Application Generation
Technical Specification – Sprint Artifact  
Author: Martin Reppen  
Date: 2025-11-25  

---

## 1. Overview

Epic 4 is responsible for generating tailored application content based on the user’s existing CV data and the job analysis produced in Epic 3. The goal is to help the user quickly produce a job-specific CV and cover letter, while still keeping full control over the final text.

This epic is aligned with PRD requirements **FR-4.1** (Tailored CV Generation), **FR-4.2** (Tailored Cover Letter Generation), and partially **FR-4.3** (Application History, Growth).

---

## 2. Purpose & Goals

The main objectives of Epic 4 are:

- Use structured CV data (Epic 2) and job insights (Epic 3) to generate tailored application content.
- Produce a tailored CV version that emphasizes relevant experience, skills, and achievements.
- Produce a tailored cover letter that connects the user’s background to a specific job.
- Allow the user to review, edit and adjust all generated text before downloading or sending.
- Ensure no fabricated experience or false claims are introduced by the AI.

---

## 3. In Scope

Epic 4 includes:

- Backend endpoints to generate:
  - Tailored CV content
  - Tailored cover letter
- Basic prompt construction to pass CV + job analysis to the LLM provider (e.g. Gemini).
- Transformation of structured data into human-readable CV sections and cover letter paragraphs.
- Editable preview in the frontend (textareas or similar).
- Support for exporting the final CV and cover letter (PDF / DOCX, reused from Epic 2).

---

## 4. Out of Scope

Not part of Epic 4:

- Full application history UI (saved applications, timeline, filters).
- Multiple CV template designs (only a basic layout is required for MVP).
- Advanced analytics on generated applications.
- Complex approval flows or collaboration features.

These can be handled in later growth epics.

---

## 5. API Design

Two main endpoints are introduced in this epic.

### 5.1 Tailored CV Generation

**Method:** `POST`  
**Path:** `/api/application/generate-cv`

**Request Body:**
```json
{
  "cvId": "string",
  "jobAnalysisId": "string"
}
```

- `cvId` – reference to the user’s CV (from Epic 2).
- `jobAnalysisId` – reference to a job analysis result generated in Epic 3.

**Response Body (example):**
```json
{
  "sections": {
    "summary": "Frontend developer with experience in React and UX-focused delivery.",
    "experience": [
      {
        "title": "Frontend Developer",
        "company": "Example AS",
        "period": "2021–2024",
        "bullets": [
          "Delivered React-based user interfaces aligned with business requirements.",
          "Improved usability and accessibility across several web applications."
        ]
      }
    ],
    "skills": [
      "React",
      "TypeScript",
      "Accessibility"
    ]
  }
}
```

### 5.2 Tailored Cover Letter Generation

**Method:** `POST`  
**Path:** `/api/application/generate-cover-letter`

**Request Body:**
```json
{
  "cvId": "string",
  "jobAnalysisId": "string"
}
```

**Response Body (example):**
```json
{
  "coverLetter": "Dear Hiring Manager,\n\nI am writing to apply for the Frontend Developer position..."
}
```

---

## 6. Data Models

The epic reuses CV structures from Epic 2 and job analysis from Epic 3, and adds simple types for generated application content.

### 6.1 TypeScript Interfaces

```ts
export interface TailoredCvRequest {
  cvId: string;
  jobAnalysisId: string;
}

export interface TailoredCvSection {
  title: string;
  company?: string;
  period?: string;
  bullets: string[];
}

export interface TailoredCvResult {
  summary: string;
  experience: TailoredCvSection[];
  skills: string[];
}

export interface TailoredCoverLetterRequest {
  cvId: string;
  jobAnalysisId: string;
}

export interface TailoredCoverLetterResult {
  coverLetter: string;
}
```

These interfaces are not final API contracts but give a clear view of expected data shape and make it easier to implement and test.

---

## 7. Processing Flow

High-level flow for tailored CV and cover letter generation:

1. The user selects a CV and a job (or uses a stored job analysis from Epic 3).
2. Frontend calls `/api/application/generate-cv` or `/api/application/generate-cover-letter`.
3. Backend validates `cvId` and `jobAnalysisId`.
4. Backend fetches:
   - Structured CV data (Epic 2).
   - Job analysis data (Epic 3) including keywords and match information.
5. Backend builds a prompt for the LLM provider, combining:
   - Key job requirements.
   - Relevant CV experience, skills and education.
6. LLM returns tailored content:
   - For CV: summary, rephrased bullet points, selected skills.
   - For cover letter: introduction, body paragraphs, closing.
7. Backend returns the generated content to the frontend.
8. Frontend displays the tailored CV/cover letter in an editable view.
9. When the user is satisfied, they can download the final content as PDF/DOCX (using the document generation from Epic 2).

---

## 8. Prompt Guidelines (LLM)

The exact prompts can change over time, but they should follow some basic principles:

- Use only information that already exists in the user’s CV and in the job description or job analysis.
- Do not invent new job titles, companies, degrees or certifications.
- Emphasize skills and experiences that match the job’s key requirements.
- Keep the language professional and concise.

### Example Prompt Idea (for CV)

> You are helping a candidate adapt their CV to a specific job.  
> You are given:
> - structured CV data  
> - job keywords and requirements  
> Rewrite the CV summary and bullet points so they match the job, but do not invent new experience or education.  
> Return JSON with fields: summary, experience[], skills[].

(The actual implementation will plug in data from Epic 2 and Epic 3.)

---

## 9. Non-Functional Requirements

- **Performance:**  
  - Target generation time: under 6–8 seconds per document under normal load.
- **Privacy:**  
  - CV and job data must not be logged in plain text in application logs.
  - All data must be handled according to the PRD’s GDPR requirements.
- **Reliability:**  
  - If the LLM call fails, the system must return a clear error message so the user can retry.
- **Usability:**  
  - All generated content must be editable before download.

---

## 10. Test Ideas

High-level test cases:

- Tailored CV generation:
  - With strong match between CV and job → summary and bullets should clearly reflect the job requirements.
  - With weak match → content should still be consistent with CV, but not fabricate skills.
- Tailored cover letter:
  - Check structure (intro, body, closing).
  - Check that job title and company name from the job description are used correctly.
- Error handling:
  - Invalid `cvId` or `jobAnalysisId` should produce clear error responses.
- Editing flow:
  - Ensure that user edits in the frontend are preserved and not overwritten by new API calls unless explicitly requested.

---

## 11. Conclusion

Epic 4 turns the output from Epic 2 (CV data) and Epic 3 (job analysis) into practical, tailored application documents. It is a key part of the user experience, since it is where users see direct value: a CV and cover letter that are adapted to a specific job, while still being based on their real experience. The result of this epic is a complete tailored-application flow that can later be extended with history, analytics and premium features.
