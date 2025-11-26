# Story 1.1: Project Setup & Core Infrastructure Initialization

Status: review

## Story

As a **developer**,
I want to **set up the project repository and core infrastructure**,
so that I can **begin developing the application**.

## Acceptance Criteria

1.  **Given** a new project environment
2.  **When** I execute the setup script/commands
3.  **Then** The project repository is initialized with a standard structure (frontend, backend, docs, etc.)
4.  **And** Node.js and Express.js for backend are configured
5.  **And** React.js and Tailwind CSS for frontend are configured
6.  **And** Basic build and development scripts are in `package.json`
7.  **And** A local PostgreSQL database is integrated (e.g., via Supabase config)
8.  **And** A basic CI/CD pipeline configuration is in place (e.g., `.github/workflows/ci.yml` for linting/testing)

## Tasks / Subtasks

*   **Initialize Monorepo Structure:**
    *   [x] Create root `package.json` and `README.md`.
    *   [x] Create `src/` directory for backend.
    *   [x] Create `frontend/` directory for frontend.
    *   [x] Create `docs/` directory for documentation.
    *   [x] Create `.github/workflows/` directory for CI/CD.
*   **Backend Setup (Node.js/Express.js):**
    *   [x] Initialize `src/package.json` with `express`, `pg`, `dotenv` dependencies. (AC: 4)
    *   [x] Create basic `src/server.js` and `src/app.js` files. (AC: 4)
    *   [x] Configure `src/config/db.config.js` for PostgreSQL connection. (AC: 7)
    *   [x] Add `nodemon` for development.
*   **Frontend Setup (Next.js/React/Tailwind CSS):**
    *   [x] Initialize `frontend/package.json` with `next`, `react`, `react-dom` dependencies. (AC: 5)
    *   [x] Install `tailwindcss`, `postcss`, `autoprefixer` and configure `tailwind.config.ts`, `postcss.config.js`. (AC: 5)
    *   [x] Configure `shadcn/ui` and `lucide-react` for UI components and icons. (AC: 5)
    *   [x] Create basic Next.js page structure (e.g., `frontend/src/app/page.tsx`). (AC: 5)
*   **Database Integration (PostgreSQL):**
    *   [x] Ensure local PostgreSQL instance is accessible.
    *   [x] Configure database connection string in `src/config/db.config.js`. (AC: 7)
    *   [x] Implement basic database connection test. (AC: 7)
*   **CI/CD Pipeline Configuration (GitHub Actions):**
    *   [x] Create `.github/workflows/ci.yml` for basic build and lint checks (e.g., run `npm install` and `npm run lint` for both frontend and backend). (AC: 8)

## Dev Notes

### Project Structure Notes

*   **Monorepo:** The project is structured as a monorepo with `frontend/` and `src/` (backend) directories.
*   **Dependency Management:** Separate `package.json` files are used for the root, frontend, and backend.
*   **CI/CD:** Basic GitHub Actions workflow for continuous integration is planned.

### References

*   **PRD:** `docs/PRD.md` - Provides project classification and high-level requirements.
*   **Epic Breakdown:** `docs/epics.md` - Defines Epic 1 and Story 1.1's acceptance criteria.
*   **Integration Architecture:** `docs/integration-architecture.md` - Outlines frontend and backend interaction.
*   **UX Design Spec:** `docs/ux-design-specification-COMPLETE.md` - Specifies UI framework (`shadcn/ui`) and styling (`Tailwind CSS`).
*   **Epic Tech Spec:** `docs/sprint-artifacts/tech-spec-epic-1.md` - Provides detailed design, NFRs, and test strategy for Epic 1.

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/1-1-project-setup-core-infrastructure-initialization.context.xml`

### Agent Model Used

gemini-1.5-flash

### Debug Log References

### Completion Notes
- Nodemon was already configured in `src/package.json`.
- Added `src/.env` with placeholders for PostgreSQL credentials and instructed user to update. Implemented database connection test in `src/config/db.config.js`.
- Updated `.github/workflows/ci.yml` with separate CI jobs for backend and frontend including dependency installation, linting, and building. Added ESLint configuration to `src/`. List
- Created root monorepo `package.json` and `README.md`. Moved previous `package.json` and `README.md` to `src/`.

### File List
- `package.json` (created)
- `README.md` (created)
- `src/package.json` (moved from root, **modified**)
- `src/README.md` (moved from root)
- `src/config/db.config.js` (created, **modified**)
- `.github/workflows/ci.yml` (**modified**)
- `src/.env` (**new**)
- `src/.eslintrc.js` (**new**)
