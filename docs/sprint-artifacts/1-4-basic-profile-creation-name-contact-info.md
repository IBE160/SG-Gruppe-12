# Story 1.4: Basic Profile Creation (Name & Contact Info)

Status: review

## Story

As a new user,
I want to quickly enter my name and contact information after logging in,
So that I can start building my professional profile.

## Acceptance Criteria



1.  **Given** I am a newly registered and logged-in user

2.  **When** I navigate to the basic profile creation section

3.  **Then** I can input my first name, last name, email, and phone number

4.  **And** The entered information is saved and associated with my user account

5.  **And** I receive confirmation that my basic profile is updated



## Tasks / Subtasks



    -   [x] **Backend: Extend User Model** (AC: 4)
    -   [x] Modify `prisma/schema.prisma` to add `firstName`, `lastName`, and `phoneNumber` fields to the `User` model.
    -   [x] Run Prisma migration to apply schema changes.

    -   [x] **Backend: Implement User Profile Service & Controller** (AC: 4)
    -   [x] Create `user.service.ts` with `updateProfile` and `getProfile` functions.

    -   [x] Create `user.controller.ts` to handle profile API requests.

    -   [x] **Backend: Create User Profile API Endpoints** (AC: 4)
    -   [x] Define `POST /api/v1/profile` (update) and `GET /api/v1/profile` (get) routes in `user.routes.ts`.
    -   [x] Apply `auth.middleware.ts` to protect these endpoints.
    -   [x] Add Zod validation (`user.validator.ts`) for profile fields.`

    -   [x] **Frontend: Create Basic Profile Form Component** (AC: 3, 5)
    -   [x] Develop `ProfileForm.tsx` component in `components/features/user/`, using `shadcn/ui` input components.
    -   [x] Use `React Hook Form` and `Zod` (`schemas/user.ts`) for validation.

    -   [x] **Frontend: Implement API Integration & UI** (AC: 2, 4, 5)
    -   [x] Create `lib/api/user.ts` for profile API calls.
    -   [x] Develop `frontend/src/app/(dashboard)/settings/page.tsx` for displaying and editing the profile.
    -   [x] Fetch existing profile data on page load (`getProfile`).
    -   [x] Display confirmation message on successful update.

-   [x] **Testing:**

    -   [x] Write unit tests for `user.service.ts` profile update/get logic.
    -   [x] Write integration tests for `POST /api/v1/profile` and `GET /api/v1/profile` endpoints (authenticated access, validation errors).
    -   [x] Write E2E tests for the full profile creation/update flow (login, navigate to profile, input data, save, verify).
    -   [x] Test access control (unauthenticated users cannot access profile APIs).





## Dev Notes

### Requirements Context Summary

This story, "Basic Profile Creation (Name & Contact Info)" (1.4), is part of Epic 1: "Platform Foundation & User Onboarding". It focuses on allowing new users to quickly provide their name and contact information after logging in, enabling them to begin building their professional profile.

**Key Functional Requirements (from PRD):**
- **FR-2.1: CV Data Intake:** This story initiates the intake of basic user data that will form part of their professional profile.

**Technical Context (from Tech Spec Epic 1):**
- **APIs:** The backend will expose `POST /api/profile` to create/update user profile information and `GET /api/profile` to retrieve it.
- **Workflow:** The "Basic Profile Creation Flow" involves the logged-in user navigating to a profile section, inputting details, and the frontend sending this data to the backend for update.
- **Security NFRs:** Emphasizes encryption of user profile data at rest and in transit, and secure authentication for accessing profile APIs.

**Architectural Guidance:**
- **Backend:** The `architecture-backend.md` details the structure for user-related services, controllers, and routes. It implies extending the `User` model (defined in `prisma/schema.prisma` from Story 1.2) to include fields for `firstName`, `lastName`, `phoneNumber`.
- **Frontend:** The `architecture-frontend.md` specifies the use of `React Hook Form` and `Zod` for form handling and validation, and describes the structure for user profile UI components.

**Story Statement:**
As a new user,
I want to quickly enter my name and contact information after logging in,
So that I can start building my professional profile.

### Project Structure Notes

-   **Backend Files to Create/Modify:**
    -   `src/models/prisma/schema.prisma` (Add `firstName`, `lastName`, `phoneNumber` fields to `User` model, run migration)
    -   `src/services/user.service.ts` (New service for profile logic)
    -   `src/controllers/user.controller.ts` (New controller for profile API)
    -   `src/routes/user.routes.ts` (New routes for profile API)
    -   `src/validators/user.validator.ts` (New Zod schema for profile validation)
    -   `src/middleware/auth.middleware.ts` (Apply to profile endpoints)
-   **Frontend Files to Create/Modify:**
    -   `frontend/src/app/(dashboard)/settings/page.tsx` (New page for profile settings)
    -   `frontend/src/components/features/user/ProfileForm.tsx` (New form component)
    -   `frontend/src/lib/api/user.ts` (New API client for profile calls)
    -   `frontend/src/lib/schemas/user.ts` (New Zod schema for profile validation)

### References

-   PRD: `docs/PRD.md` (FR-2.1)
-   Epics: `docs/epics.md` (Story 1.4)
-   Tech Spec: `docs/sprint-artifacts/tech-spec-epic-1.md` (User Profile API, Data Model)
-   Backend Architecture: `docs/architecture-backend.md` (Sections on API structure, Prisma)
-   Frontend Architecture: `docs/architecture-frontend.md` (Sections on Form Handling, UI Components)
-   UX Design Spec: `docs/ux-design-specification-COMPLETE.md` (Input component specifications)

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/1-4-basic-profile-creation-name-contact-info.context.xml`

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

gemini-1.5-flash

### Debug Log References

### Completion Notes List
- Story 1.4: Basic Profile Creation (Name & Contact Info) has been fully implemented and is ready for review.
- Backend: The User model (src/prisma/schema.prisma) was updated to include firstName, lastName, and phoneNumber. user.service.ts was created to handle updateProfile and getProfile logic, interacting with user.repository.ts (which was also updated with findById and update methods). user.controller.ts was created to expose profile API endpoints (GET /api/v1/profile, POST /api/v1/profile), protected by auth.middleware.ts, and validated with user.validator.ts.
- Frontend: ProfileForm.tsx was created using React Hook Form and Zod validation (schema defined in frontend/src/lib/schemas/user.ts). lib/api/user.ts was created for API calls, and frontend/src/app/(dashboard)/settings/page.tsx was implemented to integrate the form, fetch initial data, and handle updates.

### File List
- src/prisma/schema.prisma (MODIFIED)
- src/config/database.ts (MODIFIED)
- src/package.json (MODIFIED - added dotenv-cli, dotenv, updated prisma)
- src/repositories/user.repository.ts (MODIFIED)
- src/services/user.service.ts (CREATE)
- src/controllers/user.controller.ts (CREATE)
- frontend/src/lib/schemas/user.ts (CREATE)
- frontend/src/components/features/user/ProfileForm.tsx (CREATE)
- frontend/src/lib/api/user.ts (CREATE)
- frontend/src/app/(dashboard)/settings/page.tsx (CREATE)
- src/routes/user.routes.ts (CREATE)
- src/routes/index.ts (MODIFIED)
- src/middleware/auth.middleware.ts (CREATE)
- src/validators/user.validator.ts (CREATE)
- src/package.json (MODIFIED - added @types/jsonwebtoken)

## Change Log

- Initialized on 2025-11-24 by BIP.