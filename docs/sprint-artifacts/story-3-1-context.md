# Story 3-1: Job Description Input Interface (MVP) - Context for Development

**Epic:** Epic 3: Job Ad Analysis & Match Scoring
**Story ID:** STORY-3-1
**Status:** Ready for Development

## Overview

This document provides the necessary technical context for developers to implement Story 3-1: "Job Description Input Interface (MVP)". The goal is to provide a user interface for logged-in users to input job description text, which will then be sent to the backend for AI-powered analysis.

## User Story

**As a logged-in user,**
**I want to input a job description text (paste or type),**
**So that I can initiate AI-powered analysis to tailor my CV and cover letter for that specific role.**

## Acceptance Criteria

*   **AC1: Accessible Input:** The system shall provide a clear and easily accessible input area (e.g., a large text area) for the job description on the `/create-application` page.
*   **AC2: Input Submission:** The user shall be able to submit the entered job description via a prominent action button (e.g., "Analyze Job Description" or "Next").
*   **AC3: Input Validation (Frontend):** The frontend shall perform basic validation on the job description text (e.g., not empty, minimum length) and provide immediate feedback to the user.
*   **AC4: Loading Indicator:** Upon submission, a clear loading indicator shall be displayed to inform the user that the analysis process has started.
*   **AC5: Authentication Requirement:** Only authenticated users shall be able to access the job description input interface. Unauthorized attempts should redirect to the login page.
*   **AC6: Error Handling (Frontend):** The system shall gracefully handle frontend-related errors (e.g., network issues) during submission and display user-friendly error messages.
*   **AC7: Backend API Call:** Upon successful frontend submission and validation, the system shall make an API call to the backend's `POST /api/v1/jobs/analyze` endpoint with the job description text.
*   **AC8: Redirection/Next Step:** Upon successful submission to the backend, the user should be clearly guided to the next step of the application tailoring process (e.g., a page showing analysis results, or a spinner while results are being processed).
*   **AC9: Mobile Responsiveness:** The input interface shall be fully responsive and usable across various mobile and tablet devices.

## Technical Details and Implementation Notes

### Frontend (`frontend/`)

*   **Page:** The main interaction will occur on `frontend/src/app/(dashboard)/create-application/page.tsx`.
*   **Component:** Implement the input form within `frontend/src/components/features/job-analysis/JobDescriptionInput.tsx`.
    *   This component will utilize `React Hook Form` for form management.
    *   `Zod validation` will be used for schema validation, defined in `frontend/src/lib/schemas/job.ts`.
    *   The form submission will trigger an API call via `frontend/src/lib/api/job-analysis.ts`.
    *   State management for the input and analysis process (loading, errors) will be handled by `frontend/src/store/jobAnalysisStore.ts` (Zustand).
    *   Ensure proper loading indicators and error messages are displayed.
*   **Styling:** Use Tailwind CSS for styling, ensuring mobile responsiveness.
*   **Authentication:** The page `app/(dashboard)` is protected by `middleware.ts` for authentication.

### Backend (`src/`)

*   **Endpoint:** The frontend will call `POST /api/v1/jobs/analyze`.
*   **Route Definition:** Ensure this route is defined in `src/routes/job.routes.ts`.
*   **Controller:** `src/controllers/job.controller.ts` will receive the request.
*   **Middleware:**
    *   `src/middleware/validate.middleware.ts` will apply `Zod validation` using `src/validators/job.validator.ts` for the incoming job description payload.
    *   `src/middleware/rate-limit.middleware.ts` (`aiLimiter`) must be applied to this endpoint due to its AI-intensive nature.
*   **Service:** `src/services/job-analysis.service.ts` will contain the business logic for initial job description processing and interaction with the AI service.
    *   This service will integrate with the `Vercel AI SDK` and primarily `Google Gemini 2.5 Flash`.
    *   Prompt templates should be managed and versioned in `src/prompts/job-extraction.prompt.ts`.
    *   **Caching Strategy:** Implement aggressive caching using Redis (as detailed in `ARCHITECTURE-REVIEW.md` and `docs/architecture-backend.md`) for job description analysis results to optimize costs and performance.
*   **Error Handling:** Ensure robust error handling at all layers, returning meaningful error messages to the frontend.

## Dependencies

*   **Epic 1 (Platform Foundation & User Onboarding):** User authentication and basic profile management must be functional.
*   **Backend AI Integration:** The Vercel AI SDK and Google Gemini 2.5 Flash setup must be configured and accessible.
*   **Redis:** For caching and potential rate limiting.

## Potential Risks and Considerations

*   **AI API Rate Limits:** Monitor usage to avoid hitting free tier limits. Implement caching aggressively.
*   **AI Processing Latency:** Provide clear loading states and consider streaming responses for a better user experience (though full streaming might be for later stories).
*   **Validation Edge Cases:** Ensure robust validation for various job description formats and content.

## Definition of Done (for this story)

*   Frontend UI allows users to input and submit a job description.
*   Frontend validation is implemented and provides feedback.
*   Frontend displays appropriate loading and error states.
*   Backend endpoint `POST /api/v1/jobs/analyze` successfully receives and validates the job description.
*   Backend endpoint returns a success status (even if full AI analysis is pending for later stories).
*   All identified frontend and backend components are created and integrated.
*   Code is unit-tested and linted.
*   Story is reviewed and approved.


## Change Log
- 2025-12-02: Senior Developer Review notes appended.

## Tasks / Subtasks

### Review Follow-ups (AI)

- [ ] [AI-Review][High] Create the page `frontend/src/app/(dashboard)/create-application/page.tsx`.
- [ ] [AI-Review][High] Implement the `frontend/src/middleware.ts` file to protect all routes within the `(dashboard)` group.
- [ ] [AI-Review][High] Integrate the `JobDescriptionInput.tsx` component into the new `create-application/page.tsx`.
- [ ] [AI-Review][High] Implement the form submission logic in `create-application/page.tsx` to call the `analyzeJobDescriptionApi` function.
- [ ] [AI-Review][Medium] Implement redirection or a next-step indicator after successful submission (AC8).
- [ ] [AI-Review][Medium] Add frontend tests for the `create-application` page.

## Senior Developer Review (AI)

- **Reviewer**: Amelia
- **Date**: 2025-12-02
- **Outcome**: 🛑 Blocked

### Summary

The review is blocked due to critical missing components in the frontend. While the backend implementation is mostly complete and of good quality, the feature is inaccessible to the user because the main page (`create-application/page.tsx`) and the authentication middleware (`middleware.ts`) are missing.

### Key Findings

-   **HIGH [BLOCKER]**: **Missing Feature Page**: The primary page for this feature, `frontend/src/app/(dashboard)/create-application/page.tsx`, does not exist. This makes the entire feature inaccessible. (AC1, AC2, AC8)
-   **HIGH [BLOCKER]**: **Missing Authentication Middleware**: The `frontend/src/middleware.ts` file is missing. As per the story context, this file is responsible for protecting the dashboard routes, including the page for this feature. This is a critical security vulnerability. (AC5)

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence/Notes |
| :-- | :--- | :--- | :--- |
| AC1 | Accessible Input Area | **MISSING** | The page `create-application/page.tsx` does not exist. The component `JobDescriptionInput.tsx` exists but is not used. |
| AC2 | Input Submission | **PARTIAL** | The submit button exists in the component, but the page is missing. |
| AC3 | Frontend Validation | **IMPLEMENTED** | `zod` schema in `frontend/src/components/features/job-analysis/JobDescriptionInput.tsx` validates min length. |
| AC4 | Loading Indicator | **IMPLEMENTED** | The `isLoading` prop in `JobDescriptionInput.tsx` handles the loading state of the button. |
| AC5 | Authentication Requirement | **MISSING** | `frontend/src/middleware.ts` not found. Dashboard routes are not protected. |
| AC6 | Error Handling (Frontend) | **IMPLEMENTED** | The `error` prop in `JobDescriptionInput.tsx` displays an error message. |
| AC7 | Backend API Call | **PARTIAL** | The API client function exists in `frontend/src/lib/api/job-analysis.ts`, but it is not called from any page. |
| AC8 | Redirection/Next Step | **MISSING** | No redirection logic is implemented as the page does not exist. |
| AC9 | Mobile Responsiveness | **PARTIAL** | The component uses responsive-friendly styling, but cannot be verified without the page. |

**Summary**: 2 of 9 acceptance criteria fully implemented. 4 are partial, and 3 are missing.

### Task Completion Validation

The story file did not contain a `Tasks/Subtasks` section.

### Test Coverage and Gaps

-   Unit and integration tests exist for the backend.
-   The frontend is missing tests for the `create-application` page and its interaction with the `JobDescriptionInput` component, as the page does not exist.

### Architectural Alignment

-   The implemented backend code aligns with the service-repository pattern.
-   The frontend component aligns with the component-based architecture.
-   The lack of authentication middleware is a major deviation from the architectural requirements.

### Security Notes

-   **CRITICAL**: The absence of `middleware.ts` leaves all dashboard routes unprotected, allowing unauthenticated access.
-   The backend correctly uses the `aiLimiter` rate limiter on the `/analyze` endpoint.

### Action Items

**Code Changes Required:**

-   [ ] **[High]** Create the page `frontend/src/app/(dashboard)/create-application/page.tsx`.
-   [ ] **[High]** Implement the `frontend/src/middleware.ts` file to protect all routes within the `(dashboard)` group.
-   [ ] **[High]** Integrate the `JobDescriptionInput.tsx` component into the new `create-application/page.tsx`.
-   [ ] **[High]** Implement the form submission logic in `create-application/page.tsx` to call the `analyzeJobDescriptionApi` function.
-   [ ] **[Medium]** Implement redirection or a next-step indicator after successful submission (AC8).
-   [ ] **[Medium]** Add frontend tests for the `create-application` page.

**Advisory Notes:**

-   Note: A `tech-spec-epic-3.md` file was not found. While not blocking for this story, it should be created for future stories in this epic.
