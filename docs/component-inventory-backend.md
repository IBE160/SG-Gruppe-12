# Backend Component Inventory

This document provides an inventory of the key components within the `src` (backend) part of the "AI CV and Application" project. The backend is built with Node.js, Express.js, and TypeScript, following a layered architectural style.

## Core Architectural Layers

### Routes (`src/routes/`)
- **Description:** Defines the API endpoints and maps them to controller functions.
- **Key Files for Story 3-1:**
    - `job.routes.ts`: Defines the `POST /api/v1/jobs/analyze` endpoint.

### Controllers (`src/controllers/`)
- **Description:** Handles incoming HTTP requests, validates input (via middleware), extracts user context, calls appropriate service layer functions, and formats responses.
- **Key Files for Story 3-1:**
    - `job.controller.ts`: Handles the logic for the `POST /api/v1/jobs/analyze` endpoint.

### Services (`src/services/`)
- **Description:** Contains the core business logic, orchestrates calls to repositories and external services (like AI providers), and handles domain-specific errors.
- **Key Files for Story 3-1:**
    - `job-analysis.service.ts`: Implements the AI-powered job description analysis, keyword extraction, and potentially caching logic.

### Repositories (`src/repositories/`)
- **Description:** Abstracts database queries, using Prisma Client to interact with the PostgreSQL database.
- **Key Files (General):** (No direct repository changes for Story 3-1 initial input, but underlying data storage for job postings will be handled here in subsequent stories)

### Middleware (`src/middleware/`)
- **Description:** Intercepts requests and responses for cross-cutting concerns like authentication, validation, error handling, and rate limiting.
- **Key Files for Story 3-1:**
    - `validate.middleware.ts`: Used to apply Zod schema validation.
    - `rate-limit.middleware.ts`: Specifically the `aiLimiter` to protect AI-intensive endpoints.

### Validators (`src/validators/`)
- **Description:** Contains Zod schemas for validating incoming request data (body, query, params).
- **Key Files for Story 3-1:**
    - `job.validator.ts`: Defines the Zod schema for validating job description input.

### Prompts (`src/prompts/`)
- **Description:** Manages versioned prompt templates for AI models, ensuring consistent and reproducible AI interactions.
- **Key Files for Story 3-1:**
    - `job-extraction.prompt.ts`: Contains the prompt template used by the AI service to extract information from job descriptions.
