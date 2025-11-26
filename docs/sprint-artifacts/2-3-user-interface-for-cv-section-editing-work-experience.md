# Story 2.3: User Interface for CV Section Editing (Work Experience)

Status: review

## Story

As a user,
I want to easily add, edit, and remove my work experience entries,
So that my CV accurately reflects my professional history.

## Acceptance Criteria

1.  **Given** I am logged in and viewing my CV data management section
2.  **When** I navigate to the "Work Experience" section
3.  **Then** I can add a new work experience entry with fields for company, title, start date, end date, and description.
4.  **And** I can edit existing work experience entries.
5.  **And** I can delete work experience entries.
6.  **And** All changes are immediately reflected in a dynamic preview (if available).

## Tasks / Subtasks

- [x] **Backend: Implement Work Experience CRUD API (AC 3, 4, 5)**
  - [x] Create `cv.routes.ts` if it doesn't exist, and add routes for `POST /cv/experience`, `PATCH /cv/experience/:id`, `DELETE /cv/experience/:id`.
  - [x] In `cv.controller.ts`, create handlers for adding, updating, and deleting work experience.
  - [x] In `cv.service.ts`, implement the business logic for creating, updating, and deleting work experience entries, ensuring it interacts with the CV versioning service (Story 2.8).
  - [x] In `cv.repository.ts`, implement the database queries to persist work experience data.
- [x] **Frontend: Develop Work Experience Management UI (AC 3, 4, 5, 6)**
  - [x] In `frontend/src/components/features/cv-management/`, create a `WorkExperienceForm.tsx` component for adding and editing entries.
  - [x] Create a `WorkExperienceList.tsx` component to display existing entries with edit and delete buttons.
  - [x] In the main CV management page, integrate the form and list components.
  - [x] Implement API calls in the frontend to connect the UI to the backend endpoints.
  - [x] Ensure the UI updates in real-time when changes are made, reflecting in the main CV preview (Story 2.5).
- [x] **Testing: Ensure Feature Quality**
  - [x] **Backend:** Write unit tests for `cv.service.ts` work experience methods.
  - [x] **Backend:** Write integration tests for the new API endpoints using Supertest.
  - [x] **Frontend:** Write component tests for `WorkExperienceForm.tsx` and `WorkExperienceList.tsx` using React Testing Library.
  - [x] **E2E:** Add a Playwright test to simulate a user adding, editing, and deleting a work experience entry.

## Dev Agent Record

### Context Reference

- `C:\Users\kayle\Desktop\SG-Gruppe-12\docs\sprint-artifacts\2-3-user-interface-for-cv-section-editing-work-experience.context.xml`

### Agent Model Used

gemini-1.5-flash

### Debug Log References

- Refactored the backend data model from a denormalized (JSONB fields in CV) to a normalized (separate CVComponent table) structure to align with the story's context and `init_db.sql`. This was a major architectural pivot from the previous story's implementation.

### Completion Notes List

- Implemented the full CRUD (Create, Read, Update, Delete) functionality for work experience entries.
- Refactored the backend `prisma.schema`, `repository`, `service`, and `controller` layers to support a normalized data model where CV sections are stored as individual components.
- The service layer now includes a transformation layer to assemble the normalized components into a single CV object for the frontend.
- Built a reusable `WorkExperienceForm` and `WorkExperienceList` in the frontend using `react-hook-form` and `shadcn/ui`.
- Integrated these components into the main CV management page, using `useSWR` for data fetching and state management.
- Wrote a full suite of tests: backend unit and integration tests, and frontend component and E2E tests.

### File List
- `prisma/schema.prisma` (refactored)
- `src/repositories/cv.repository.ts` (refactored)
- `src/services/cv.service.ts` (refactored)
- `src/controllers/cv.controller.ts` (refactored)
- `frontend/src/components/features/cv-management/WorkExperienceForm.tsx` (rewritten)
- `frontend/src/components/features/cv-management/WorkExperienceList.tsx` (rewritten)
- `frontend/src/app/(dashboard)/cv/manage/page.tsx` (refactored)
- `frontend/src/lib/api/cv.ts` (modified)
- `src/tests/cv.service.test.ts` (rewritten)
- `src/tests/integration/cv.experience.test.ts` (created)
- `frontend/src/components/features/cv-management/WorkExperienceForm.test.tsx` (rewritten)
- `frontend/src/components/features/cv-management/WorkExperienceList.test.tsx` (rewritten)
- `tests/e2e/cv-experience-crud.spec.ts` (created)
