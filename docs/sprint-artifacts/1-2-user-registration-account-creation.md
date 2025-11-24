# Story 1.2: User Registration & Account Creation

Status: ready-for-dev

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

-   [ ] **Backend: Create User Model & Repository** (AC: 3)
    -   [ ] Define `User` schema in `prisma/schema.prisma` including fields for `email`, `password_hash`, `name`, `consent_essential`, `consent_ai_training`, `consent_marketing`.
    -   [ ] Implement `user.repository.ts` with a `create` method using Prisma client.
-   [ ] **Backend: Implement Registration Service & Controller** (AC: 3, 6)
    -   [ ] Create `auth.service.ts` with a `register` function.
    -   [ ] Implement password hashing using `bcrypt` in `password.util.ts`.
    -   [ ] Ensure the service hashes the password before calling the repository.
    -   [ ] Create `auth.controller.ts` to handle the registration request.
-   [ ] **Backend: Create Registration API Endpoint** (AC: 3)
    -   [ ] Define `POST /api/v1/auth/register` route in `auth.routes.ts`.
    -   [ ] Add Zod validation (`auth.validator.ts`) for email and password fields.
    -   [ ] Apply rate limiting (`rate-limit.middleware.ts`) to the endpoint.
-   [ ] **Backend: Email Verification** (AC: 4)
    -   [ ] Integrate an email service (e.g., SendGrid, SES) in `email.service.ts`.
    -   [ ] Trigger a verification email upon successful registration. (Can be mocked for MVP).
-   [ ] **Frontend: Create Signup Form Component** (AC: 2)
    -   [ ] Develop `SignupForm.tsx` component in `components/features/auth/`.
    -   [ ] Use `React Hook Form` for form state management.
    -   [ ] Implement client-side validation using `Zod` from `schemas/auth.ts`.
-   [ ] **Frontend: Implement API Integration** (AC: 2, 5)
    -   [ ] Create `auth.ts` API client in `lib/api/` to call the backend registration endpoint.
    -   [ ] Implement `useAuth` hook in `hooks/` to handle registration logic.
    -   [ ] Use `Zustand` (`authStore.ts`) to manage authentication state.
    -   [ ] On successful registration, redirect the user to the `/login` page or `/dashboard`.
-   [ ] **Security: Implement Strong Password Policy** (AC: 2)
    -   [ ] Enforce password policy on both frontend (Zod schema) and backend.
    -   [ ] Policy: min 12 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.

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

### File List
