# Epic Technical Specification: Platform Foundation & User Onboarding

Date: lørdag 22. november 2025
Author: Kaylee Floden
Epic ID: 1
Status: Draft

---

## Overview

This Epic focuses on establishing the core technical foundation and the initial user onboarding experience for the "AI CV and Application" platform. It encompasses setting up the project infrastructure, implementing secure user authentication (registration, login, session management), and enabling basic user profile creation. This foundational work is critical as it provides the necessary bedrock for all subsequent platform capabilities, ensuring users can securely access and begin interacting with the system.

## Objectives and Scope

**In-Scope:**
- Project repository setup and core infrastructure initialization (backend with Node.js/Express.js, frontend with React.js/Tailwind CSS, PostgreSQL database).
- Secure user registration, login, and session management.
- Basic user profile creation (name, contact information).

**Out-of-Scope (for this Epic):**
- Detailed CV data management beyond basic profile information.
- AI-powered features (parsing, matching, generation).
- Complex UI/UX elements beyond core authentication and profile input forms.
- Advanced security features (e.g., MFA, role-based access control beyond basic user/admin separation).

## System Architecture Alignment

This epic aligns directly with the overall "Integration Architecture" by establishing the core `frontend` and `src` (backend) components. It defines the initial REST API endpoints for user authentication and basic profile management, laying the groundwork for future API consumption by the frontend. The choice of Node.js/Express.js for the backend and React.js/Tailwind CSS for the frontend directly supports the modular and scalable architecture. The PostgreSQL database integration is central to storing user and profile data, as outlined in the general data management principles.

## Detailed Design

### Services and Modules

*   **User Authentication Service (Backend):** Manages user registration, login, and session tokens (JWT).
*   **User Profile Service (Backend):** Handles creation and retrieval of basic user profile information.
*   **Frontend Application Module (Frontend):** Provides the user interface for registration, login, and basic profile creation forms.
*   **Database Module (PostgreSQL):** Responsible for persistent storage of user accounts and profile data.

### Data Models and Contracts

**User Model (PostgreSQL Table):**
*   `id`: UUID (Primary Key, auto-generated)
*   `email`: VARCHAR(255) (Unique, Indexed, NOT NULL)
*   `passwordHash`: VARCHAR(255) (NOT NULL)
*   `salt`: VARCHAR(255) (NOT NULL)
*   `firstName`: VARCHAR(100) (NULLABLE)
*   `lastName`: VARCHAR(100) (NULLABLE)
*   `phoneNumber`: VARCHAR(20) (NULLABLE)
*   `createdAt`: TIMESTAMP (NOT NULL, default CURRENT_TIMESTAMP)
*   `updatedAt`: TIMESTAMP (NOT NULL, default CURRENT_TIMESTAMP, on update CURRENT_TIMESTAMP)
*   `emailVerified`: BOOLEAN (Default: false)
*   `emailVerificationToken`: VARCHAR(255) (NULLABLE)
*   `passwordResetToken`: VARCHAR(255) (NULLABLE)

### APIs and Interfaces

**Authentication API (`/api/auth`):**
*   `POST /api/auth/register`: User registration.
    *   **Request:** `JSON { email: string, password: string }`
    *   **Response (201 Created):** `JSON { message: "User registered successfully", userId: uuid }`
    *   **Error (409 Conflict):** `JSON { message: "Email already registered" }`
*   `POST /api/auth/login`: User login.
    *   **Request:** `JSON { email: string, password: string }`
    *   **Response (200 OK):** `JSON { token: "jwt_token_string", userId: uuid }`
    *   **Error (401 Unauthorized):** `JSON { message: "Invalid credentials" }`
*   `GET /api/auth/verify-session`: Verify JWT token and return user identity.
    *   **Request:** `Header: Authorization: Bearer <jwt_token>`
    *   **Response (200 OK):** `JSON { userId: uuid, email: string }`
    *   **Error (401 Unauthorized):** `JSON { message: "Invalid or expired token" }`

**User Profile API (`/api/profile`):**
*   `POST /api/profile`: Create or update basic user profile information.
    *   **Request:** `Header: Authorization: Bearer <jwt_token>`, `JSON { firstName?: string, lastName?: string, phoneNumber?: string }`
    *   **Response (200 OK):** `JSON { message: "Profile updated successfully", profile: { firstName, lastName, phoneNumber } }`
    *   **Error (401 Unauthorized):** `JSON { message: "Unauthorized" }`
*   `GET /api/profile`: Retrieve authenticated user's basic profile information.
    *   **Request:** `Header: Authorization: Bearer <jwt_token>`
    *   **Response (200 OK):** `JSON { firstName: string, lastName: string, email: string, phoneNumber: string }`
    *   **Error (401 Unauthorized):** `JSON { message: "Unauthorized" }`

### Workflows and Sequencing

1.  **Initial Project Setup (Story 1.1):**
    *   Developer sets up the monorepo structure, configures Node.js/Express.js backend and React.js/Tailwind CSS frontend, and integrates a PostgreSQL database. Basic CI/CD pipelines are established.
2.  **User Registration Flow (Story 1.2):**
    *   User accesses the registration page via the frontend application.
    *   Frontend sends `email` and `password` to the `POST /api/auth/register` endpoint.
    *   Backend hashes the password, stores the new user record in the PostgreSQL database, and may initiate an email verification process (MVP can use placeholder).
    *   Upon successful registration, the user is typically redirected to the login page or a confirmation screen.
3.  **User Login and Session Management Flow (Story 1.3):**
    *   User accesses the login page via the frontend.
    *   Frontend sends `email` and `password` to the `POST /api/auth/login` endpoint.
    *   Backend verifies credentials, generates a JSON Web Token (JWT), and returns it to the frontend.
    *   Frontend securely stores the JWT (e.g., in an HTTP-only cookie or local storage) and redirects the user to their dashboard.
    *   For subsequent authenticated requests, the frontend includes the JWT in the `Authorization` header.
4.  **Basic Profile Creation (Story 1.4):**
    *   A logged-in user navigates to the basic profile creation section on the frontend.
    *   The frontend displays a form allowing the user to input their `firstName`, `lastName`, and `phoneNumber`.
    *   The frontend sends this data to the `POST /api/profile` endpoint, authenticated with the user's JWT.
    *   The backend validates the input and updates the corresponding user record in the PostgreSQL database.
    *   The frontend confirms the successful update to the user.

## Non-Functional Requirements

### Performance

*   **User Registration/Login Latency:** API responses for user registration and login must be < 500ms under normal load (up to 100 concurrent users).
*   **Session Verification:** Session verification (e.g., `GET /api/auth/verify-session`) must be < 100ms.
*   **Profile Update Latency:** Basic profile updates must be < 300ms.

### Security

*   **Password Storage:** Passwords must be hashed and salted using a strong, industry-standard algorithm (e.g., bcrypt) before storage.
*   **Session Management:** Secure, HTTP-only, and signed JWT tokens with appropriate expiry. Implement revocation mechanism for compromised tokens.
*   **Input Validation:** All API endpoints must perform strict server-side input validation to prevent injection attacks (e.g., SQL injection, XSS).
*   **Data Encryption:** User credentials (email, password hash, salt) and basic profile data must be encrypted at rest in the database. All communication must use HTTPS/TLS.
*   **Account Lockout:** Implement a strategy to prevent brute-force attacks (e.g., temporary account lockout after multiple failed login attempts).

### Reliability/Availability

*   **Uptime:** Authentication and core user profile services (backend) must maintain 99.9% uptime.
*   **Error Handling:** Graceful error handling for API failures and network issues, providing user-friendly feedback.
*   **Database Resilience:** Database should be configured for high availability (e.g., replication, backups) to prevent data loss and ensure service continuity.

### Observability

*   **Authentication Logging:** Log all successful and failed login attempts with timestamp, IP address, and user ID (if available).
*   **API Request Logging:** Log API requests (excluding sensitive data) for monitoring and debugging.
*   **Error Logging:** Centralized error logging and alerting for all backend services.
*   **Metrics:** Basic metrics for API response times, error rates, and user counts.

## Dependencies and Integrations

### Dependencies and Integrations

**Backend (src/):**
*   **Runtime:** Node.js
*   **Web Framework:** Express.js (`express: ^4.18.2`)
*   **Database:** PostgreSQL (`pg: ^8.16.3`)
*   **Environment Variables:** `dotenv: ^16.0.3`
*   **Development:** `nodemon: ^2.0.22` (for auto-restarts)

**Frontend (frontend/):**
*   **Framework:** Next.js (`next: ^14.2.0`)
*   **UI Library:** React (`react: ^18.3.0`, `react-dom: ^18.3.0`)
*   **Styling:** Tailwind CSS (`tailwindcss: ^3.4.1`, `postcss: ^8.4.38`, `autoprefixer: ^10.4.19`, `tailwindcss-animate: ^1.0.7`)
*   **UI Components:** `shadcn/ui` primitives built on Radix UI (`@radix-ui/*` packages like `react-accordion`, `react-dialog`, `react-label`, etc.)
*   **Icons:** Lucide React (`lucide-react: ^0.365.0`)
*   **Utilities:** `class-variance-authority: ^0.7.0`, `clsx: ^2.1.0`, `tailwind-merge: ^2.2.2`
*   **Type Checking:** TypeScript (`typescript: ^5.4.3`)

**Other Tools/Platforms:**
*   **Version Control:** Git
*   **CI/CD:** GitHub Actions (for automated builds and tests, as per Story 1.1)

**Integration Points:**
*   **Backend ↔ Database:** Direct connection using `pg` (or ORM like Sequelize/Mongoose).
*   **Frontend ↔ Backend API:** RESTful API calls over HTTPS for authentication, session management, and basic user profile operations.
*   **External Services (Future/Implied):**
    *   Email service (e.g., SendGrid, Nodemailer) for account verification and password resets (placeholder, actual integration details deferred to dedicated stories/epics).
    *   AI service (e.g., Google Gemini 2.5 Flash) - specific integration details for Epic 1 are limited to foundational security considerations, not direct use.

## Acceptance Criteria (Authoritative)

### Story 1.1: Project Setup & Core Infrastructure Initialization (MVP)
1.  **Given** a new project environment
2.  **When** I execute the setup script/commands
3.  **Then** The project repository is initialized with a standard structure (frontend, backend, docs, etc.)
4.  **And** Node.js and Express.js for backend are configured
5.  **And** React.js and Tailwind CSS for frontend are configured
6.  **And** Basic build and development scripts are in `package.json`
7.  **And** A local PostgreSQL database is integrated (e.g., via Supabase config)
8.  **And** A basic CI/CD pipeline configuration is in place (e.g., `.github/workflows/ci.yml` for linting/testing)

### Story 1.2: User Registration & Account Creation (MVP)
1.  **Given** I am on the platform's registration page
2.  **When** I enter a unique email address and a strong password
3.  **Then** My account is successfully created and stored in the database
4.  **And** I receive a confirmation email to verify my account (or similar verification mechanism)
5.  **And** I am redirected to a login page or dashboard
6.  **And** Password hashing and salting are used for security

### Story 1.3: User Login & Session Management (MVP)
1.  **Given** I am on the platform's login page
2.  **When** I enter my registered email and password
3.  **Then** I am successfully authenticated
4.  **And** A secure session is established (e.g., using JWT tokens)
5.  **And** I am redirected to my user dashboard
6.  **And** My session persists until I explicitly log out or the session expires
7.  **And** Invalid credentials result in an appropriate error message without revealing specific details (e.g., "Invalid email or password")

### Story 1.4: Basic Profile Creation (Name & Contact Info) (MVP)
1.  **Given** I am a newly registered and logged-in user
2.  **When** I navigate to the basic profile creation section
3.  **Then** I can input my first name, last name, email, and phone number
4.  **And** The entered information is saved and associated with my user account
5.  **And** I receive confirmation that my basic profile is updated

## Traceability Mapping

| Acceptance Criterion (AC) | Tech Spec Section(s) | Component(s)/API(s) | Test Idea |
|---|---|---|---|
| **Story 1.1 (Setup)** | Detailed Design (Services/Modules, Data Models, APIs), Dependencies | All components | Verify project structure, `package.json` scripts, DB connection, CI config. |
| **Story 1.2 (Registration)** | Detailed Design (Data Models, APIs), NFRs (Security) | Auth API (`POST /api/auth/register`), User Model, Frontend UI | Test successful registration, email verification (if implemented), password hashing, error for duplicate email. |
| **Story 1.3 (Login)** | Detailed Design (Data Models, APIs), NFRs (Security, Performance) | Auth API (`POST /api/auth/login`), User Model, Frontend UI | Test successful login, JWT generation/validation, session persistence, error for invalid credentials, logout functionality. |
| **Story 1.4 (Profile)** | Detailed Design (Data Models, APIs) | User Profile API (`POST /api/profile`), User Model, Frontend UI | Test creation/update of profile fields, association with user account, data persistence. |

## Risks, Assumptions, Open Questions

**Risks:**
*   **Security Vulnerabilities:** Imperfect implementation of authentication and authorization could lead to data breaches.
    *   **Mitigation:** Utilize established, well-vetted libraries (e.g., bcrypt for hashing, jsonwebtoken for JWTs), adhere to security best practices, conduct thorough code reviews, and consider automated security scanning.
*   **Scalability Issues:** Initial database schema or API design might not scale efficiently with a large user base, leading to performance degradation in authentication or profile services.
    *   **Mitigation:** Plan for database indexing on frequently queried fields (e.g., `email`), perform early load testing on critical paths, and optimize database queries.
*   **Email Delivery Failures:** If email verification for registration or password reset is critical for the MVP, the reliability of the email service is a risk.
    *   **Mitigation:** Select a robust email service provider and implement retry mechanisms for sending emails.

**Assumptions:**
*   **Team Proficiency:** The development team possesses sufficient expertise in Node.js/Express.js, React.js/Next.js, Tailwind CSS, and PostgreSQL.
*   **JWT Implementation:** JWTs will be implemented securely, including proper key management, short expiry times for access tokens, and potentially refresh tokens for extended sessions (strategy to be defined).
*   **CI/CD Foundation:** The basic CI/CD pipeline set up in Story 1.1 provides a sufficient foundation and will be extended as development progresses.

**Open Questions:**
*   What is the chosen strategy for email verification (e.g., link-based confirmation, code-based)?
*   What is the exact JWT refresh token strategy and how will token revocation be handled?
*   Will user account deletion initially be a soft delete (marking as inactive) or a hard delete (permanent removal)?

## Test Strategy Summary

*   **Unit Tests:**
    *   **Backend:** Develop unit tests for authentication logic (registration, login, password hashing), JWT generation/validation, and basic user profile CRUD operations. Focus on individual function and API route handlers.
    *   **Frontend:** Create unit tests for React components related to registration, login, and basic profile forms to ensure correct rendering, state management, and event handling.
*   **Integration Tests:**
    *   **Backend API:** Implement integration tests to verify the interaction between API endpoints and the PostgreSQL database (e.g., successful user registration persists data, login authenticates against stored credentials).
    *   **Frontend-Backend:** Develop tests to validate the full flow from user interaction in the UI to successful API calls and data persistence (e.g., submitting a registration form results in a new user entry in the database).
*   **End-to-End (E2E) Tests:**
    *   Utilize a framework like Playwright or Cypress to simulate complete user journeys, such as: user navigates to registration, signs up, logs in, and updates their basic profile information.
*   **Security Tests:**
    *   Conduct basic penetration testing (manual or automated using tools like OWASP ZAP) to identify common vulnerabilities like SQL injection, XSS, and broken authentication.
    *   Perform brute-force attack simulations on login and registration endpoints to test account lockout mechanisms.
*   **Performance Tests:**
    *   Execute basic load tests on authentication and profile APIs to ensure they meet the defined latency requirements under expected user concurrency.
*   **Accessibility Tests:**
    *   Automated accessibility checks (e.g., Lighthouse, axe DevTools) will be integrated into the CI pipeline for frontend components.
    *   Manual accessibility testing will be performed for registration, login, and profile forms to confirm WCAG 2.1 AA compliance (e.g., keyboard navigation, screen reader compatibility).
