# Story 1.2: User Registration & Account Creation

Status: review

## Story

As a new user,
I want to create an account,
So that I can securely access the AI CV platform.

## Acceptance Criteria

1.  **Given** I am on the platform's registration page
2.  **When** I enter a unique email address and a strong password
3.  **Then** My account is successfully created and stored in the database
4.  **And** I receive a confirmation email to verify my account (or similar verification mechanism)
5.  **And** I am redirected to a login page or dashboard
6.  **And** Password hashing and salting are used for security

## Tasks / Subtasks

    -   [x] **Backend: Create User Model & Repository** (AC: 3)    -   [x] Define `User` schema in `prisma/schema.prisma` including fields for `email`, `password_hash`, `name`, `consent_essential`, `consent_ai_training`, `consent_marketing`.
    -   [x] Implement `user.repository.ts` with a `create` method using Prisma client.
    -   [x] **Backend: Implement Registration Service & Controller** (AC: 3, 6)    -   [x] Create `auth.service.ts` with a `register` function.
    -   [x] Implement password hashing using `bcrypt` in `password.util.ts`.
    -   [x] Ensure the service hashes the password before calling the repository.
    -   [x] Create `auth.controller.ts` to handle the registration request.
    -   [x] **Backend: Create Registration API Endpoint** (AC: 3)    -   [x] Define `POST /api/v1/auth/register` route in `auth.routes.ts`.
    -   [x] Add Zod validation (`auth.validator.ts`) for email and password fields.
    -   [x] Apply rate limiting (`rate-limit.middleware.ts`) to the endpoint.
    -   [x] **Backend: Email Verification** (AC: 4)    -   [x] Integrate an email service (e.g., SendGrid, SES) in `email.service.ts`.
    -   [x] Trigger a verification email upon successful registration. (Can be mocked for MVP).
    -   [x] **Frontend: Create Signup Form Component** (AC: 2)    -   [x] Develop `SignupForm.tsx` component in `components/features/auth/`.
    -   [x] Use `React Hook Form` for form state management.
    -   [x] Implement client-side validation using `Zod` from `schemas/auth.ts`.
    -   [x] **Frontend: Implement API Integration** (AC: 2, 5)    -   [x] Create `auth.ts` API client in `lib/api/` to call the backend registration endpoint.
    -   [x] Implement `useAuth` hook in `hooks/` to handle registration logic.
    -   [x] Use `Zustand` (`authStore.ts`) to manage authentication state.
    -   [x] On successful registration, redirect the user to the `/login` page or `/dashboard`.
    -   [x] **Security: Implement Strong Password Policy** (AC: 2)    -   [x] Enforce password policy on both frontend (Zod schema) and backend.
    -   [x] Policy: min 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.

## Dev Notes

-   **Backend Architecture:** Follow the layered pattern: `routes` -> `controllers` -> `services` -> `repositories`. Controllers should be thin, with business logic residing in services.
-   **Password Security:** Use `bcrypt` with a salt round of 10. Never log plain-text passwords. [Source: `docs/architecture-backend.md#Password-Hashing`]
-   **Authentication:** This story sets up registration. The subsequent story (1.3) will handle login and JWTs. Do not implement JWT logic here.
-   **Frontend State:** Use Zustand for global auth state. Local form state should be managed by React Hook Form. [Source: `docs/architecture-frontend.md#State-Management-Strategy`]
-   **UI Components:** Use `shadcn/ui` components (`Input`, `Button`, `Card`) for the form, as defined in the design system. [Source: `docs/ux-design-specification-COMPLETE.md#Component-Library-Strategy`]
-   **Error Handling:** The API should return clear error messages for validation failures (e.g., email already exists, password too weak), which the frontend should display to the user. Use the global error handler middleware. [Source: `docs/architecture-backend.md#Global-Error-Handler-Middleware`]

### Project Structure Notes

-   **Backend Files to Create/Modify:**
    -   `src/models/prisma/schema.prisma` (add User model)
    -   `src/repositories/user.repository.ts`
    -   `src/services/auth.service.ts`
    -   `src/utils/password.util.ts`
    -   `src/controllers/auth.controller.ts`
    -   `src/routes/auth.routes.ts`
    -   `src/validators/auth.validator.ts`
-   **Frontend Files to Create/Modify:**
    -   `src/app/(auth)/signup/page.tsx`
    -   `src/components/features/auth/SignupForm.tsx`
    -   `src/lib/api/auth.ts`
    -   `src/lib/schemas/auth.ts`
    -   `src/store/authStore.ts`

### References

-   PRD: `docs/PRD.md` (FR-1.1, FR-6.1)
-   Epics: `docs/epics.md` (Story 1.2)
-   Backend Architecture: `docs/architecture-backend.md` (Sections 6, 14)
-   Frontend Architecture: `docs/architecture-frontend.md` (Sections 9, 10)
-   UX Design Spec: `docs/ux-design-specification-COMPLETE.md` (Section 6.3 - Input Component)
-   Architecture Review (Security): `docs/ARCHITECTURE-REVIEW.md#3.1-Weak-Password-Policy`

## Dev Agent Record

### Context Reference

- `C:\Users\kayle\Desktop\SG-Gruppe-12\docs\sprint-artifacts/1-2-user-registration-account-creation.context.xml`

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List
- Story 1.2: User Registration & Account Creation has been fully implemented and is ready for review.
- Backend: User model and repository created with Prisma. Registration service and controller implemented with bcrypt password hashing and Zod validation. Email verification initiated with a mocked email service.
- Frontend: Signup form component created using React Hook Form and Zod for client-side validation. API integration implemented with useAuth hook and Zustand for state management, redirecting to login on success.
- Security: Strong password policy enforced on both frontend and backend.

### File List
- src/prisma/schema.prisma (CREATE)
- src/config/database.ts (CREATE)
- src/repositories/user.repository.ts (MODIFIED)
- src/utils/password.util.ts (CREATE)
- src/services/auth.service.ts (MODIFIED)
- src/controllers/auth.controller.ts (CREATE)
- src/services/email.service.ts (CREATE)
- src/app.ts (MODIFIED)
- src/server.ts (MODIFIED)
- src/routes/auth.routes.ts (MODIFIED)
- src/routes/index.ts (CREATE)
- src/validators/auth.validator.ts (CREATE)
- src/middleware/validate.middleware.ts (CREATE)
- src/utils/errors.util.ts (CREATE)
- src/middleware/rate-limit.middleware.ts (CREATE)
- src/tsconfig.json (CREATE)
- src/package.json (MODIFIED - added bcrypt, uuid, zod, express-rate-limit, @types/*)
- frontend/src/lib/schemas/auth.ts (CREATE)
- frontend/src/components/features/auth/SignupForm.tsx (MODIFIED)
- frontend/src/lib/api/auth.ts (CREATE)
- frontend/src/store/authStore.ts (CREATE)
- frontend/src/lib/hooks/useAuth.ts (CREATE)
- frontend/package.json (MODIFIED - added react-hook-form, zod, zustand, @hookform/resolvers, next)
