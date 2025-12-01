# Epic 3 – Job Ad Analysis & Match Scoring
Technical Specification – Sprint Artifact  
Author: Martin Reppen  
Date: 2025-11-25  

---

## 1. Overview

Epic 3 introduces the functionality that allows users to paste a job advertisement and receive a structured, AI-driven analysis. This epic connects the structured CV data stored in Epic 2 with the requirements extracted from the job post, enabling the system to calculate a match score, highlight strengths and weaknesses, and identify missing keywords.

This specification is based on PRD requirements **FR-3.1**, **FR-3.2** and **FR-3.3**.

---

## 2. Purpose & Goals

The goal is to provide a transparent and reliable job-analysis workflow. The system must:

- Accept raw job descriptions from the user  
- Extract key skills, competencies, tools and responsibilities  
- Compare the extracted data with the user’s CV  
- Calculate a numeric match score between 0 and 100  
- Provide human-readable strengths and weaknesses summaries  
- Identify missing keywords that are important for the role  
- Produce structured output that can be reused in **Epic 4** (tailored applications)

---

## 3. In Scope

Epic 3 covers the following:

- Job description input UI and validation  
- Backend API endpoint for job analysis  
- Keyword extraction using an LLM provider (e.g. Gemini)  
- Comparison logic between job keywords and CV data  
- Match score calculation  
- Grouping of keywords into `presentKeywords` and `missingKeywords`  
- Strength and weakness summary generation  
- Simple caching of repeated analyses of the same job text  

---

## 4. Out of Scope

The following is explicitly **out of scope** for this epic and will be handled elsewhere:

- Tailored CV rewriting (Epic 4)  
- Tailored cover-letter generation (Epic 4)  
- Full application history (Epic 4.3 / Growth)  
- Advanced bias mitigation (Epic 5 – Trust & Governance)  
- Detailed UI/UX design, theming, animations  

---

## 5. API Design

### 5.1 Endpoint

**Method:** `POST`  
**Path:** `/api/job/analyze`  

Purpose: Accept a job description and a reference to a CV, return a structured analysis of how well they match.

### 5.2 Request Body

```json
{
  "jobDescription": "string",
  "cvId": "string"
}
```

- `jobDescription`: full job ad text pasted by the user  
- `cvId`: identifier of the CV to compare against (from Epic 2)

### 5.3 Response Body

```json
{
  "matchScore": 78,
  "presentKeywords": ["project management", "React"],
  "missingKeywords": ["data analysis", "Agile"],
  "strengthsSummary": "Your background in React and UX aligns well with this position.",
  "weaknessesSummary": "The job expects stronger skills in Agile and data analysis.",
  "rawKeywords": ["project management", "React", "data analysis", "Agile"]
}
```

Fields:

- `matchScore`: integer between 0 and 100  
- `presentKeywords`: keywords found in both job description and CV  
- `missingKeywords`: keywords found in job description but not in CV  
- `strengthsSummary`: short natural-language description of strengths  
- `weaknessesSummary`: short natural-language description of gaps  
- `rawKeywords`: all extracted keywords before grouping

### 5.4 Error Responses

Common error situations:

- **400 – Validation error** (missing or invalid fields)  
- **404 – CV not found** for the given `cvId`  
- **500 – Internal error** (LLM failure, DB error, etc.)

Example 400 response:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "jobDescription is required"
}
```

---

## 6. Backend Service Design

To ensure a modular and maintainable architecture, the backend logic for this epic will be divided into several distinct services, each with a clear responsibility.

- **`JobAnalysisController`**:
  - Receives requests from the `/api/job/analyze` endpoint.
  - Validates the incoming request body.
  - Orchestrates calls to the other services.
  - Formats the final `JobAnalysisResult` and returns the HTTP response.

- **`JobAnalysisService`**:
  - The main service that manages the end-to-end analysis flow.
  - Handles the caching logic (get/set).
  - Fetches CV data from the `CVRepository`.
  - Calls the `KeywordExtractionService` to get keywords.
  - Calls the `MatchScoringService` to get the score and grouped keywords.
  - Calls the `SummaryService` to generate natural-language summaries.

- **`KeywordExtractionService`**:
  - Responsible for all communication with the LLM provider (Gemini).
  - Formats the prompt using the defined `PromptContract`.
  - Sends the request to the LLM and validates the JSON response.
  - Returns a clean list of raw keywords.

- **`MatchScoringService`**:
  - Contains the business logic for comparing the extracted keywords against the user's CV data.
  - Groups keywords into `presentKeywords` and `missingKeywords`.
  - Implements the `calculateMatchScore` function.

- **`SummaryService`**:
  - (Optional, can be part of `JobAnalysisService` for MVP)
  - Calls the LLM with a separate prompt to generate the `strengthsSummary` and `weaknessesSummary` based on the grouped keywords.

- **`CacheService`**:
  - An abstraction layer over Redis (or another cache provider).
  - Provides simple `get` and `set` methods for caching analysis results.

---

## 7. Data Models

Epic 3 reuses the CV data model from Epic 2 and adds its own analysis types.

### 6.1 TypeScript Interfaces

```ts
// Core type for the analysis result
export interface JobAnalysisResult {
  matchScore: number;
  presentKeywords: string[];
  missingKeywords: string[];
  strengthsSummary: string;
  weaknessesSummary: string;
  rawKeywords: string[];
}

// Input to the service layer
export interface JobAnalysisInput {
  jobDescription: string;
  cvId: string;
}

// Simple cached entry (for Redis or similar)
export interface JobAnalysisCacheEntry {
  cacheKey: string;
  result: JobAnalysisResult;
  createdAt: Date;
}
```

---

## 7. Processing Flow

High-level flow when the user analyzes a job:

1. User pastes job description in the frontend and selects a CV.  
2. Frontend calls `POST /api/job/analyze` with `jobDescription` and `cvId`.  
3. Backend validates input (non-empty text, valid `cvId` format, etc.).  
4. Backend computes a cache key (e.g. SHA-256 hash of `jobDescription` + `cvId`).  
5. Backend checks cache:
   - If a cached analysis exists → return cached result.  
6. If no cached entry:
   - Backend loads structured CV data for `cvId`.
   - Backend sends the job description to the LLM provider (e.g. Gemini) using a deterministic prompt.
   - LLM returns extracted keywords and possibly categories.
   - Backend compares these keywords with the CV data.
   - Backend builds `presentKeywords` and `missingKeywords` arrays.
   - Backend calculates `matchScore`.
   - Backend generates `strengthsSummary` and `weaknessesSummary`.
   - Backend stores the `JobAnalysisResult` in the cache.
7. Backend returns the final `JobAnalysisResult` to the frontend.  
8. Frontend renders match score, keyword lists and summaries in the UI.

---

## 8. Dependencies and Integrations

This epic relies on the following external services and libraries:

| Dependency | Version/Provider | Purpose |
| :--- | :--- | :--- |
| LLM Provider | Google Gemini 2.5 Flash | Keyword extraction and summary generation. |
| Cache Store | Redis 7.x | Caching job analysis results to reduce latency and cost. |
| Backend Framework | Express.js 4.18+ | Serves as the foundation for the backend API. |
| Database | PostgreSQL 15+ | CV data is retrieved from the database established in Epic 2. |

---

## 9. Processing Flow

High-level flow when the user analyzes a job:

```ts
function calculateMatchScore(present: string[], missing: string[]): number {
  const total = present.length + missing.length;
  if (total === 0) {
    return 0;
  }
  const ratio = present.length / total; // value between 0 and 1
  const score = Math.round(ratio * 100);
  return score;
}
```

Future improvements may introduce weighting of different keyword types (e.g. hard skills > soft skills), but this is not required for the first implementation.

---

## 9. Prompt Contract (LLM)

To keep the analysis stable and predictable, the backend must use a clear prompt contract when calling the LLM (e.g. Gemini). The prompt should:

- Explain that the input is a job description.  
- Ask for structured JSON output only.  
- Request explicit keyword lists.  
- Avoid fabricating extra content.

### 9.1 Example Prompt (Simplified)

```text
You are an assistant that analyzes job descriptions.

Given the following job description text, extract a flat list of important keywords and skill phrases.
Return ONLY valid JSON in the following format:

{
  "keywords": [ "keyword1", "keyword2", "... more ..." ]
}

Do not add any explanation outside the JSON.

JOB DESCRIPTION:
---
{{jobDescription}}
---
```

### 9.2 Expected LLM Output

```json
{
  "keywords": [
    "project management",
    "React",
    "Agile",
    "user experience",
    "stakeholder communication"
  ]
}
```

The backend is responsible for validating that the returned JSON matches the expected structure before using it.

---

## 10. Caching Strategy

To reduce latency and LLM cost, repeated analyses of the same job description should be cached.

- **Cache key:**  
  - `hash(jobDescription + ":" + cvId)` (e.g. SHA-256)  
- **Cache value:**  
  - Serialized `JobAnalysisResult`  
- **TTL (time-to-live):**  
  - For example, 7 days (configurable)  

### 10.1 Cache Pseudocode

```ts
async function analyzeJob(input: JobAnalysisInput): Promise<JobAnalysisResult> {
  const cacheKey = makeCacheKey(input.jobDescription, input.cvId);
  const cached = await cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const result = await runFullJobAnalysis(input);
  await cache.set(cacheKey, result, { ttlSeconds: 7 * 24 * 60 * 60 });

  return result;
}
```

This ensures that if the user or multiple users analyze the same job text repeatedly, the system can respond much faster and with lower cost.

---

## 11. Non-Functional Requirements

- **Performance:**  
  - Total response time target: under 5 seconds for non-cached requests.  
  - Cached results should return in under 500 ms.  

- **Reliability:**  
  - Clear error messages for invalid input or analysis failures.  

- **Security & Privacy:**  
  - Raw job descriptions must not be stored indefinitely.  
  - Any long-term storage must comply with GDPR and internal policies.  

- **Observability:**  
  - Log errors and slow calls (e.g. LLM timeouts) for debugging.  

---

## 13. Acceptance Criteria

| ID | Given | When | Then |
| :--- | :--- | :--- | :--- |
| AC-1 | A user provides a job description and a valid CV ID | the user submits the analysis request | the API returns a `200 OK` status with a `JobAnalysisResult` object. |
| AC-2 | The returned `JobAnalysisResult` object | contains `matchScore`, `presentKeywords`, `missingKeywords`, `strengthsSummary`, and `weaknessesSummary` fields | all fields are correctly populated and typed. |
| AC-3 | The `matchScore` in the response | is an integer | between 0 and 100, inclusive. |
| AC-4 | A user provides a job description but an invalid or non-existent `cvId` | the user submits the analysis request | the API returns a `404 Not Found` error. |
| AC-5 | A user submits an analysis request with an empty `jobDescription` | the request is sent | the API returns a `400 Bad Request` error with a clear validation message. |
| AC-6 | A user submits the same job description and `cvId` combination twice | the second request is sent within the cache TTL | the response time for the second request is under 500ms. |


---

## 15. Test Strategy

A multi-layered testing approach will be used to ensure the quality and reliability of the job analysis functionality.

### 15.1 Unit Testing (Jest)

- **`MatchScoringService`**:
  - Test the `calculateMatchScore` function with various inputs (e.g., empty arrays, all present, all missing) to ensure the logic is sound.
- **`KeywordExtractionService`**:
  - Mock the LLM provider and test that the service correctly formats the prompt and handles valid/invalid JSON responses.
- **`JobAnalysisController`**:
  - Mock the service layer and test that the controller correctly handles request/response cycles, including error states.

### 15.2 Integration Testing (Supertest)

- **API Endpoint (`/api/job/analyze`)**:
  - Write integration tests that make live calls to the API endpoint (with a mocked LLM and database).
  - **TC-01:** Test the successful analysis path (200 OK).
  - **TC-02:** Test the keyword grouping logic by providing a known CV and job description.
  - **TC-03:** Test the match score calculation with a known input.
  - **TC-04:** Test the 404 error when an invalid `cvId` is provided.
  - **TC-05:** Test the 400 error when the `jobDescription` is missing.
- **Cache Integration**:
  - **TC-06:** Send the same request twice and assert that the second response is significantly faster and retrieves data from the cache.

### 15.3 End-to-End (E2E) Testing

- A full E2E test will simulate the user journey:
  1. A user logs in.
  2. A pre-existing CV is available.
  3. The user navigates to the job analysis page, pastes a job description, and submits.
  4. The test asserts that the UI correctly displays the match score, keyword lists, and summaries returned from the API.

---

## 16. Conclusion

Epic 3 defines the analytical backbone for the job-matching functionality in the application. By extracting keywords from job descriptions, comparing them against structured CV data, and computing a transparent match score, this epic creates the foundation needed for tailored CV and cover-letter generation in **Epic 4**. It also introduces important patterns for LLM prompting and response validation that can be reused elsewhere in the system.
