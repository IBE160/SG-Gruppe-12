# ibe160 - Epic Breakdown

**Author:** Kaylee Floden
**Date:** lørdag 22. november 2025
**Project Level:** Medium to High
**Target Scale:** Global

---

## Overview

The comprehensive epic breakdown for the "AI CV and Application" platform, ibe160, has been successfully completed. The project has been decomposed into five distinct yet interconnected epics, each focused on delivering specific user value and aligned with the product's strategic objectives:

1.  **Platform Foundation & User Onboarding:** Establishes the core technical infrastructure, secure user authentication, and basic profile creation necessary for platform operation.
2.  **AI-Powered CV Data Management & Preview:** Empowers users with robust control over their CV data, including structured input, editing, dynamic preview, download functionality, autosave, and crucial versioning for data integrity.
3.  **Job Ad Analysis & Match Scoring:** Provides intelligent tools for users to analyze job descriptions, compare against their CVs, receive match scores, and pinpoint key strengths/areas for improvement. This epic also defines and enforces data schema contracts and versioning for AI prompt templates.
4.  **Tailored Application Generation:** Delivers the core AI-driven value proposition by generating highly customized CVs and cover letters, providing user review/editing capabilities, saving application history, and ensuring consistency in generated content. This epic also adheres to data schema contracts and prompt template versioning.
5.  **Trust & Data Governance (Cross-Cutting Concern):** Ensures the platform adheres to the highest standards of data security, user privacy (including full GDPR compliance with explicit consent management, data export/deletion, encryption, minimal logging), and ethical AI usage (sandboxing and bias mitigation). This epic's requirements are integrated as a cross-cutting concern throughout the development process.

The stories within each epic are vertically sliced, actionable, and follow a clear BDD format with well-defined prerequisites. The sequencing of epics supports incremental value delivery, beginning with foundational elements and progressing to advanced AI functionalities. All functional requirements from the Product Requirements Document (PRD) have been covered, and critical non-functional requirements related to security, privacy, and performance have been addressed both within dedicated stories and as cross-cutting considerations.

The epic breakdown provides a solid, actionable plan, ready to proceed into the architecture and detailed implementation phases.

## Proposed Epic Structure

The following epic structure is designed to incrementally build the AI CV and Application platform, focusing on delivering core user value and addressing critical functional and non-functional requirements. Each epic is named to reflect a clear business goal and user value, avoiding purely technical categorizations.

### 1. Epic: Platform Foundation & User Onboarding
**Value Statement:** Establish the core technical infrastructure, secure user authentication, and enable the initial user journey to input and store their essential CV data, forming the bedrock for all subsequent platform capabilities.

**High-Level Scope:**
*   Project setup, essential tooling, and initial deployment configuration.
*   Core backend and frontend application setup (Node.js/Express.js, React.js/Tailwind CSS).
*   Integration with PostgreSQL database (via Supabase) and ORM.
*   Implementation of secure user registration, login, and session management.
*   Development of a guided, step-by-step form for *basic profile creation (e.g., name, contact) to enable account setup*.
*   Basic data storage for raw CV information.

### 2. Epic: AI-Powered CV Data Management & Preview
**Value Statement:** Provide users with comprehensive control over their professional profile data and a real-time, accurate visual representation of their CV, fostering trust and clarity. This enables users to meticulously craft and refine their core professional story.

**High-Level Scope:**
*   Development of a structured internal data model for all CV components (e.g., work experience, education, skills, languages).
*   User interface and API for editing, reordering, and deleting any CV entry.
*   Implementation of a dynamic CV preview feature, allowing users to see changes instantly.
*   Support for selecting basic, ATS-friendly CV templates.
*   Functionality to download the current CV in standard formats (PDF, DOCX).
*   Implementation of autosave functionality and navigation warnings for unsaved changes.
*   Implementation of CV data versioning to track changes and enable rollback.
### 3. Epic: Job Ad Analysis & Match Scoring
**Value Statement:** Empower users by clearly interpreting job descriptions, identifying key requirements, and providing actionable insights into their alignment with a role, thus reducing guesswork and guiding their application strategy. This helps users quickly identify best-fit opportunities.

**High-Level Scope:**
*   User interface for pasting job description text.
*   Integration with Google Gemini 2.5 Flash (via Vercel AI SDK) for AI-powered extraction of keywords, required skills, and core responsibilities from job descriptions.
*   Algorithm to compare extracted job requirements against the user's structured CV data.
*   Calculation and display of a clear match score display.
*   Feature to highlight missing keywords, user strengths, and areas for improvement based on the job ad analysis.
*   Error handling and loading states for AI processing.
*   Definition and enforcement of data schema contracts for inputs (CV data, job descriptions) and outputs (extracted keywords, match scores).
*   Versioning of AI prompt templates used for extraction and analysis.

### 4. Epic: Tailored Application Generation
**Value Statement:** Deliver the platform's core promise by automatically crafting highly customized and optimized CVs and cover letters for specific job postings, significantly increasing application effectiveness and user confidence. This directly translates into higher interview rates.

**High-Level Scope:**
*   AI-driven generation of a tailored CV that rephrases and emphasizes relevant experience from the user's profile to align with the specific job ad.
*   AI-driven generation of a personalized cover letter that addresses the job's key requirements and the user's qualifications.
*   User interface for reviewing, accepting, rejecting, or editing every AI-generated suggestion before finalization.
*   Functionality to save a history of all tailored applications, including the job ad, tailored CV, and cover letter.
*   Robust handling of long AI processing times with clear feedback and retry mechanisms.
*   Adherence to defined data schema contracts for inputs (analyzed job data, CV data) and outputs (generated CV/cover letter content).
*   Versioning of AI prompt templates used for document generation.

### 5. Epic: Trust & Data Governance (Cross-Cutting Concern)
**Value Statement:** Ensure the platform operates with the highest standards of data security, user privacy, and legal compliance (specifically GDPR), building and maintaining unwavering user trust. This is foundational to the platform's viability.

**High-Level Scope:**
*   Comprehensive implementation of GDPR compliance features (explicit consent, data export, data correction, "right to be forgotten" for all user data).
*   Encryption of all user data (CVs, job applications, personal info) both in transit (HTTPS/TLS) and at rest (database, file storage).
*   Implementation of strong, role-based authentication and authorization for all API endpoints and sensitive data access.
*   Rigorous sandboxing of all external LLM calls to prevent personal data from being used for model training.
*   Implementation of minimal, auditable logging practices that avoid storing sensitive personal data.
*   Development of rate limiting and abuse protection for AI processing endpoints.
*   Mechanism for automatic deletion of raw job advertisement text after analysis due to potential copyright concerns.
*   **Clarification:** This epic focuses on the overarching framework, policies, and specialized features for security, privacy, and compliance. Specific security and compliance stories relevant to other functional areas will be integrated into those respective epics to ensure security is built-in, not bolted on.

### Suggested Sequencing

1.  **Platform Foundation & User Onboarding:** Essential for initial user engagement and core technical setup.
2.  **AI-Powered CV Data Management & Preview:** Builds upon onboarding by providing users with control over their profile.
3.  **Job Ad Analysis & Match Scoring:** Introduces the intelligence layer that informs tailoring.
4.  **Tailored Application Generation:** Delivers the primary value proposition, leveraging all previous steps.
5.  **Trust & Data Governance:** This epic primarily defines the overarching security and compliance framework and specialized features. Implementation of security and compliance requirements will be integrated into all other epics as a cross-cutting concern from their inception.

---

<!-- Repeat for each epic (N = 1, 2, 3...) -->

## Epic 1: Platform Foundation & User Onboarding

**Value Statement:** Establish the core technical infrastructure, secure user authentication, and enable the initial user journey to input and store their essential CV data, forming the bedrock for all subsequent platform capabilities.

### Story 1.1: Project Setup & Core Infrastructure Initialization (MVP)

As a developer,
I want to set up the project repository and core infrastructure,
So that I can begin developing the application (FR-1.1, FR-5.2).

**Acceptance Criteria:**

1.  **Given** a new project environment
2.  **When** I execute the setup script/commands
3.  **Then** The project repository is initialized with a standard structure (frontend, backend, docs, etc.)
4.  **And** Node.js and Express.js for backend are configured
5.  **And** React.js and Tailwind CSS for frontend are configured
6.  **And** Basic build and development scripts are in `package.json`
7.  **And** A local PostgreSQL database is integrated (e.g., via Supabase config)
8.  **And** A basic CI/CD pipeline configuration is in place (e.g., `.github/workflows/ci.yml` for linting/testing)

**Prerequisites:** None

**Technical Notes:** This story establishes the entire dev environment. It will involve creating `package.json` files, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js` for frontend, and `server.js`, `app.js`, `db.config.js` for backend.
**Covers FRs:** FR-1.1, FR-5.2

### Story 1.2: User Registration & Account Creation (MVP)

As a new user,
I want to create an account,
So that I can securely access the AI CV platform (FR-1.1, FR-6.1).

**Acceptance Criteria:**

1.  **Given** I am on the platform's registration page
2.  **When** I enter a unique email address and a strong password
3.  **Then** My account is successfully created and stored in the database
4.  **And** I receive a confirmation email to verify my account (or similar verification mechanism)
5.  **And** I am redirected to a login page or dashboard
6.  **And** Password hashing and salting are used for security

**Prerequisites:** Story 1.1

**Technical Notes:** Implement user model, registration API endpoint, and frontend registration form. Basic email service integration (or placeholder).
**Covers FRs:** FR-1.1, FR-6.1

### Story 1.3: User Login & Session Management (MVP)

As a registered user,
I want to log in and maintain a secure session,
So that I can access my CV data and application tools (FR-1.1, FR-6.1).

**Acceptance Criteria:**

1.  **Given** I am on the platform's login page
2.  **When** I enter my registered email and password
3.  **Then** I am successfully authenticated
4.  **And** A secure session is established (e.g., using JWT tokens)
5.  **And** I am redirected to my user dashboard
6.  **And** My session persists until I explicitly log out or the session expires
7.  **And** Invalid credentials result in an appropriate error message without revealing specific details (e.g., "Invalid email or password")

**Prerequisites:** Story 1.2

**Technical Notes:** Implement login API endpoint, frontend login form, JWT generation and validation, and secure cookie handling.
**Covers FRs:** FR-1.1, FR-6.1

### Story 1.4: Basic Profile Creation (Name & Contact Info) (MVP)

As a new user,
I want to quickly enter my name and contact information after logging in,
So that I can start building my professional profile (FR-2.1).

**Acceptance Criteria:**

1.  **Given** I am a newly registered and logged-in user
2.  **When** I navigate to the basic profile creation section
3.  **Then** I can input my first name, last name, email, and phone number
4.  **And** The entered information is saved and associated with my user account
5.  **And** I receive confirmation that my basic profile is updated

**Prerequisites:** Story 1.3

**Technical Notes:** Implement API endpoint for updating user profile, frontend form for basic details.
**Covers FRs:** FR-2.1

<!-- End story repeat -->

---

<!-- Repeat for each epic (N = 2, 3, 4, 5) -->

## Epic 2: AI-Powered CV Data Management & Preview

**Value Statement:** Provide users with comprehensive control over their professional profile data and a real-time, accurate visual representation of their CV, fostering trust and clarity. This enables users to meticulously craft and refine their core professional story.

### Story 2.1: Structured CV Data Model Design & Implementation (MVP)

As a developer,
I want a structured internal data model for CV components,
So that user professional information can be consistently stored and managed (FR-2.1, FR-3.3).

**Acceptance Criteria:**

1.  **Given** the diverse types of professional data (experience, education, skills)
2.  **When** the data model is designed and implemented
3.  **Then** It supports structured storage for work experience (company, title, dates, description), education (institution, degree, dates), skills, and languages.
4.  **And** The model allows for relationships between different CV sections (e.g., skills linked to experience).
5.  **And** It is robust enough to handle various international formats.

**Prerequisites:** Story 1.1 (Core Infrastructure)

**Technical Notes:** Define Mongoose/Sequelize schemas for Node.js backend. Design database tables in PostgreSQL.
**Covers FRs:** FR-2.1, FR-3.3, FR-3.5

### Story 2.2: User Interface for CV Section Editing (Work Experience) (MVP)

As a user,
I want to easily add, edit, and remove my work experience entries,
So that my CV accurately reflects my professional history (FR-2.1, FR-2.2, FR-5.2).

**Acceptance Criteria:**

1.  **Given** I am logged in and viewing my CV data management section
2.  **When** I navigate to the "Work Experience" section
3.  **Then** I can add a new work experience entry with fields for company, title, start date, end date, and description.
4.  **And** I can edit existing work experience entries.
5.  **And** I can delete work experience entries.
6.  **And** All changes are immediately reflected in a dynamic preview (if available).

**Prerequisites:** Story 2.1

**Technical Notes:** Develop React components for work experience form, implement API endpoints for CRUD operations on work experience.
**Covers FRs:** FR-2.1, FR-2.2, FR-5.2

### Story 2.3: User Interface for CV Section Editing (Education, Skills, Languages) (MVP)

As a user,
I want to manage my education, skills, and language entries,
So that my CV is complete and up-to-date (FR-2.1, FR-2.2, FR-5.2).

**Acceptance Criteria:**

1.  **Given** I am logged in and viewing my CV data management section
2.  **When** I navigate to the "Education," "Skills," or "Languages" sections
3.  **Then** I can add, edit, and delete entries for each category.
4.  **And** For education, fields include institution, degree, and dates.
5.  **And** For skills, I can add and remove individual skills.
6.  **And** For languages, I can specify the language and proficiency level.
7.  **And** All changes are immediately reflected in a dynamic preview (if available).

**Prerequisites:** Story 2.1

**Technical Notes:** Develop React components for education, skills, and language forms, implement API endpoints for CRUD operations.
**Covers FRs:** FR-2.1, FR-2.2, FR-5.2

### Story 2.4: Dynamic CV Preview & Template Selection (MVP)

As a user,
I want to see a live preview of my CV and choose from basic templates,
So that I can ensure its appearance is professional and suitable (FR-2.2, FR-2.3, FR-5.2).

**Acceptance Criteria:**

1.  **Given** I have entered CV data
2.  **When** I view the CV preview section
3.  **Then** A formatted, modern representation of my CV is displayed in real-time.
4.  **And** I can select from a few basic, ATS-friendly templates.
5.  **And** The preview updates immediately when I switch templates.

**Prerequisites:** Stories 2.2, 2.3

**Technical Notes:** Frontend rendering engine for CVs, use Tailwind CSS for styling templates.
**Covers FRs:** FR-2.2, FR-2.3, FR-5.2

### Story 2.5: CV Download Functionality (PDF/DOCX) (MVP)

As a user,
I want to download my generated CV in common formats (PDF, DOCX),
So that I can easily submit it to job applications (FR-2.2, FR-2.3).

**Acceptance Criteria:**

1.  **Given** I have a populated CV and a selected template in the preview
2.  **When** I click the "Download" button
3.  **Then** My CV is downloaded as a PDF file.
4.  **And** My CV is downloaded as a DOCX file.
5.  **And** The downloaded files accurately reflect the content and chosen template from the preview.

**Prerequisites:** Story 2.4

**Technical Notes:** Backend service for generating PDF (e.g., Puppeteer, html-pdf) and DOCX (e.g., docx) from HTML/structured data.
**Covers FRs:** FR-2.2, FR-2.3

### Story 2.6: Autosave & Unsaved Changes Warning (MVP)

As a user,
I want my CV data to be automatically saved and be warned about unsaved changes,
So that I don't accidentally lose my progress (FR-2.2).

**Acceptance Criteria:**

1.  **Given** I am editing any part of my CV
2.  **When** I make changes
3.  **Then** My changes are automatically saved periodically (e.g., every 30-60 seconds) without explicit action.
4.  **And** If I try to navigate away from an unsaved form, I receive a warning prompt.

**Prerequisites:** Stories 2.2, 2.3

**Technical Notes:** Implement frontend debouncing for auto-save, browser `beforeunload` event handler for warnings.
**Covers FRs:** FR-2.2

### Story 2.7: CV Data Versioning (MVP)

As a user,
I want my CV data to be versioned,
So that I can revert to previous states if needed (FR-2.1, FR-2.2).

**Acceptance Criteria:**

1.  **Given** I have made multiple changes to my CV over time
2.  **When** I view my CV history
3.  **Then** I can see a list of saved versions of my CV.
4.  **And** I can select a previous version to view or restore it as my current CV.

**Prerequisites:** Story 2.1 (data model support), Stories 2.2, 2.3 (data modification)

**Technical Notes:** Implement a versioning strategy in the database (e.g., storing deltas or full snapshots), API endpoints for listing and restoring versions.
**Covers FRs:** FR-2.1, FR-2.2

<!-- End story repeat -->

---

<!-- Repeat for each epic (N = 3, 4, 5) -->

## Epic 3: Job Ad Analysis & Match Scoring

**Value Statement:** Empower users by clearly interpreting job descriptions, identifying key requirements, and providing actionable insights into their alignment with a role, thus reducing guesswork and guiding their application strategy. This helps users quickly identify best-fit opportunities.

### Story 3.1: Job Description Input Interface (MVP)

As a user,
I want a simple interface to paste job description text,
So that the system can analyze it (FR-3.1, FR-5.2).

**Acceptance Criteria:**

1.  **Given** I am logged in and navigating to the job analysis section
2.  **When** I paste a job description into a designated text area
3.  **Then** The system accepts the input and indicates readiness for processing.
4.  **And** The interface provides clear instructions and examples of acceptable input.

**Prerequisites:** Epic 1 (login), Epic 2 (CV data management)

**Technical Notes:** Frontend text input component.
**Covers FRs:** FR-3.1, FR-5.2

### Story 3.2: AI-Powered Job Description Text Extraction (MVP)

As a user,
I want the system to intelligently extract key requirements and keywords from a job description,
So that I can understand what the employer is looking for (FR-3.1, FR-3.2).

**Acceptance Criteria:**

1.  **Given** I have provided a job description
2.  **When** I trigger the analysis (e.g., click "Analyze Job")
3.  **Then** The system uses Google Gemini 2.5 Flash via Vercel AI SDK to extract relevant keywords, skills, and responsibilities.
4.  **And** The extracted information is presented in a structured, readable format.
5.  **And** Error handling is in place for failed AI calls or invalid input.
6.  **And** AI prompt templates are versioned and used consistently.

**Prerequisites:** Story 3.1, Epic 1 (core infrastructure), Epic 5 (LLM security, prompt versioning)

**Technical Notes:** Backend API endpoint for AI analysis, integration with Vercel AI SDK, prompt engineering for Gemini 2.5 Flash, structured output (e.g., JSON).
**Covers FRs:** FR-3.1, FR-3.2

### Story 3.3: CV-Job Description Keyword Matching Algorithm (MVP)

As a user,
I want the system to compare my CV data against the extracted job requirements,
So that I can see how well I align with the role (FR-3.2, FR-3.3).

**Acceptance Criteria:**

1.  **Given** I have a populated CV and an analyzed job description
2.  **When** the matching algorithm runs
3.  **Then** The system identifies keywords and skills from my CV that match the job description.
4.  **And** It identifies keywords and skills from the job description that are missing from my CV.
5.  **And** The comparison respects the data schema contracts for both CV data and job analysis outputs.

**Prerequisites:** Story 2.1 (structured CV data), Story 3.2 (extracted job data)

**Technical Notes:** Backend service for keyword comparison, considering synonyms and semantic matches where appropriate.
**Covers FRs:** FR-3.2, FR-3.3

### Story 3.4: Match Score Calculation & Display (MVP)

As a user,
I want a clear match score and highlights of my strengths/weaknesses against a job description,
So that I can quickly assess my fit and areas for improvement (FR-3.3, FR-5.2).

**Acceptance Criteria:**

1.  **Given** A job description has been analyzed and compared to my CV
2.  **When** I view the match results
3.  **Then** A clear, honest match score (e.g., percentage or rating) is displayed.
4.  **And** The system highlights key strengths (matching keywords/skills).
5.  **And** The system highlights key weaknesses (missing keywords/skills) or areas for improvement.
6.  **And** The display is intuitive and easy to understand.

**Prerequisites:** Story 3.3

**Technical Notes:** Frontend UI for match score visualization, logic for weighting different matching criteria.
**Covers FRs:** FR-3.3, FR-5.2

### Story 3.5: Data Schema Contract Enforcement (Job Analysis Inputs/Outputs) (MVP)

As a developer,
I want clear data schema contracts for job analysis inputs and outputs,
So that data consistency is maintained across the pipeline (FR-3.2).

**Acceptance Criteria:**

1.  **Given** data is passed between the CV data, job description input, AI extraction, and matching components
2.  **When** data is processed
3.  **Then** All inputs conform to predefined schemas.
4.  **And** All outputs conform to predefined schemas.
5.  **And** Validation failures are logged and handled gracefully.

**Prerequisites:** Story 2.1 (CV data model), Story 3.2 (AI extraction)

**Technical Notes:** Use schema validation libraries (e.g., Joi, Zod) for API endpoints and internal data structures.
**Covers FRs:** FR-3.2

<!-- End story repeat -->

---

<!-- Repeat for each epic (N = 4, 5) -->

## Epic 4: Tailored Application Generation

**Value Statement:** Deliver the platform's core promise by automatically crafting highly customized and optimized CVs and cover letters for specific job postings, significantly increasing application effectiveness and user confidence. This directly translates into higher interview rates.

### Story 4.1: AI-Driven Tailored CV Generation (MVP)

As a user,
I want an AI-driven tailored CV that rephrases and emphasizes my relevant experience based on a specific job ad,
So that my application is highly targeted (FR-4.1).

**Acceptance Criteria:**

1.  **Given** I have a populated CV and an analyzed job description
2.  **When** I request to generate a tailored CV
3.  **Then** The system uses AI to adapt my CV content to align with the job ad's keywords and requirements.
4.  **And** The generated CV adheres to the defined data schema contracts for content.
5.  **And** The AI prompt templates used are versioned.
6.  **And** The generated CV’s narrative is designed to be consistent with the tone and focus expected for an accompanying cover letter.

**Prerequisites:** Epic 2 (populated CV), Epic 3 (analyzed job description)

**Technical Notes:** Integration with Google Gemini 2.5 Flash (or GPT-4 fallback) via Vercel AI SDK. Advanced prompt engineering to guide rephrasing and emphasis.
**Covers FRs:** FR-4.1

### Story 4.2: AI-Driven Personalized Cover Letter Generation (MVP)

As a user,
I want a personalized cover letter generated by AI that addresses the specific job requirements,
So that I can submit a complete and compelling application (FR-4.2).

**Acceptance Criteria:**

1.  **Given** I have a populated CV and an analyzed job description
2.  **When** I request to generate a personalized cover letter
3.  **Then** The system uses AI to create a cover letter that references my relevant qualifications and the job's requirements.
4.  **And** The generated cover letter adheres to the defined data schema contracts for content.
5.  **And** The AI prompt templates used are versioned.
6.  **And** The generated cover letter is consistent in its narrative and emphasis with the tailored CV.

**Prerequisites:** Epic 2 (populated CV), Epic 3 (analyzed job description)

**Technical Notes:** Similar AI integration as Story 4.1, but focusing on cover letter structure and tone.
**Covers FRs:** FR-4.2

### Story 4.3: User Review & Editing Interface for AI-Generated Content (MVP)

As a user,
I want to review and edit AI-generated CV and cover letter content,
So that I have full control and can ensure accuracy and personal voice (FR-4.1, FR-4.2, FR-5.2).

**Acceptance Criteria:**

1.  **Given** an AI-generated tailored CV or cover letter is presented
2.  **When** I view the generated content
3.  **Then** I can accept, reject, or edit individual sections or the entire document.
4.  **And** Changes I make are immediately reflected in the document.
5.  **And** I can toggle between original and AI-suggested text.

**Prerequisites:** Stories 4.1, 4.2

**Technical Notes:** Rich text editor component for frontend, API endpoints for saving edited content.
**Covers FRs:** FR-4.1, FR-4.2, FR-5.2

### Story 4.4: Save & Retrieve Tailored Application History (Growth)

As a user,
I want to save a history of my tailored applications,
So that I can revisit them or make minor adjustments for similar roles (FR-4.1, FR-4.2, FR-4.3).

**Acceptance Criteria:**

1.  **Given** I have generated and finalized a tailored CV and cover letter for a job
2.  **When** I confirm saving the application
3.  **Then** The tailored CV, cover letter, and the associated job description are saved as a historical application.
4.  **And** I can access a list of my past applications.
5.  **And** I can view the details of any saved historical application.

**Prerequisites:** Stories 4.1, 4.2, 4.3

**Technical Notes:** Database model for application history, API endpoints for saving and retrieving.
**Covers FRs:** FR-4.1, FR-4.2, FR-4.3

### Story 4.5: Robust AI Processing Feedback & Handling (MVP)

As a user,
I want clear feedback during long AI processing times and options to retry,
So that I understand the system's status and can recover from issues (FR-4.1, FR-4.2, FR-5.1).

**Acceptance Criteria:**

1.  **Given** I trigger an AI-driven generation process
2.  **When** the process is ongoing
3.  **Then** I see clear loading indicators (e.g., progress bar, skeleton states).
4.  **And** If the AI process fails or takes too long, I am given options to retry.
5.  **And** Error messages are user-friendly and actionable.

**Prerequisites:** Stories 4.1, 4.2

**Technical Notes:** Frontend UI for loading states, backend error handling and retry logic for AI calls.
**Covers FRs:** FR-4.1, FR-4.2, FR-5.1

<!-- End story repeat -->

---

<!-- Repeat for each epic (N = 5) -->

## Epic 5: Trust & Data Governance (Cross-Cutting Concern)

**Value Statement:** Ensure the platform operates with the highest standards of data security, user privacy, and legal compliance (specifically GDPR), building and maintaining unwavering user trust. This is foundational to the platform's viability.

### Story 5.1: GDPR Consent Management (MVP)

As a user,
I want clear and granular control over my data consent preferences, including how my data is processed by AI,
So that I can ensure my privacy is respected (FR-6.1).

**Acceptance Criteria:**

1.  **Given** I am a new user signing up
2.  **When** I complete the registration process
3.  **Then** I am presented with clear, easy-to-understand options for GDPR data processing consent, including specific consent for AI training.
4.  **And** My consent choices are securely stored and auditable.
5.  **And** I can easily review and modify my consent preferences at any time.

**Covers FRs:** FR-6.1
**Prerequisites:** Story 1.2 (User Registration)

**Technical Notes:** Implement a consent management platform (CMP) or custom consent UI/backend. Update user model to store consent flags.

### Story 5.2: Data Export & Deletion (Right to be Forgotten) (MVP)

As a user,
I want to easily export my personal data and permanently delete my account and all associated data,
So that I can exercise my right to data portability and deletion under GDPR (FR-6.1).

**Acceptance Criteria:**

1.  **Given** I am a logged-in user
2.  **When** I request a data export
3.  **Then** All my personal data (CVs, applications, profile info) is provided in a portable format (e.g., JSON, CSV).
4.  **And** When I request account deletion
5.  **Then** My account and all associated personal data are permanently removed from the system.
6.  **And** Confirmation is provided for both export and deletion requests.

**Covers FRs:** FR-6.1
**Prerequisites:** Epic 2 (CV data storage), Epic 4 (application history)

**Technical Notes:** API endpoints for data export/deletion. Ensure complete data purge across all linked systems.

### Story 5.3: Data Encryption (In Transit & At Rest) (MVP)

As a user,
I want assurance that all my sensitive personal data is encrypted both when being transferred and when stored,
So that my data is protected from unauthorized access (FR-6.1).

**Acceptance Criteria:**

1.  **Given** any data transfer between client and server, or between services
2.  **When** data is in transit
3.  **Then** It is encrypted using HTTPS/TLS.
4.  **And** When personal data is stored in the database or file system
5.  **Then** It is encrypted at rest using industry-standard encryption methods.
6.  **And** Data minimization principles are applied, ensuring only necessary personal data is collected and processed.

**Covers FRs:** FR-6.1
**Prerequisites:** Epic 1 (core infrastructure)

**Technical Notes:** Configure HTTPS/TLS for all API endpoints. Enable database encryption features (e.g., PostgreSQL TDE or disk encryption).

### Story 5.4: Role-Based Authentication & Authorization (MVP)

As a developer,
I want strong, role-based authentication and authorization mechanisms,
So that only authorized users can access sensitive data and functionality (FR-1.1, FR-6.1).

**Acceptance Criteria:**

1.  **Given** various API endpoints and sensitive data access points
2.  **When** a request is made
3.  **Then** The system verifies user authentication status.
4.  **And** The system verifies user authorization based on their role for the requested action/resource.
5.  **And** Unauthorized access attempts are rejected and logged.

**Covers FRs:** FR-1.1, FR-6.1
**Prerequisites:** Stories 1.2, 1.3 (authentication)

**Technical Notes:** Implement middleware for route protection. Define user roles and permissions.

### Story 5.5: Rigorous LLM Sandboxing & Data Minimization (MVP)

As a user,
I want strict guarantees that my personal data is never used for AI model training by third-party providers,
So that my privacy is fully protected when using AI features (FR-6.1).

**Acceptance Criteria:**

1.  **Given** an external LLM call is made
2.  **When** personal user data is involved
3.  **Then** The system ensures no personal data is persistently stored or used for model training by the LLM provider, and user consent is explicitly respected for any data processing involving AI.
4.  **And** Raw job advertisement text is only stored if absolutely necessary for analysis and is automatically deleted afterwards.

**Covers FRs:** FR-6.1
**Prerequisites:** Epic 3 (AI analysis), Epic 4 (AI generation)

**Technical Notes:** Configure LLM API calls to disable data retention/training. Implement short-lived storage for job ad text.

### Story 5.6: Minimal & Auditable Logging (MVP)

As a developer,
I want a logging system that records necessary events for auditing and debugging but minimizes the collection of personal data,
So that compliance requirements are met without compromising privacy (FR-6.1).

**Acceptance Criteria:**

1.  **Given** system events are logged
2.  **When** personal identifiable information (PII) could be logged
3.  **Then** PII is automatically redacted or excluded from logs.
4.  **And** Logs are auditable and retained according to policy.
5.  **And** Logs are stored securely.

**Covers FRs:** FR-6.1
**Prerequisites:** Epic 1 (core infrastructure)

**Technical Notes:** Implement a logging framework with PII redaction capabilities. Define log retention policies.

### Story 5.7: AI Fairness & Bias Mitigation (MVP)

As a user,
I want the AI outputs to be fair and unbiased, without amplifying biases related to protected characteristics,
So that my job applications are evaluated purely on merit (FR-6.1).

**Acceptance Criteria:**

1.  **Given** AI generates content (e.g., tailored CVs, cover letters, match scores)
2.  **When** the outputs are reviewed
3.  **Then** The system actively avoids biased phrasing or assumptions related to gender, ethnicity, disability, or age.
4.  **And** Mechanisms for regular evaluation of LLM outputs for bias are in place (e.g., through testing or human review).

**Covers FRs:** FR-6.1
**Prerequisites:** Epic 3 (AI analysis), Epic 4 (AI generation)

**Technical Notes:** Include bias detection in LLM output processing. Design evaluation metrics for AI fairness.

<!-- End story repeat -->

---


---

---

## Functional Requirements (FR) to Story Traceability Matrix

This matrix provides traceability from each Functional Requirement (FR) in the Product Requirements Document (`PRD.md`) to the specific stories in this `epics.md` document that address it.

| Functional Requirement (FR) | Description (Brief)                               | Epic(s) | Story(ies) Covered                                            |
| :-------------------------- | :------------------------------------------------ | :------ | :------------------------------------------------------------ |
| **FR-1.1**                  | Account Creation & Authentication                 | 1       | 1.1, 1.2, 1.3, 5.4                                            |
| **FR-2.1**                  | CV Data Intake                                    | 1, 2    | 1.4, 2.1, 2.2, 2.3, 2.7                                       |
| **FR-2.2**                  | CV Data Editing                                   | 2       | 2.2, 2.3, 2.4, 2.5, 2.6, 2.7                                  |
| **FR-2.3**                  | CV Generation & Download                          | 2       | 2.4, 2.5                                                      |
| **FR-3.1**                  | Job Description Input                             | 3       | 3.1, 3.2                                                      |
| **FR-3.2**                  | AI-Powered Keyword Extraction                     | 3       | 3.2, 3.3, 3.5                                                 |
| **FR-3.3**                  | CV-Job Match Score                                | 3       | 3.3, 3.4                                                      |
| **FR-4.1**                  | Tailored CV Generation                            | 4       | 4.1, 4.3, 4.4, 4.5                                            |
| **FR-4.2**                  | Tailored Cover Letter Generation                  | 4       | 4.2, 4.3, 4.4, 4.5                                            |
| **FR-4.3**                  | Application History                               | 4       | 4.4                                                           |
| **FR-5.1**                  | Immediate Feedback for Operations                 | 4       | 4.5                                                           |
| **FR-5.2**                  | Visually Clear Interface                          | 1, 2, 3, 4, 5 | 1.1, 2.2, 2.3, 2.4, 3.1, 3.4, 4.3, 5.1 (UI-related stories) |
| **FR-6.1**                  | Strict Data Privacy (GDPR, Export, Delete, Manage)| 5       | 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7                             |
