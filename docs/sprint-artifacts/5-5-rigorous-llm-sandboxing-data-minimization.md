# Story 5.5: Rigorous LLM Sandboxing & Data Minimization

Status: done

## Dev Agent Record

### Context Reference
- docs/sprint-artifacts/tech-spec-epic-5.md

## Story

As a user,
I want strict guarantees that my personal data is never used for AI model training by third-party providers,
So that my privacy is fully protected when using AI features.

## Dev Notes

### Requirements Context Summary

**Epic:** Epic 5: Trust & Data Governance (Cross-Cutting Concern)

**Epic Goal:** Ensure the platform operates with the highest standards of data security, user privacy, and legal compliance (specifically GDPR), building and maintaining unwavering user trust.

**User Story:** As a user, I want strict guarantees that my personal data is never used for AI model training by third-party providers, so that my privacy is fully protected when using AI features.

**Key Requirements (from Epics.md):**
- Given an external LLM call is made
- When personal user data is involved
- Then the system ensures no personal data is persistently stored or used for model training by the LLM provider
- User consent is explicitly respected for any data processing involving AI
- Raw job advertisement text is only stored if absolutely necessary and automatically deleted afterwards

**Architectural Context (from tech-spec-epic-5.md):**
- Configure LLM API calls to disable data retention/training
- No sending CVs or job descriptions to 3rd parties beyond necessary
- No embedding personal data in prompts beyond what is required
- No logging LLM prompts containing personal data
- Short-lived storage for job ad text

**Dependencies:**
- **Epic 3:** AI analysis
- **Epic 4:** AI generation

**Covers FRs:** FR-6.1

### Project Structure Notes

#### Implementation Details

The implementation includes:
- LLM safety service for data minimization
- Prompt sanitization before sending to AI
- Output sanitization after receiving from AI
- No persistent storage of raw prompts
- Validation context for generated content

#### Key Files:
- `src/utils/llm-safety.util.ts` - LLM safety service
- `src/services/application.service.ts` - Uses safety service
- `src/services/job-analysis.service.ts` - Uses safety service
- `src/config/ai-providers.ts` - AI provider configuration

### References

- [Source: docs/epics.md]
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md]
- [Source: docs/PRD.md]

## Acceptance Criteria

### Functional Acceptance Criteria

* **AC-1:** Given an external LLM call is made when personal user data is involved, then the system ensures no personal data is persistently stored or used for model training by the LLM provider.
* **AC-2:** User consent *must* be explicitly respected for any data processing involving AI.
* **AC-3:** Raw job advertisement text *must* only be stored if absolutely necessary for analysis and is automatically deleted afterwards.
* **AC-4:** LLM prompts *must* be sanitized to include only necessary data.
* **AC-5:** LLM outputs *must* be sanitized to remove any leaked system content.

## Tasks / Subtasks

### Backend Development Tasks

**Task 1: Create LLM Safety Service**
- [x] Subtask 1.1: Create `llm-safety.util.ts` with safety utilities
- [x] Subtask 1.2: Implement `sanitizeOutput()` method
- [x] Subtask 1.3: Implement `validateGeneratedContent()` method
- [x] Subtask 1.4: Implement `detectBias()` method

**Task 2: Data Minimization in Prompts**
- [x] Subtask 2.1: Only include necessary CV data in prompts
- [x] Subtask 2.2: Only include necessary job data in prompts
- [x] Subtask 2.3: Avoid including PII beyond what's required

**Task 3: Output Validation**
- [x] Subtask 3.1: Validate generated content against user's actual data
- [x] Subtask 3.2: Flag suspicious content that may be fabricated
- [x] Subtask 3.3: Log warnings for unverified claims

**Task 4: Job Description Retention**
- [x] Subtask 4.1: Store job descriptions temporarily
- [x] Subtask 4.2: Implement automatic deletion after analysis
- [x] Subtask 4.3: Clear cached versions

**Task 5: AI Provider Configuration**
- [x] Subtask 5.1: Configure Gemini to not retain data
- [x] Subtask 5.2: Use appropriate API settings for privacy

### Testing Tasks

**Task 6: Unit Tests**
- [x] Subtask 6.1: Test output sanitization
- [x] Subtask 6.2: Test content validation
- [x] Subtask 6.3: Test bias detection

**Task 7: Integration Tests**
- [x] Subtask 7.1: Test end-to-end with safety measures
- [x] Subtask 7.2: Verify no sensitive data in logs

## Senior Developer Review (AI)

**Reviewer:** Developer Agent
**Date:** December 3, 2025
**Outcome:** APPROVE

**Summary:** The implementation for Story 5.5, "LLM Sandboxing & Data Minimization," is complete. The system properly sanitizes data sent to and received from AI providers.

### Key Findings:
- No HIGH severity issues.
- No MEDIUM severity issues.
- No LOW severity issues.

### Acceptance Criteria Coverage:

| AC # | Description | Status | Evidence |
|---|---|---|---|
| AC-1 | No data retention by LLM provider | IMPLEMENTED | AI provider configuration |
| AC-2 | Respect user consent | IMPLEMENTED | Consent check before AI processing |
| AC-3 | Automatic job ad deletion | IMPLEMENTED | Retention policy |
| AC-4 | Prompt sanitization | IMPLEMENTED | Data minimization in prompts |
| AC-5 | Output sanitization | IMPLEMENTED | `llmSafetyService.sanitizeOutput()` |

**Summary:** 5 of 5 acceptance criteria fully implemented.

### Architectural Alignment:
- Privacy-by-design approach
- Data minimization principles
- Proper output validation
