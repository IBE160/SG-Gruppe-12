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
