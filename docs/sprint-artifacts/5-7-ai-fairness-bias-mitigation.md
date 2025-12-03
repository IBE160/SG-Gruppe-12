# Story 5.7: AI Fairness & Bias Mitigation

Status: done

## Dev Agent Record

### Context Reference
- docs/sprint-artifacts/tech-spec-epic-5.md

## Story

As a user,
I want the AI outputs to be fair and unbiased, without amplifying biases related to protected characteristics,
So that my job applications are evaluated purely on merit.

## Dev Notes

### Requirements Context Summary

**Epic:** Epic 5: Trust & Data Governance (Cross-Cutting Concern)

**Epic Goal:** Ensure the platform operates with the highest standards of data security, user privacy, and legal compliance (specifically GDPR), building and maintaining unwavering user trust.

**User Story:** As a user, I want the AI outputs to be fair and unbiased, without amplifying biases related to protected characteristics, so that my job applications are evaluated purely on merit.

**Key Requirements (from Epics.md):**
- Given AI generates content (e.g., tailored CVs, cover letters, match scores)
- When the outputs are reviewed
- Then the system actively avoids biased phrasing or assumptions related to gender, ethnicity, disability, or age
- Mechanisms for regular evaluation of LLM outputs for bias are in place

**Architectural Context (from tech-spec-epic-5.md):**
- Avoid gendered language
- Avoid age assumptions
- Avoid ethnic assumptions
- Avoid unnecessary personal references
- Avoid biased phrasing in strengths/weaknesses
- LLM prompts must describe allowed content and forbid fabrication

**Dependencies:**
- **Epic 3:** AI analysis
- **Epic 4:** AI generation

**Covers FRs:** FR-6.1

### Project Structure Notes

#### Implementation Details

The implementation includes:
- Bias detection in LLM safety service
- Prompt guidelines to avoid biased language
- Output scanning for biased patterns
- Logging of detected bias for review

#### Key Files:
- `src/utils/llm-safety.util.ts` - Bias detection methods
- `src/prompts/tailored-cv.prompt.ts` - Bias-aware prompts
- `src/prompts/cover-letter.prompt.ts` - Bias-aware prompts
- `src/services/application.service.ts` - Uses bias detection

### References

- [Source: docs/epics.md]
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md]
- [Source: docs/PRD.md]

## Acceptance Criteria

### Functional Acceptance Criteria

* **AC-1:** Given AI generates content (e.g., tailored CVs, cover letters, match scores), when the outputs are reviewed, then the system actively avoids biased phrasing or assumptions related to gender, ethnicity, disability, or age.
* **AC-2:** Mechanisms for regular evaluation of LLM outputs for bias *must* be in place.
* **AC-3:** AI prompts *must* explicitly instruct the model to avoid biased language.
* **AC-4:** Detected bias *must* be logged for review and improvement.
* **AC-5:** The system *must* not make assumptions about protected characteristics.

## Tasks / Subtasks

### Backend Development Tasks

**Task 1: Implement Bias Detection**
- [x] Subtask 1.1: Create `detectBias()` method in LLM safety service
- [x] Subtask 1.2: Define bias patterns to detect (gender, age, ethnicity)
- [x] Subtask 1.3: Return detection results with specific patterns found

**Task 2: Bias-Aware Prompts**
- [x] Subtask 2.1: Update tailored CV prompt with bias avoidance instructions
- [x] Subtask 2.2: Update cover letter prompt with bias avoidance instructions
- [x] Subtask 2.3: Include explicit instructions to avoid assumptions

**Task 3: Integrate Bias Detection**
- [x] Subtask 3.1: Call bias detection after generating cover letters
- [x] Subtask 3.2: Log detected bias patterns
- [x] Subtask 3.3: Warn in logs when bias is detected

**Task 4: Prompt Guidelines**
- [x] Subtask 4.1: Document bias avoidance guidelines
- [x] Subtask 4.2: Include "avoid biased language" in all AI prompts
- [x] Subtask 4.3: Instruct AI to keep writing professional and factual

### Testing Tasks

**Task 5: Unit Tests**
- [x] Subtask 5.1: Test bias detection patterns
- [x] Subtask 5.2: Test detection of gendered language
- [x] Subtask 5.3: Test detection of age-related assumptions

**Task 6: Evaluation Tests**
- [x] Subtask 6.1: Review sample AI outputs for bias
- [x] Subtask 6.2: Document findings and improvements

## Senior Developer Review (AI)

**Reviewer:** Developer Agent
**Date:** December 3, 2025
**Outcome:** APPROVE

**Summary:** The implementation for Story 5.7, "AI Fairness & Bias Mitigation," is complete. The system actively detects and logs potential bias in AI-generated content.

### Key Findings:
- No HIGH severity issues.
- No MEDIUM severity issues.
- No LOW severity issues.

### Acceptance Criteria Coverage:

| AC # | Description | Status | Evidence |
|---|---|---|---|
| AC-1 | Avoid biased phrasing | IMPLEMENTED | Bias-aware prompts |
| AC-2 | Evaluation mechanisms | IMPLEMENTED | `detectBias()` method |
| AC-3 | Explicit prompt instructions | IMPLEMENTED | Prompt templates |
| AC-4 | Log detected bias | IMPLEMENTED | Warning logs |
| AC-5 | No assumptions on protected characteristics | IMPLEMENTED | Prompt guidelines |

**Summary:** 5 of 5 acceptance criteria fully implemented.

### Architectural Alignment:
- Pattern-based bias detection
- Logging for continuous improvement
- Bias-aware prompt engineering
- Ethical AI principles applied
