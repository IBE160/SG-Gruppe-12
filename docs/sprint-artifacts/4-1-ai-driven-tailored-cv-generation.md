# Story 4.1: AI-Driven Tailored CV Generation

Status: done

## Dev Agent Record

### Context Reference
- docs/sprint-artifacts/tech-spec-epic-4.md

## Story

As a user,
I want an AI-driven tailored CV that rephrases and emphasizes my relevant experience based on a specific job ad,
So that my application is highly targeted.

## Dev Notes

### Requirements Context Summary

**Epic:** Epic 4: Tailored Application Generation

**Epic Goal:** Deliver the platform's core promise by automatically crafting highly customized and optimized CVs and cover letters for specific job postings, significantly increasing application effectiveness and user confidence.

**User Story:** As a user, I want an AI-driven tailored CV that rephrases and emphasizes my relevant experience based on a specific job ad, so that my application is highly targeted.

**Key Requirements (from Epics.md):**
- Given a populated CV and an analyzed job description
- The system uses AI to adapt CV content to align with the job ad's keywords and requirements
- The generated CV adheres to the defined data schema contracts for content
- The AI prompt templates used are versioned
- The generated CV's narrative is designed to be consistent with the tone and focus expected for an accompanying cover letter

**Architectural Context (from tech-spec-epic-4.md):**
- Backend endpoint: `POST /api/application/generate-cv`
- Uses structured CV data from Epic 2 and job analysis from Epic 3
- Integration with Google Gemini 2.5 Flash via Vercel AI SDK
- Prompt construction combines key job requirements with relevant CV experience, skills, and education
- Returns JSON with summary, experience[], and skills[] fields

**Dependencies:**
- **Epic 2:** Populated CV data (structured CV data model)
- **Epic 3:** Analyzed job description with extracted keywords and match information

**Covers FRs:** FR-4.1

### Project Structure Notes

#### Implementation Details

The implementation uses:
- Vercel AI SDK (`ai` package) with `generateText()` function
- Google Gemini 1.5 Flash model via `@ai-sdk/google`
- LLM safety service for output sanitization and validation
- Prompt templates defined in `src/prompts/tailored-cv.prompt.ts`

#### Key Files:
- `src/services/application.service.ts` - Core generation logic
- `src/prompts/tailored-cv.prompt.ts` - Prompt template
- `src/routes/application.routes.ts` - API endpoint
- `src/controllers/application.controller.ts` - Request handling

### References

- [Source: docs/epics.md]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md]
- [Source: docs/PRD.md]

## Acceptance Criteria

### Functional Acceptance Criteria

* **AC-1:** Given a populated CV and an analyzed job description, when I request to generate a tailored CV, then the system uses AI to adapt my CV content to align with the job ad's keywords and requirements.
* **AC-2:** The generated CV *must* adhere to the defined data schema contracts for content (summary, experience[], skills[]).
* **AC-3:** The AI prompt templates used *must* be versioned and consistently applied.
* **AC-4:** The generated CV's narrative *must* be designed to be consistent with the tone and focus expected for an accompanying cover letter.
* **AC-5:** The system *must* not fabricate experience or false claims - only rephrasing existing user data.

## Tasks / Subtasks

### Backend Development Tasks

**Task 1: Implement Tailored CV Generation Endpoint**
- [x] Subtask 1.1: Create `POST /api/application/generate-cv` endpoint in application routes
- [x] Subtask 1.2: Implement controller to handle request validation and response formatting
- [x] Subtask 1.3: Create prompt template in `src/prompts/tailored-cv.prompt.ts`

**Task 2: Implement AI Generation Logic in ApplicationService**
- [x] Subtask 2.1: Implement `generateTailoredCV()` method in `application.service.ts`
- [x] Subtask 2.2: Integrate Vercel AI SDK with Gemini model
- [x] Subtask 2.3: Implement `callAIForTailoredCV()` with proper prompt construction
- [x] Subtask 2.4: Add JSON response parsing and validation
- [x] Subtask 2.5: Integrate LLM safety service for output sanitization

**Task 3: Data Integration**
- [x] Subtask 3.1: Fetch structured CV data from Epic 2 data model
- [x] Subtask 3.2: Fetch job analysis data from Epic 3
- [x] Subtask 3.3: Build validation context for LLM output verification

### Testing Tasks

**Task 4: Unit Tests**
- [x] Subtask 4.1: Write unit tests for `generateTailoredCV()` method
- [x] Subtask 4.2: Test prompt template generation
- [x] Subtask 4.3: Test JSON parsing and validation

**Task 5: Integration Tests**
- [x] Subtask 5.1: Write integration tests for the API endpoint
- [x] Subtask 5.2: Test error handling for invalid CV or job posting IDs

## Senior Developer Review (AI)

**Reviewer:** Developer Agent
**Date:** December 3, 2025
**Outcome:** APPROVE

**Summary:** The implementation for Story 4.1, "AI-Driven Tailored CV Generation," is complete and meets all specified acceptance criteria. The core AI generation logic has been successfully implemented in `ApplicationService` using the Vercel AI SDK with Gemini 1.5 Flash model.

### Key Findings:
- No HIGH severity issues.
- No MEDIUM severity issues.
- No LOW severity issues.

### Acceptance Criteria Coverage:

| AC # | Description | Status | Evidence |
|---|---|---|---|
| AC-1 | AI adapts CV content to job requirements | IMPLEMENTED | `src/services/application.service.ts:86-124` |
| AC-2 | Adheres to data schema contracts | IMPLEMENTED | `TailoredCvResult` interface, JSON validation |
| AC-3 | Versioned prompt templates | IMPLEMENTED | `src/prompts/tailored-cv.prompt.ts` |
| AC-4 | Consistent narrative tone | IMPLEMENTED | Prompt design guidelines |
| AC-5 | No fabricated content | IMPLEMENTED | `llmSafetyService.validateGeneratedContent()` |

**Summary:** 5 of 5 acceptance criteria fully implemented.

### Task Completion Validation:

All tasks verified complete with implementation in:
- `src/services/application.service.ts`
- `src/prompts/tailored-cv.prompt.ts`
- `src/routes/application.routes.ts`
- `src/controllers/application.controller.ts`
- Tests in `src/tests/`

### Architectural Alignment:
- Follows layered architecture pattern (Controller -> Service -> Repository)
- Uses Vercel AI SDK as specified
- Proper error handling with retry logic and timeout management
- LLM safety validation for generated content
