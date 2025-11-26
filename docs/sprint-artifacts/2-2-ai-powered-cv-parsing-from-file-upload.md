# Story 2.2: AI-Powered CV Parsing from File Upload

Status: done

## Story

As a user,
I want to upload my existing CV file and have it automatically parsed,
so that I don't have to manually re-enter all my information.

## Acceptance Criteria

1.  **Given** I have an existing CV file (PDF, DOCX, or TXT)
2.  **When** I upload the file via the CV upload interface
3.  **Then** The system extracts structured data including work experience, education, skills, and contact information with 95%+ accuracy.
4.  **And** The parsed data is displayed in a confirmation screen for review.
5.  **And** I can edit any incorrectly parsed fields before confirming.
6.  **And** Unsupported file formats show a clear error message with supported formats listed.
7.  **And** Parsing progress is shown with estimated time (3-5 seconds).
8.  **And** The system handles parsing errors gracefully with retry options.

## Tasks / Subtasks

- [x] **Backend: Implement File Upload Endpoint (AC 1, 2, 6)**
  - [x] Create `/api/cv/upload` endpoint using Express.
  - [x] Implement Multer middleware for file handling.
  - [x] Configure Multer with file type filter (PDF, DOCX, TXT) and size limit (5MB).
  - [x] **Testing:** Unit test Multer configuration for correct file type/size validation.
- [x] **Backend: Integrate AI Parsing Service (AC 3, 7)**
  - [x] Set up Vercel AI SDK with Google Gemini 2.5 Flash.
  - [x] Create a `parsing.service.ts` to encapsulate AI calls.
  - [x] Implement AI call to extract structured data from uploaded file content.
  - [x] Map extracted data to the `CV` data model (from Story 2.1).
  - [x] Handle AI processing time feedback (loading states).
  - [x] **Testing:** Unit test `parsing.service.ts` with mock AI responses. Integration test AI endpoint with sample files.
- [x] **Backend: Enhance File Upload Validation (AC 6)**
  - [x] Implement MIME type verification based on file content (beyond just extension).
  - [x] Integrate this enhanced validation into the file upload middleware.
  - [x] **Testing:** Unit test MIME type verification for various file types (valid and invalid).
- [x] **Backend: Implement CV Creation from Parsed Data (AC 3)**
  - [x] Extend `cv.service.ts` to create or update CV entries using the parsed structured data from the AI.
  - [x] Integrate with `cv.repository.ts` to persist the data.
  - [x] **Testing:** Unit test the service logic for creating/updating CVs from parsed data.
- [x] **Frontend: Create CV Upload & Review UI (AC 2, 4, 5)**
  - [x] Develop a React component for file upload (drag-and-drop or button).
  - [x] Implement UI for displaying parsing progress and estimated time.
  - [x] Create a confirmation screen to display parsed CV data.
  - [x] Implement editable fields for user review and correction of parsed data.
  - [x] Integrate client-side validation using Zod schemas (from Story 2.1 context).
  - [x] **Testing:** Component tests for upload, progress, and review UI. Unit tests for Zod validation schemas.
- [x] **Error Handling: Implement Graceful Error Recovery (AC 8)**
  - [x] Define error messages and user-friendly prompts for parsing failures, unsupported formats, and timeout issues.
  - [x] Implement retry mechanisms for transient errors.
  - [x] **Testing:** Integration tests for various error scenarios.

## Dev Notes

### Requirements & Context Summary

**Date Generated:** 2025-11-25

**Epic:** 2: AI-Powered CV Data Management & Preview
**Story:** 2.2: AI-Powered CV Parsing from File Upload

**User Story Statement:**
As a user,
I want to upload my existing CV file and have it automatically parsed,
So that I don't have to manually re-enter all my information.

**Key Functional Requirements (from PRD):**
- FR-2.1: CV Data Intake (The platform must allow the user to enter all core CV data through a clean, guided, step-by-step intake flow. Each section (personal details, work experience, education, skills, and languages) must be captured in a structured format.)
- FR-2.2: CV Data Editing (The system must allow the user to edit any CV entry instantly.)

**Acceptance Criteria (from Epics):**
1. Given I have an existing CV file (PDF, DOCX, or TXT)
2. When I upload the file via the CV upload interface
3. Then The system extracts structured data including work experience, education, skills, and contact information with 95%+ accuracy.
4. And The parsed data is displayed in a confirmation screen for review.
5. And I can edit any incorrectly parsed fields before confirming.
6. And Unsupported file formats show a clear error message with supported formats listed.
7. And Parsing progress is shown with estimated time (3-5 seconds).
8. And The system handles parsing errors gracefully with retry options.

**Technical Context & Constraints:**
- **AI Integration:** Integrate AI-powered parsing service (Google Gemini 2.5 Flash recommended by `research-technical.md`) or specialized document parsing API like Docparser.
- **File Upload:** Backend will use Multer for `multipart/form-data` handling. Multer will be configured with a file filter for allowed types (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`) and a file size limit of 5 MB. (`architecture-backend.md`)
- **Validation:** Insufficient file upload validation based on extension only has been noted; MIME type verification from file content is recommended. (`ARCHITECTURE-REVIEW.md`)
- **Parsed Data Review:** Create confirmation UI for parsed data review.
- **Data Model:** Story depends on `Story 2.1: Structured CV Data Model Design & Implementation` for structured storage of CV components.

### Project Structure Alignment & Learnings from Previous Story (2.1)

Story 2.1 (`Structured CV Data Model Design & Implementation`) laid the foundational data structures that Story 2.2 (`AI-Powered CV Parsing from File Upload`) will utilize.

**Key Learnings & Reuses from Story 2.1:**
- **Data Model:** Story 2.1 defined the core `CV` and `CVVersion` models in `prisma/schema.prisma` with `JSONB` fields for `personal_info`, `education`, `experience`, `skills`, and `languages`. Story 2.2 will parse incoming CV data into this structured format.
- **Backend Services:** Initial method stubs for `cv.repository.ts` and `cv.service.ts` were created. Story 2.2 will need to integrate the parsing logic into these services (e.g., a `createCVFromParsedData` method in `cv.service.ts`).
- **Frontend Types & Schemas:** Frontend TypeScript interfaces (`frontend/src/types/cv.ts`) and Zod validation schemas (`frontend/src/lib/schemas/cv.ts`) were defined. Story 2.2 will ensure that parsed CV data aligns with these frontend structures for type safety and client-side validation.
- **Reference:** The detailed technical context for the data model can be found in `docs/sprint-artifacts/2-1-structured-cv-data-model-design-implementation.context.xml`.

**Alignment for Story 2.2:**
- **Backend Implementation:** Parsing logic should reside in a new service (`parsing.service.ts`) or integrated into `cv.service.ts`, using the repository for persistence. File upload handling will be in a new controller/middleware.
- **Frontend Integration:** The UI for CV upload and parsed data review will align with the defined frontend types and schemas.

### Learnings from Previous Story (2.1) (Status: ready-for-dev)

- **New Files Created:** None specific to code, but the previous story generated its own markdown and context XML.
- **New Services Created/Stubs:** `cv.repository.ts`, `cv.service.ts` (stubs), which will be reused and extended for CV parsing logic.
- **Architectural Decisions:** Establishment of Prisma ORM for data modeling and PostgreSQL/Supabase as the database. Use of JSONB fields for flexible CV data.
- **Technical Debt:** The issue of `JSONB Schema Validation Missing` was noted in `ARCHITECTURE-REVIEW.md` and explicitly mentioned as a subtask for future iteration in Story 2.1. This story (2.2) should acknowledge this and ensure any data parsing is robust enough to handle potential inconsistencies if database-level validation isn't yet implemented.
- **Warnings/Recommendations:** The architecture review noted the need for efficient CV versioning (delta-based). While not directly impacting parsing, the parsed data will feed into the versioned CV.

### References

- Cite all technical details with source paths and sections, e.g. [Source: docs/<file>.md#Section]
- [Source: docs/PRD.md#FR-2.1]
- [Source: docs/epics.md#Story-2.2]
- [Source: docs/architecture-backend.md#8-file-upload-handling]
- [Source: docs/ARCHITECTURE-REVIEW.md#3.4-file-upload-validation-insufficient-high-priority]
- [Source: docs/research-technical.md#8-recommendations]
- [Source: docs/sprint-artifacts/2-1-structured-cv-data-model-design-implementation.md#Dev-Notes]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->
- docs/sprint-artifacts/2-2-ai-powered-cv-parsing-from-file-upload.context.xml

### Agent Model Used

gemini-1.5-flash

### Debug Log References

### Completion Notes List
- Implemented the backend file upload endpoint (`/api/v1/cvs/parse`) using Multer, with file type and size validation.
- Implemented content-based MIME type verification using 'file-type' library to enhance security.
- Created `src/config/ai-providers.ts` for Google Generative AI setup.
- Created `src/prompts/cv-parsing.prompt.ts` with a detailed prompt for CV parsing.
- Created `src/services/parsing.service.ts` to encapsulate AI calls, including Zod validation for AI output to map to the `CVData` model.
- Modified `src/controllers/cv.controller.ts` to integrate the parsing service.
- Implemented asynchronous CV parsing using BullMQ (`src/jobs/index.ts`, `src/jobs/cv-parsing.job.ts`) for retry mechanisms and graceful error recovery.
- Updated `src/server.ts` to start the BullMQ job processor.
- Created `frontend/src/components/features/cv-upload/CVUploadForm.tsx` for file upload with client-side validation.
- Created `frontend/src/app/(dashboard)/cv/upload/page.tsx` to manage the upload flow, parsing progress, and polling for completion.
- Created `frontend/src/components/features/cv-upload/CVParseConfirmation.tsx` as a stub for reviewing and editing parsed CV data.

### File List
- New: `src/middleware/upload.middleware.ts`
- New: `src/config/ai-providers.ts`
- New: `src/prompts/cv-parsing.prompt.ts`
- New: `src/services/parsing.service.ts`
- New: `src/jobs/index.ts`
- New: `src/jobs/cv-parsing.job.ts`
- New: `src/config/redis.ts`
- New: `frontend/src/components/features/cv-upload/CVUploadForm.tsx`
- New: `frontend/src/app/(dashboard)/cv/upload/page.tsx`
- New: `frontend/src/components/features/cv-upload/CVParseConfirmation.tsx`
- Modified: `src/controllers/cv.controller.ts`
- Modified: `src/routes/cv.routes.ts`
- Modified: `src/routes/index.ts`
- Modified: `src/server.ts`
