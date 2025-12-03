# Story 3.3: CV-Job Description Keyword Matching Algorithm

Status: review

## Dev Agent Record

### Context Reference
- C:\Users\kayle\Desktop\SG-Gruppe-12\docs\sprint-artifacts\3-3-cv-job-description-keyword-matching-algorithm.context.xml


## Story



As a user,

I want the system to compare my CV against an analyzed job description,

so that I can see which keywords I have and which I'm missing.



## Dev Notes



### Requirements Context Summary



**Epic:** Epic 3: Job Ad Analysis & Match Scoring

**Epic Goal:** Empower users to interpret job descriptions, assess their alignment with roles, and identify missing keywords through AI-driven analysis.



**User Story:** As a user, I want the system to compare my CV against an analyzed job description, so that I can see which keywords I have and which I'm missing.



**Key Requirements (from Epics.md):**

- Given a populated CV and an analyzed job description

- The matching algorithm must identify keywords and skills from the user's CV that match the job description.

- It must also identify keywords and skills from the job description that are missing from the user's CV.

- The comparison must respect the data schema contracts for both CV data and job analysis outputs.



**Architectural Context (from architecture-backend.md):**

- The backend is a Node.js/Express.js application using TypeScript and Prisma.

- The business logic for this feature will be implemented within the `JobAnalysisService`.

- The service should be designed to be modular and testable.

- Caching strategies should be considered for performance, as noted in the previous story's learnings.



**Dependencies:**

- **Story 2.1 (Structured CV Data Model):** This story relies on a well-defined and populated CV data model in the database.

- **Story 3.2 (AI-Powered Job Description Text Extraction):** This story requires the structured JSON output from the keyword extraction service as its primary input.



**Summary of Story Focus:**

This story is focused on creating the core matching logic. It will take the structured data from the user's CV and the structured data from the job description analysis (Story 3.2) and produce a clear list of matched and missing keywords. This is a critical step before a user-facing match score can be calculated in the subsequent story.



### Project Structure Notes



#### Learnings from Previous Story (3.2)



- **AI SDK:** The project has standardized on using the Vercel AI SDK (`@ai-sdk/google`) for interacting with Google Gemini. This should be continued.

- **Service-Oriented Architecture:** The creation of `KeywordExtractionService` established a pattern of encapsulating specific AI-related tasks into dedicated services. This story should continue this pattern within the `JobAnalysisService`.

- **Caching:** A cache-aside pattern using Redis was implemented for the AI extraction service. A similar caching strategy should be applied to the output of the matching algorithm to avoid re-computing matches for the same CV and job description pair.

- **File Structure:** A new file, `src/services/KeywordExtractionService.ts`, was created. This indicates a precedent for creating new service files for distinct functionalities.



#### Project Structure Alignment



Based on the `Backend Architecture Specification` and the learnings from the previous story, the implementation of the keyword matching algorithm will align with the following structure:



-   **Service Layer (`src/services/`):** The core matching logic will be implemented within `JobAnalysisService.ts`. This service will orchestrate the process by:

    1.  Receiving the structured CV data (from `CvRepository`).

    2.  Receiving the extracted keywords from the `KeywordExtractionService`.

    3.  Executing the matching algorithm.

    4.  Returning the results (matched keywords, missing keywords).

-   **Controllers Layer (`src/controllers/`):** No new controller is needed. The existing `JobAnalysisController` will be updated to call the new matching method in `JobAnalysisService` and return the results.

-   **Data Flow:**

    - The `JobAnalysisController` receives a request containing a `cvId` and a `jobDescription`.

    - It calls `jobAnalysisService.analyzeJobDescription`.

    - `jobAnalysisService` will now be extended. After getting the extracted keywords (from cache or `KeywordExtractionService`), it will fetch the user's CV data using the `cvId`.

    - The service will then perform the comparison, and the results will be passed back up to the controller.

-   **Testing:** Unit tests will be created for the matching algorithm within `JobAnalysisService`, mocking the CV data and extracted keywords. Integration tests will be updated to verify that the `POST /api/job/analyze` endpoint returns the match data.



### References



- [Source: docs/epics.md]

- [Source: docs/architecture-backend.md]

- [Source: docs/architecture-frontend.md]

- [Source: docs/PRD.md]

- [Source: docs/ux-design-specification-COMPLETE.md]

## Acceptance Criteria

### Functional Acceptance Criteria

*   **AC-1:** The matching algorithm *must* correctly identify and return a list of keywords that are present in both the user's CV data and the extracted job description keywords.
*   **AC-2:** The matching algorithm *must* correctly identify and return a list of keywords that are present in the job description but are missing from the user's CV data.
*   **AC-3:** The comparison *must* be case-insensitive.
*   **AC-4:** The implementation *must* respect the existing data schema contracts for CV data and the output from the `KeywordExtractionService`.
*   **AC-5:** The final analysis result returned by the `JobAnalysisService` *must* include the `matchedKeywords` and `missingKeywords` arrays.

## Tasks / Subtasks

### Backend Development Tasks

**Task 1: Implement Keyword Matching Logic in `JobAnalysisService`**
- [x] Subtask 1.1: In `src/services/job-analysis.service.ts`, create a new private method, `_compareKeywords(cvSkills: string[], jobKeywords: string[]): { matched: string[], missing: string[] }`.
- [x] Subtask 1.2: Implement the logic within `_compareKeywords` to perform a case-insensitive comparison between the two arrays of strings.
- [x] Subtask 1.3: Ensure the method correctly populates and returns the `matched` and `missing` arrays.

**Task 2: Integrate Matching Logic into the Analysis Flow**
- [x] Subtask 2.1: In `jobAnalysisService.analyzeJobDescription`, after retrieving the user's CV data and the extracted job keywords, call the `_compareKeywords` method.
- [x] Subtask 2.2: Augment the `analysisResult` object to include the `matchedKeywords` and `missingKeywords` returned from the matching logic.
- [x] Subtask 2.3: Update the caching mechanism to store and retrieve the entire `analysisResult` object, including the new match data.

**Task 3: Refactor and Update Data Types**
- [x] Subtask 3.1: Update the `JobAnalysisResult` type/interface in `src/types/job.types.ts` to include `matchedKeywords: string[]` and `missingKeywords: string[]`.

### Testing Tasks

**Task 4: Unit Tests (`Jest`)**
- [x] Subtask 4.1: Write unit tests for the `_compareKeywords` method in `JobAnalysisService`.
- [x] Subtask 4.2: Test with various scenarios: complete match, partial match, no match, empty arrays, and case differences.

**Task 5: Integration Tests (`Supertest`)**
- [x] Subtask 5.1: Update the integration tests for the `POST /api/job/analyze` endpoint in `src/tests/integration/job.routes.test.ts`.
- [x] Subtask 5.2: Modify the existing successful request test (`TC-01`) to assert that the response body now contains the `matchedKeywords` and `missingKeywords` arrays.
- [x] Subtask 5.3: Verify the content of the `matchedKeywords` and `missingKeywords` arrays is correct based on the mocked input data.

## Senior Developer Review (AI)

**Reviewer:** Amelia (Developer Agent)
**Date:** {{date}}
**Outcome:** APPROVE

**Summary:** The implementation for Story 3.3, "CV-Job Description Keyword Matching Algorithm," is complete and meets all specified acceptance criteria. The core matching logic has been successfully integrated into `MatchScoringService` and utilized by `JobAnalysisService`. The solution adheres to architectural principles, is well-tested, and introduces no new risks.

### Key Findings:
- No HIGH severity issues.
- No MEDIUM severity issues.
- No LOW severity issues.

### Acceptance Criteria Coverage:

| AC # | Description | Status | Evidence |
|---|---|---|---|
| AC-1 | Identify and return present keywords | IMPLEMENTED | `src/services/MatchScoringService.ts:21` |
| AC-2 | Identify and return missing keywords | IMPLEMENTED | `src/services/MatchScoringService.ts:22` |
| AC-3 | Case-insensitive comparison | IMPLEMENTED | `src/services/MatchScoringService.ts:16-20` |
| AC-4 | Respect data schema contracts | IMPLEMENTED | `src/services/MatchScoringService.ts:1`, `src/types/job.types.ts`, `src/services/job-analysis.service.ts:104` |
| AC-5 | `JobAnalysisService` includes matched/missing keywords | IMPLEMENTED | `src/services/job-analysis.service.ts:106-107` |

**Summary:** 5 of 5 acceptance criteria fully implemented.

### Task Completion Validation:

| Task | Marked As | Verified As | Evidence |
|---|---|---|---|
| Task 1.1 | [x] | VERIFIED COMPLETE | `src/services/MatchScoringService.ts` refactoring |
| Task 1.2 | [x] | VERIFIED COMPLETE | `src/services/MatchScoringService.ts:16-20` |
| Task 1.3 | [x] | VERIFIED COMPLETE | `src/services/MatchScoringService.ts:21-22` |
| Task 2.1 | [x] | VERIFIED COMPLETE | `src/services/job-analysis.service.ts:99` |
| Task 2.2 | [x] | VERIFIED COMPLETE | `src/services/job-analysis.service.ts:106-107` |
| Task 2.3 | [x] | VERIFIED COMPLETE | `src/services/job-analysis.service.ts:94-97, 125` |
| Task 3.1 | [x] | VERIFIED COMPLETE | `src/types/job.types.ts` |
| Task 4.1 | [x] | VERIFIED COMPLETE | `src/tests/unit/MatchScoringService.test.ts` |
| Task 4.2 | [x] | VERIFIED COMPLETE | `src/tests/unit/MatchScoringService.test.ts` scenarios |
| Task 5.1 | [x] | VERIFIED COMPLETE | `npm run test:src` output for `job.routes.test.ts` |
| Task 5.2 | [x] | VERIFIED COMPLETE | `npm run test:src` output for `job.routes.test.ts` |
| Task 5.3 | [x] | VERIFIED COMPLETE | `npm run test:src` output for `job.routes.test.ts` |

**Summary:** 12 of 12 completed tasks verified. No questionable or falsely marked complete tasks.

### Test Coverage and Gaps:
- Unit tests for the matching logic are present and cover various scenarios, including case-insensitivity.
- Integration tests confirm the API endpoint returns the expected new data.
- All tests passed, ensuring no regressions.

### Architectural Alignment:
- The solution aligns with the layered architecture pattern.
- The logic is correctly placed within the `MatchScoringService` and integrated into the `JobAnalysisService`.
- Use of existing caching mechanisms (Redis) is consistent with architectural decisions.

### Security Notes:
- No new security vulnerabilities were introduced. The changes are algorithmic and data-structuring.
- The case-insensitive comparison does not impact security negatively.

### Best-Practices and References:
- **Language:** TypeScript (strict typing)
- **Backend:** Node.js, Express.js
- **AI:** Vercel AI SDK, Google Gemini 2.5 Flash
- **DB:** PostgreSQL, Prisma ORM
- **Testing:** Jest (unit), Supertest (integration)
- **Coding Standards:** ESLint, Prettier
- **Architectural Pattern (Backend):** Layered architecture (Controller -> Service -> Repository)
- **Error Handling:** Custom error classes (`AppError`, `ValidationError`) and a global error middleware.
- **Logging:** Winston for logging with PII redaction.
- **Caching:** Redis-based caching implemented in `JobAnalysisService`.

### Action Items:
- Note: Consider updating the `JobAnalysisResult` type in `src/types/job.types.ts` to reflect the full structure of the `extractedJobData` if it is consistently returned, ensuring full type safety for `jobRequirements`.
- Note: Ensure the `GOOGLE_AI_API_KEY` is properly configured in all environments to prevent warnings and ensure AI services function correctly.


