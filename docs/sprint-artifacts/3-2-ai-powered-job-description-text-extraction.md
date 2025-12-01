# Story 3.2: AI-Powered Job Description Text Extraction

Status: ready-for-dev

## Story

As a system,
I want to accurately extract key information (skills, competencies, responsibilities) from raw job descriptions using AI,
so that it can be used for matching.

## Acceptance Criteria

### Functional Acceptance Criteria

*   **AC-1:** The backend API endpoint (`POST /api/job/analyze`) *must* successfully accept a job description as a string in the request body.
*   **AC-2:** The AI service (e.g., Gemini) *must* process the provided job description and extract key skills, competencies, and responsibilities.
*   **AC-3:** The extracted information *must* be returned in a structured JSON format, as defined by the `Prompt Contract` in the Epic 3 Tech Spec.
*   **AC-4:** Error handling *must* be implemented for LLM failures or invalid/unexpected responses (e.g., non-JSON output), gracefully informing the caller.
*   **AC-5:** The response time for job description text extraction *must* be within NFRs (under 5 seconds for non-cached requests).

### Non-Functional Acceptance Criteria

*   **AC-NF1 (Performance):** For non-cached requests, the total response time for extraction must be under 5 seconds.
*   **AC-NF2 (Reliability):** Error handling for LLM communication and response parsing must be robust.
*   **AC-NF3 (Security/Privacy):** Raw job description text will not be stored indefinitely and will be handled in compliance with GDPR.

## Tasks / Subtasks

### Backend Development Tasks

**Task 1: Implement `KeywordExtractionService`** [x]
- [x] Subtask 1.1: Create `src/services/KeywordExtractionService.ts` to encapsulate LLM interaction.
- [x] Subtask 1.2: Implement prompt formatting logic within `KeywordExtractionService` using `prompts/job-extraction.prompt.ts`.
- [x] Subtask 1.3: Integrate with Vercel AI SDK to call Google Gemini 2.5 Flash for text extraction.
- [x] Subtask 1.4: Implement robust JSON response validation using Zod schemas for the LLM output.
- [x] Subtask 1.5: Implement error handling within the service for LLM API failures, timeouts, or malformed responses.
- [x] Subtask 1.6: Configure LLM provider API key and model selection in `src/config/ai-providers.ts`.

**Task 2: Update `JobAnalysisController` and `JobAnalysisService`** [x]
- [x] Subtask 2.1: Modify `src/controllers/job.controller.ts` to expose `POST /api/job/analyze` endpoint.
- [x] Subtask 2.2: Update `JobAnalysisController` to call `JobAnalysisService` for orchestrating the analysis.
- [x] Subtask 2.3: Modify `src/services/JobAnalysisService.ts` to integrate `KeywordExtractionService` for keyword extraction.
- [x] Subtask 2.4: Ensure `JobAnalysisService` passes the job description from the API request to the `KeywordExtractionService`.

**Task 3: Implement Caching for LLM Responses** [x]
- [x] Subtask 3.1: Integrate `CacheService` (using Redis) within `JobAnalysisService` to cache `KeywordExtractionService` results.
- [x] Subtask 3.2: Define cache key generation based on `hash(jobDescription)` (as per Tech Spec recommendation).
- [x] Subtask 3.3: Implement cache invalidation/TTL for cached job analyses (e.g., 7 days).

**Task 4: Input Validation** [x]
- [x] Subtask 4.1: Create `src/validators/job.validator.ts` with Zod schema for `POST /api/job/analyze` request body (`jobDescription`, `cvId`).
- [x] Subtask 4.2: Apply the validation middleware (`validate.middleware.ts`) to the `POST /api/job/analyze` route.

### Testing Tasks

**Task 5: Unit Tests (`Jest`)** [x]
- [x] Subtask 5.1: Write unit tests for `KeywordExtractionService` to verify prompt formatting and LLM response parsing (mocking LLM API calls).
- [x] Subtask 5.2: Write unit tests for the Zod schemas in `job.validator.ts`.

**Task 6: Integration Tests (`Supertest`)** [x]
- [x] Subtask 6.1: Write integration tests for `POST /api/job/analyze` endpoint.
- [x] Subtask 6.2: **TC-01:** Verify the successful extraction path with a valid job description (asserting structured JSON output).
- [x] Subtask 6.3: **TC-03:** Verify error handling for invalid or missing `jobDescription` (400 response).
- [x] Subtask 6.4: **TC-04:** Verify performance for non-cached requests meets the <5s NFR.
- [x] Subtask 6.5: **TC-05:** Verify caching mechanism: subsequent calls for the same job description return from cache (faster response).

**Task 7: Security & NFR Verification** [x]
- [x] Subtask 7.1: Verify that raw job descriptions are not stored indefinitely post-analysis.
- [x] Subtask 7.2: Confirm that rate limiting middleware is applied to the LLM endpoint.

## Dev Notes

### Requirements Context Summary

**Epic:** Epic 3: Job Ad Analysis & Match Scoring
**Epic Goal:** Empower users to interpret job descriptions, assess their alignment with roles, and identify missing keywords through AI-driven analysis.

**Story 3.2:** AI-Powered Job Description Text Extraction (Backend)
**User Story Statement:** As a system, I want to accurately extract key information (skills, competencies, responsibilities) from raw job descriptions using AI, so that it can be used for matching.

**Key Requirements (from Epics.md):**
- Backend API endpoint (`POST /api/job/analyze`) accepts a job description.
- AI service (e.g., Gemini) processes the job description.
- Key skills, competencies, and responsibilities are extracted into a structured JSON format.
- Error handling for LLM failures or invalid responses is implemented.
- Response time for extraction is within NFRs (under 5 seconds for non-cached requests).

**Relevant Technical Specification Details (from tech-spec-epic-3.md):**
- **API Design:** `POST /api/job/analyze` expects `jobDescription` (string) and `cvId` (string). Response includes `rawKeywords`.
- **Backend Service Design:**
    - `JobAnalysisController` will handle the request.
    - `JobAnalysisService` will orchestrate the flow, including caching.
    - `KeywordExtractionService` is specifically responsible for LLM communication, prompt formatting, and JSON response validation.
- **Data Models:** `JobAnalysisInput` interface includes `jobDescription`. `JobAnalysisResult` includes `rawKeywords`.
- **Prompt Contract (LLM):** Specifies structured JSON output for keywords.
- **Caching Strategy:** Results should be cached based on `hash(jobDescription + ":" + cvId)`.
- **Non-Functional Requirements:** Total response time target under 5 seconds for non-cached requests.
- **Traceability:** Mapped to PRD Req. FR-3.2 (AI-Powered Keyword Extraction).
- **Risks:** LLM inconsistency, LLM latency affecting performance.

**Architectural Context (from architecture-backend.md and architecture-frontend.md):**
- **Backend Stack:** Node.js v20.x, Express.js 4.x, TypeScript 5.3+, Zod 3.22+, Prisma 5.x, JWT.
- **AI Integration:** Vercel AI SDK 3.x with Google Gemini 2.5 Flash as primary LLM. Fallbacks to GPT-4/Claude.
- **Middleware:** Zod for validation, error handling middleware for graceful failures.
- **Services Layer:** Clear separation of concerns for `job-analysis.service.ts`, `parsing.service.ts`.
- **Prompt Versioning:** `prompts/job-extraction.prompt.ts` for managing LLM prompts.
- **Performance:** Aggressive caching strategy with Upstash Redis for AI endpoints. Rate limiting in place.
- **Security:** GDPR compliance (no long-term storage of raw job descriptions).

**Summary of Story Focus:**
This story focuses on the backend implementation of taking a raw job description, sending it to the configured LLM provider (primarily Gemini via Vercel AI SDK), extracting key skills/competencies/responsibilities in a structured format, and handling the initial response validation and error conditions. It leverages the defined `KeywordExtractionService` and is crucial for feeding data into subsequent matching and scoring logic. Caching will be a critical part of its implementation to manage performance and cost.

### Project Structure Notes

**Previous Story Learnings:** No previous story learnings to incorporate as the preceding story (3.1) is currently in `review` status, not `done`. This implies there are no validated patterns, new services, or architectural decisions from a completed predecessor to directly reuse or learn from for this story.

**Project Structure Alignment:**

Based on the `Backend Architecture Specification` and `Source Tree Analysis`, this story's implementation will adhere to the following structural conventions:

-   **Service Layer (`src/services/`):** The core logic for keyword extraction and LLM interaction will reside within a dedicated service, likely `KeywordExtractionService` as identified in the `Epic 3 Tech Spec`. This service will be responsible for prompt formatting, LLM API calls, and initial response validation.
-   **Controllers Layer (`src/controllers/`):** The `JobAnalysisController` will handle the API endpoint, orchestrating calls to the `JobAnalysisService`, which in turn will utilize the `KeywordExtractionService`.
-   **Validators Layer (`src/validators/`):** Zod schemas will be used for validating both input (`jobDescription`) and output (LLM's JSON response).
-   **Prompts Layer (`src/prompts/`):** Versioned LLM prompts for keyword extraction will be stored here, e.g., `prompts/job-extraction.prompt.ts`.
-   **Configuration (`src/config/`):** LLM provider details (Gemini API key, model names) will be configured in `src/config/ai-providers.ts`. Redis for caching will be configured in `src/config/redis.ts`.
-   **Middleware Layer (`src/middleware/`):** Input validation will be handled by `validate.middleware.ts`. Rate limiting (`rate-limit.middleware.ts`) will be applied to protect the LLM endpoints.
-   **Utils Layer (`src/utils/`):** Custom error classes (`errors.util.ts`) will be used for robust error handling.
-   **Testing:** Unit tests for `KeywordExtractionService` (mocking LLM calls) and integration tests for the API endpoint will be placed in `src/tests/unit/` and `src/tests/integration/` respectively.

**Key Alignment Points:**

-   **Modularity:** The implementation will follow the layered architecture, ensuring separation of concerns.
-   **Type Safety:** Leveraging TypeScript and Zod for strict type checking and runtime validation across all layers.
-   **Configurability:** LLM provider and caching settings will be externalized in `config` files.
-   **Observability:** Errors and LLM performance will be logged as per the `Logging Strategy` in the Backend Architecture.

This story will primarily introduce new files within the `services`, `prompts`, and `validators` directories, along with modifications to `controllers` and `routes` to integrate the new functionality. Existing authentication and error handling middleware will be reused.

### References

- [Source: docs/epics.md]
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#API-Design]
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Backend-Service-Design]
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Non-Functional-Requirements]
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Risks-and-Mitigations]
- [Source: docs/architecture-backend.md]
- [Source: docs/architecture-frontend.md]
- [Source: docs/ARCHITECTURE-REVIEW.md]
- [Source: docs/architecture-src.md]
- [Source: docs/integration-architecture.md]
- [Source: docs/PRD.md]
- [Source: docs/ux-design-specification-COMPLETE.md]
- [Source: docs/ux-application-history.md]
- [Source: docs/ux-gdpr-screens.md]
- [Source: docs/ux-mobile-and-error-states.md]
- [Source: docs/UX-PRD-EPIC-ALIGNMENT-RESOLUTION.md]
- [Source: README.md]
- [Source: frontend/README.md]

## Dev Agent Record

### Context Reference

- C:\Users\kayle\Desktop\SG-Gruppe-12/docs/sprint-artifacts/3-2-ai-powered-job-description-text-extraction.context.xml

### Agent Model Used

gemini-1.5-flash-latest

### Debug Log References

- **Subtask 1.1: Create `src/services/KeywordExtractionService.ts` to encapsulate LLM interaction.**
    - Plan:
        1. Create the file `src/services/KeywordExtractionService.ts`.
        2. Define `KeywordExtractionService` with an `extractKeywords` method accepting `jobDescription` (string) and `promptVersion` (string).
        3. Import `genAI` from `src/config/ai-providers.ts` for Google Gemini interaction.
        4. Import `JobExtractionPrompt` from `src/prompts/job-extraction.prompt.ts`.
        5. Implement basic LLM interaction within `extractKeywords`, calling `genAI.getGenerativeModel().generateContent()`.
        6. Pass `jobDescription` and use `JobExtractionPrompt.v1` for prompt content.
        7. Ensure the method is asynchronous and returns a structured response (e.g., `Promise<{ keywords: string[] }>`).

- **Subtask 1.2: Implement prompt formatting logic within `KeywordExtractionService` using `prompts/job-extraction.prompt.ts`.**
    - Plan: This subtask is addressed by the existing implementation in `src/services/KeywordExtractionService.ts` (using `JobExtractionPrompt[promptVersion](jobDescription)`) and the prior update to `src/prompts/job-extraction.prompt.ts` to output structured JSON. The prompt formatting logic is already correctly integrated.

- **Subtask 1.3: Integrate with Vercel AI SDK to call Google Gemini 2.5 Flash for text extraction.**
    - Plan:
        1. **Dependency Change:** The current implementation uses `@google/generative-ai` directly. AC-2 and Architecture specify `Vercel AI SDK` with `Google Gemini 2.5 Flash`. This requires adding `@ai-sdk/google` to `package.json`.
        2. Update `src/config/ai-providers.ts` to export `gemini` using `createGoogleGenerativeAI` from `@ai-sdk/google` with `gemini-2.5-flash`.
        3. Modify `src/services/KeywordExtractionService.ts` to use `generateObject` (for structured output) from `ai` (Vercel AI SDK) and the `gemini` instance.
        4. Remove direct `@google/generative-ai` usage.

- **Subtask 1.4: Implement robust JSON response validation using Zod schemas for the LLM output.**
    - Plan: This subtask is addressed by the existing implementation in `src/services/KeywordExtractionService.ts`. The `ExtractedJobDataSchema` is defined using Zod, and `generateObject` from Vercel AI SDK automatically applies this schema for robust JSON validation.

- **Subtask 1.5: Implement error handling within the service for LLM API failures, timeouts, or malformed responses.**
    - Plan: This subtask is addressed by the existing `try...catch` block within the `extractKeywords` method in `src/services/KeywordExtractionService.ts`. It logs errors and re-throws them as `AppError`, capturing issues from LLM API failures, timeouts (handled by the SDK), and malformed responses (caught by `generateObject`'s internal validation). This provides the necessary error handling as required by the AC.

- **Subtask 1.6: Configure LLM provider API key and model selection in `src/config/ai-providers.ts`.**
    - Plan: This subtask is addressed by the existing configuration in `src/config/ai-providers.ts`, which reads `process.env.GOOGLE_AI_API_KEY`. The model selection (`gemini-2.5-flash`) is explicitly made when calling `generateObject` in `src/services/KeywordExtractionService.ts`. This configuration is complete.

- **Subtask 2.1: Modify `src/controllers/job.controller.ts` to expose `POST /api/job/analyze` endpoint.**
    - Plan: The endpoint `POST /api/v1/jobs/analyze` is already defined in `src/routes/job.routes.ts` and handled by `jobController.analyzeJob` in `src/controllers/job.controller.ts`. This subtask is already complete.

- **Subtask 2.2: Update `JobAnalysisController` to call `JobAnalysisService` for orchestrating the analysis.**
    - Plan: `JobAnalysisController.analyzeJob` in `src/controllers/job.controller.ts` already calls `jobAnalysisService.analyzeJobDescription`. This subtask is complete as the call mechanism is in place; the actual orchestration logic will be implemented within `JobAnalysisService` itself (Subtask 2.3).

- **Subtask 2.3: Modify `src/services/JobAnalysisService.ts` to integrate `KeywordExtractionService` for keyword extraction.**
    - Plan:
        1. Imported `KeywordExtractionService` and `ExtractedJobData` from `./KeywordExtractionService`.
        2. Removed the placeholder `callAIService` function.
        3. Modified `jobAnalysisService.analyzeJobDescription` to call `KeywordExtractionService.extractKeywords(jobDescription)`.
        4. Updated subsequent logic within `analyzeJobDescription` to use the `extractedJobData.keywords` (and other fields from `ExtractedJobData`) for match score, ATS score, and gap analysis calculations.

- **Subtask 2.4: Ensure `JobAnalysisService` passes the job description from the API request to the `KeywordExtractionService`.**
    - Plan: This subtask is addressed by the existing implementation in `src/services/JobAnalysisService.ts`. The `analyzeJobDescription` method correctly passes the `jobDescription` parameter directly to `KeywordExtractionService.extractKeywords(jobDescription)`. This subtask is complete.

- **Subtask 3.1: Integrate `CacheService` (using Redis) within `JobAnalysisService` to cache `KeywordExtractionService` results.**
    - Plan:
        1. Imported `redis` client from `../config/redis`.
        2. Imported `crypto` for cache key generation (`generateCacheKey` function).
        3. Implemented a cache-aside pattern within `jobAnalysisService.analyzeJobDescription`:
            - Generated a cache key using `jobDescription`.
            - Checked Redis for cached results (`redis.get(cacheKey)`).
            - If found, returned `JSON.parse(cachedResult)`.
            - If not cached, called `KeywordExtractionService.extractKeywords` and then stored the `result` in Redis with `redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(result))`.

- **Subtask 3.2: Define cache key generation based on `hash(jobDescription)` (as per Tech Spec recommendation).**
    - Plan: This subtask is addressed by the `generateCacheKey` function implemented in `src/services/job-analysis.service.ts` as part of Subtask 3.1. It uses `crypto.createHash('sha256').update(jobDescription).digest('hex')` to generate a hash-based cache key. This subtask is complete.

- **Subtask 3.3: Implement cache invalidation/TTL for cached job analyses (e.g., 7 days).**
    - Plan: This subtask is addressed by the use of `redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(result))` in `src/services/job-analysis.service.ts`, implemented as part of Subtask 3.1. The `CACHE_TTL_SECONDS` constant is set to 7 days. This subtask is complete.

- **Subtask 4.1: Create `src/validators/job.validator.ts` with Zod schema for `POST /api/job/analyze` request body (`jobDescription`, `cvId`).**
    - Plan: `src/validators/job.validator.ts` was modified to include `cvId: z.string().uuid('Invalid CV ID format')` in `analyzeJobDescriptionSchema.body`. This subtask is complete.

- **Subtask 4.2: Apply the validation middleware (`validate.middleware.ts`) to the `POST /api/job/analyze` route.**
    - Plan: `src/routes/job.routes.ts` already includes `validate(analyzeJobDescriptionSchema)` middleware on the `POST /analyze` route. This subtask is complete.

- **Subtask 5.1: Write unit tests for `KeywordExtractionService` to verify prompt formatting and LLM response parsing (mocking LLM API calls).**
    - Plan:
        1. Created `src/tests/unit/KeywordExtractionService.test.ts`.
        2. Mocked `generateObject` from `ai` and `gemini` from `ai-providers`.
        3. Implemented test cases for:
            a. Successful extraction.
            b. LLM returning malformed/invalid data (schema validation by `generateObject`).
            c. LLM API errors.
            d. Job description too short or missing.
            e. Correct prompt version usage.

- **Subtask 5.2: Write unit tests for the Zod schemas in `job.validator.ts`.**
    - Plan:
        1. Created `src/tests/unit/job.validator.test.ts`.
        2. Implemented test cases for `analyzeJobDescriptionSchema` covering valid and invalid inputs for `jobDescription` (too short, too long, missing) and `cvId` (missing, invalid UUID).

- **Subtask 6.1: Write integration tests for `POST /api/job/analyze` endpoint.**
    - Plan:
        1. Modified `src/tests/integration/job.routes.test.ts`.
        2. Added `validCvId` constant.
        3. Updated `jobAnalysisService.analyzeJobDescription` mock to return a structured analysis result.
        4. Modified successful test case to send `cvId` in the request body and verify it's passed to the service.
        5. Added test cases for invalid `cvId` format and missing `cvId` (expecting 400 validation errors).

- **Subtask 6.2: TC-01: Verify the successful extraction path with a valid job description (asserting structured JSON output).**
    - Plan: This test case is covered by the integration test 'should return 200 and analysis result for valid job description and cvId when authenticated' in `src/tests/integration/job.routes.test.ts`, implemented as part of Subtask 6.1. It asserts the presence of structured analysis data in the response. This subtask is complete.

- **Subtask 6.5: TC-05: Verify caching mechanism: subsequent calls for the same job description return from cache (faster response).**
    - Plan:
        1. Add a new integration test case to `src/tests/integration/job.routes.test.ts`.
        2. Mock `KeywordExtractionService.extractKeywords` (which is called by `jobAnalysisService.analyzeJobDescription`) to introduce a delay (e.g., `4` seconds).
        3. Make the first `POST /api/v1/jobs/analyze` request and record its duration.
        4. Make the second `POST /api/v1/jobs/analyze` request (with the same input) and record its duration.
        5. Assert that `KeywordExtractionService.extractKeywords` was called only once.
        6. Assert that the duration of the second request is significantly faster (e.g., `< 500` milliseconds), indicating a cache hit).

- **Subtask 7.2: Confirm that rate limiting middleware is applied to the LLM endpoint.**
    - Plan: The `aiLimiter` middleware is already applied to the `POST /api/v1/jobs/analyze` route in `src/routes/job.routes.ts`. This subtask is complete.

- **Subtask 6.5: TC-05: Verify caching mechanism: subsequent calls for the same job description return from cache (faster response).**
    - Plan:
        1. Add a new integration test case to `src/tests/integration/job.routes.test.ts`.
        2. Mock `KeywordExtractionService.extractKeywords` (which is called by `jobAnalysisService.analyzeJobDescription`) to introduce a delay (e.g., `4` seconds).
        3. Make the first `POST /api/v1/jobs/analyze` request and record its duration.
        4. Make the second `POST /api/v1/jobs/analyze` request (with the same input) and record its duration.
        5. Assert that `KeywordExtractionService.extractKeywords` was called only once.
        6. Assert that the duration of the second request is significantly faster (e.g., `< 500` milliseconds), indicating a cache hit.

### Completion Notes List

### File List

- NEW: `src/services/KeywordExtractionService.ts`
