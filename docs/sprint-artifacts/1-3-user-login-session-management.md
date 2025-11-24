# Story 1.3: User Login & Session Management

Status: ready-for-dev

## Story

As a registered user,
I want to log in and maintain a secure session,
So that I can access my CV data and application tools.

## Acceptance Criteria



1.  **Given** I am on the platform's login page

2.  **When** I enter my registered email and password

3.  **Then** I am successfully authenticated

4.  **And** A secure session is established (e.g., using JWT tokens)

5.  **And** I am redirected to my user dashboard

6.  **And** My session persists until I explicitly log out or the session expires

7.  **And** Invalid credentials result in an appropriate error message without revealing specific details (e.g., "Invalid email or password")



## Tasks / Subtasks



-   [ ] **Backend: Implement Login Service & Controller** (AC: 3, 4, 7)

    -   [ ] Extend `auth.service.ts` with a `login` function to verify credentials and generate JWTs.

    -   [ ] Add `comparePassword` utility to `password.util.ts` using `bcrypt`.

    -   [ ] Extend `auth.controller.ts` to handle the login request, calling the new `login` service.

-   [ ] **Backend: Implement JWT Generation & Handling** (AC: 4, 6)

    -   [ ] Create `jwt.util.ts` for signing, verifying, and decoding JWTs.

    -   [ ] Configure JWT tokens (access token: 15min, refresh token: 7 days) and secure HTTP-only cookie handling.

    -   [ ] Implement refresh token mechanism (rotation strategy to be defined/considered for future story).

-   [ ] **Backend: Create Login API Endpoint** (AC: 3, 7)

    -   [ ] Define `POST /api/v1/auth/login` route in `auth.routes.ts`.

    -   [ ] Add Zod validation (`auth.validator.ts`) for email and password.

    -   [ ] Apply rate limiting (`rate-limit.middleware.ts`) to prevent brute-force attacks.

-   [ ] **Frontend: Create Login Form Component** (AC: 1, 2, 7)

    -   [ ] Develop `LoginForm.tsx` component in `components/features/auth/`, following patterns from `SignupForm.tsx`.

    -   [ ] Use `React Hook Form` and `Zod` (`schemas/auth.ts`) for validation.

-   [ ] **Frontend: Implement API Integration & Session Management** (AC: 3, 4, 5, 6)

    -   [ ] Extend `lib/api/auth.ts` to call the backend login and refresh token endpoints.

    -   [ ] Implement `useAuth` hook and update `authStore.ts` (Zustand) to manage login state, JWT tokens, and user session.

    -   [ ] Implement redirection to dashboard (`/dashboard`) on successful login.

    -   [ ] Handle invalid credentials display on the UI.

-   [ ] **Frontend: Implement Session Persistence & Logout** (AC: 6)

    -   [ ] Implement logic to check and renew session (using refresh token if applicable).

    -   [ ] Create a logout mechanism that clears session data and invalidates tokens.

-   [ ] **Security: Address Weak Password Policy (from Architecture Review)** (AC: 2, 7)

    -   [ ] Ensure `comparePassword` handles bcrypt.

    -   [ ] Frontend validation provides informative feedback for invalid credentials.

-   [ ] **Testing:**

    -   [ ] Write unit tests for `auth.service.ts` login logic and `password.util.ts` `comparePassword`.

    -   [ ] Write integration tests for `POST /api/v1/auth/login` endpoint (successful login, invalid credentials).

    -   [ ] Write E2E tests for the full login flow (UI interaction, API call, redirection).

    -   [ ] Test error messages for invalid credentials.





## Dev Notes

### Requirements Context Summary

This story, "User Login & Session Management" (1.3), is part of Epic 1: "Platform Foundation & User Onboarding". It focuses on allowing registered users to securely log in and maintain authenticated sessions.

**Key Functional Requirements (from PRD):**
- **FR-1.1: Account Creation & Authentication:** This story builds directly on the registration process established in Story 1.2, enabling users to authenticate.
- **FR-6.1: Strict Data Privacy:** Secure session management contributes to overall data privacy.

**Technical Context (from Tech Spec Epic 1):**
- **APIs:** The backend will expose `POST /api/auth/login` for user authentication and `GET /api/auth/verify-session` for checking JWT token validity.
- **Workflow:** The "User Login and Session Management Flow" involves frontend sending credentials, backend verifying, generating JWT, and frontend securely storing and using the JWT.
- **Security NFRs:** Emphasizes secure, HTTP-only, and signed JWT tokens with appropriate expiry, and potentially a revocation mechanism. Session verification performance is targeted at < 100ms.

**Architectural Guidance:**
- **Backend:** The `architecture-backend.md` details the use of `jsonwebtoken` for JWT handling, `bcrypt` for password comparison (though hashing is in 1.2), and cookie handling for secure token storage. It also outlines the structure for auth-related services, controllers, and routes.
- **Frontend:** The `architecture-frontend.md` specifies a JWT token strategy with HTTP-only cookies, protected routes using middleware, and `Zustand` (`authStore`) for managing authentication state. `React Hook Form` and `Zod` will be used for the login form.
- **Security Review:** `ARCHITECTURE-REVIEW.md` highlights the importance of implementing JWT Refresh Token Rotation and appropriate Rate Limiting on authentication endpoints as high-priority security concerns. These should be considered during the implementation of session management.

**Story Statement:**
As a registered user,
I want to log in and maintain a secure session,
So that I can access my CV data and application tools.

### Testing Guidance

Testing for this story should align with the standards outlined in the `Tech Spec: Platform Foundation & User Onboarding` (`docs/sprint-artifacts/tech-spec-epic-1.md`). This includes a focus on unit tests for authentication logic and JWT generation/validation, integration tests for the API endpoints, and E2E tests for the login flow. Refer to the `Backend Architecture Specification` and `Frontend Architecture Specification` for guidance on testing strategies for their respective layers.

### Project Structure Notes

-   **Backend Files to Create/Modify:**
    -   `src/repositories/user.repository.ts` (Extend `findByEmail` method)
    -   `src/services/auth.service.ts` (Extend with `login` function)
    -   `src/utils/password.util.ts` (Add `comparePassword` utility)
    -   `src/utils/jwt.util.ts` (Create for JWT generation/validation)
    -   `src/controllers/auth.controller.ts` (Extend to handle login)
    -   `src/routes/auth.routes.ts` (Extend for `POST /api/v1/auth/login`)
    -   `src/validators/auth.validator.ts` (Add login schema)
    -   `src/middleware/auth.middleware.ts` (New, for JWT verification on protected routes)
    -   `src/middleware/rate-limit.middleware.ts` (Apply to login endpoint)
-   **Frontend Files to Create/Modify:**
    -   `frontend/src/app/(auth)/login/page.tsx` (New login page)
    -   `frontend/src/components/features/auth/LoginForm.tsx` (New login form component)
    -   `frontend/src/lib/api/auth.ts` (Extend for login and refresh token calls)
    -   `frontend/src/store/authStore.ts` (Extend for managing login state and JWTs)

### References

-   PRD: `docs/PRD.md` (FR-1.1, FR-6.1)
-   Epics: `docs/epics.md` (Story 1.3)
-   Tech Spec: `docs/sprint-artifacts/tech-spec-epic-1.md` (Authentication APIs, NFRs for Security/Performance)
-   Backend Architecture: `docs/architecture-backend.md` (Sections on JWT, bcrypt, API structure)
-   Frontend Architecture: `docs/architecture-frontend.md` (Sections on Authentication Flow, State Management)
-   Architecture Review: `docs/ARCHITECTURE-REVIEW.md` (Weak Password Policy, JWT Refresh Token Rotation, Rate Limiting)
-   UX Design Spec: `docs/ux-design-specification-COMPLETE.md` (Login UI components, accessibility)

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/1-3-user-login-session-management.context.xml`

<!-- Path(s) to story context XML will be added here by context workflow -->

### Completion Notes List

- Learnings from Previous Story (1.2): Story 1.3 builds upon the `User` model, repository, auth service, password utility, and frontend signup components established in Story 1.2. Specific details on reuse can be found in the "Project Structure Alignment and Lessons Learned" section above. [Source: `docs/sprint-artifacts/1-2-user-registration-account-creation.md`]

### File List

### Agent Model Used

## Change Log

- Initialized on 2025-11-24 by BIP.


gemini-1.5-flash
