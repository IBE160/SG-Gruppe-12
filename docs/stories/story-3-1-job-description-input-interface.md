# Story 3-1: Job Description Input Interface (MVP)

**Epic:** Epic 3: Job Ad Analysis & Match Scoring

**As a logged-in user,**
**I want to input a job description text (paste or type),**
**So that I can initiate AI-powered analysis to tailor my CV and cover letter for that specific role.**

## Acceptance Criteria:

*   **AC1: Accessible Input:** The system shall provide a clear and easily accessible input area (e.g., a large text area) for the job description on the `/create-application` page.
*   **AC2: Input Submission:** The user shall be able to submit the entered job description via a prominent action button (e.g., "Analyze Job Description" or "Next").
*   **AC3: Input Validation (Frontend):** The frontend shall perform basic validation on the job description text (e.g., not empty, minimum length) and provide immediate feedback to the user.
*   **AC4: Loading Indicator:** Upon submission, a clear loading indicator shall be displayed to inform the user that the analysis process has started.
*   **AC5: Authentication Requirement:** Only authenticated users shall be able to access the job description input interface. Unauthorized attempts should redirect to the login page.
*   **AC6: Error Handling (Frontend):** The system shall gracefully handle frontend-related errors (e.g., network issues) during submission and display user-friendly error messages.
*   **AC7: Backend API Call:** Upon successful frontend submission and validation, the system shall make an API call to the backend's `POST /api/v1/jobs/analyze` endpoint with the job description text.
*   **AC8: Redirection/Next Step:** Upon successful submission to the backend, the user should be clearly guided to the next step of the application tailoring process (e.g., a page showing analysis results, or a spinner while results are being processed).
*   **AC9: Mobile Responsiveness:** The input interface shall be fully responsive and usable across various mobile and tablet devices.

## Technical Notes:

*   **Frontend Component:** Implement using `components/features/job-analysis/JobDescriptionInput.tsx` within `app/(dashboard)/create-application/page.tsx`.
*   **Form Handling:** Utilize `React Hook Form` and `Zod validation` (schema in `lib/schemas/job.ts`).
*   **API Interaction:** Use client functions from `lib/api/job-analysis.ts` to call the backend.
*   **State Management:** Update `store/jobAnalysisStore.ts` for input and process status.
*   **Backend Endpoint:** The frontend will target `POST /api/v1/jobs/analyze`.
*   **Backend Components:**
    *   **Route:** `src/routes/job.routes.ts` (`POST /api/v1/jobs/analyze`)
    *   **Controller:** `src/controllers/job.controller.ts`
    *   **Service:** `src/services/job-analysis.service.ts`
    *   **Validator:** `src/validators/job.validator.ts`
    *   **Middleware:** `src/middleware/validate.middleware.ts`, `src/middleware/rate-limit.middleware.ts` (`aiLimiter`)
    *   **Prompts:** `src/prompts/job-extraction.prompt.ts`