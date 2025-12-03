# Schema Contracts Documentation

**Story:** 3.6 - Data Schema Contract Enforcement (Job Analysis Inputs/Outputs)
**Last Updated:** 2025-12-03
**Status:** Implemented

## Overview

This document defines the data schema contracts for all job analysis inputs and outputs in the AI CV & Job Application Assistant. All schemas are enforced using Zod validation library at both API endpoints and service boundaries.

## Table of Contents

1. [CV Data Schemas](#cv-data-schemas)
2. [Job Analysis Schemas](#job-analysis-schemas)
3. [Matching Schemas](#matching-schemas)
4. [Validation Rules](#validation-rules)
5. [Error Codes](#error-codes)
6. [Request/Response Examples](#requestresponse-examples)

---

## CV Data Schemas

### CvData

**Location:** `src/validators/cv.validator.ts::cvDataSchema`

Complete CV data structure representing a user's curriculum vitae.

**Schema:**
```typescript
{
  personal_info?: PersonalInfo;
  education?: EducationEntry[];
  experience?: ExperienceEntry[];
  skills?: SkillEntry[];
  languages?: LanguageEntry[];
  summary?: string;
  title?: string;
  file_path?: string;
}
```

### PersonalInfo

**Schema:**
```typescript
{
  name?: string;
  email?: string;         // Must be valid email format
  phone?: string;
  address?: string;
  linkedin?: string;      // Must be valid URL
  portfolio?: string;     // Must be valid URL
}
```

**Validation Rules:**
- `email`: Must match email pattern
- `linkedin`, `portfolio`: Must be valid URLs if provided

### EducationEntry

**Schema:**
```typescript
{
  institution: string;    // Required, min 1 char
  degree: string;         // Required, min 1 char
  location?: string;
  start_date: string;     // YYYY-MM-DD or YYYY-MM format
  end_date?: string;      // YYYY-MM-DD or YYYY-MM format
  description?: string;
}
```

**Validation Rules:**
- `start_date`, `end_date`: Must match regex `^\d{4}(-\d{2}(-\d{2})?)?$`

### ExperienceEntry

**Schema:**
```typescript
{
  title: string;          // Required, min 1 char
  company: string;        // Required, min 1 char
  location?: string;
  start_date: string;     // YYYY-MM-DD or YYYY-MM format
  end_date?: string;      // YYYY-MM-DD or YYYY-MM format
  description?: string;
}
```

### SkillEntry

**Schema:**
```typescript
{
  name: string;                                              // Required, min 1 char
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  keywords?: string[];
}
```

### LanguageEntry

**Schema:**
```typescript
{
  name: string;                                              // Required, min 1 char
  proficiency?: 'basic' | 'conversational' | 'fluent' | 'native';
}
```

---

## Job Analysis Schemas

### JobAnalysisInput

**Location:** `src/validators/job.validator.ts::analyzeJobDescriptionSchema`

Input for job description analysis endpoint.

**Schema:**
```typescript
{
  jobDescription: string;  // Min 10 chars, max 10000 chars
  cvId: string | number;   // Positive integer or numeric string
}
```

**Validation Rules:**
- `jobDescription`: Length 10-10000 characters
- `cvId`: Must be positive integer or valid numeric string matching `^\d+$`

### ExtractedJobData

**Location:** `src/validators/job.validator.ts::ExtractedJobDataSchema`

Output from AI keyword extraction service.

**Schema:**
```typescript
{
  keywords: string[];
  skills: string[];
  qualifications: string[];
  responsibilities: string[];
}
```

**Validation Rules:**
- All arrays must be valid arrays (empty arrays allowed)
- All elements must be strings

### ATSBreakdown

**Location:** `src/validators/job.validator.ts::ATSBreakdownSchema`

Detailed breakdown of ATS score components.

**Schema:**
```typescript
{
  keywordDensityScore: number;           // 0-100
  formattingScore: number;               // 0-100
  sectionCompletenessScore: number;      // 0-100
  quantifiableAchievementsScore: number; // 0-100
}
```

**Validation Rules:**
- All scores must be numbers between 0 and 100 (inclusive)

### JobAnalysisResult

**Location:** `src/validators/job.validator.ts::JobAnalysisResultSchema`

Complete output from job analysis endpoint.

**Schema:**
```typescript
{
  matchScore: number;                    // 0-100
  presentKeywords: string[];
  missingKeywords: string[];
  strengthsSummary: string;
  weaknessesSummary: string;
  rawKeywords: string[];
  jobRequirements: ExtractedJobData;
  submittedAt: string;                   // ISO 8601 timestamp
  atsScore: number;                      // 0-100
  atsSuggestions: string[];
  atsQualitativeRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  atsBreakdown?: ATSBreakdown;           // Optional
}
```

**Validation Rules:**
- `matchScore`, `atsScore`: Must be numbers 0-100
- `atsQualitativeRating`: Must be one of the four enum values
- `submittedAt`: ISO 8601 date string
- `jobRequirements`: Must conform to ExtractedJobData schema

---

## Matching Schemas

### MatchingRequest

**Location:** `src/validators/matching.validator.ts::MatchingRequestSchema`

Input for CV-Job matching endpoint.

**Schema:**
```typescript
{
  cvId: string;    // Required, min 1 char
  jobId?: string;  // Optional
}
```

### MatchedKeyword

**Location:** `src/validators/matching.validator.ts::MatchedKeywordSchema`

**Schema:**
```typescript
{
  keyword: string;
  source: 'cv' | 'job';
  matchType: 'exact' | 'semantic' | 'synonym';
  confidence: number;  // 0-1
}
```

### MatchedSkill

**Location:** `src/validators/matching.validator.ts::MatchedSkillSchema`

**Schema:**
```typescript
{
  skillName: string;
  cvProficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  jobRequirement: string;
  matchStrength: number;  // 0-100
}
```

### GapAnalysis

**Location:** `src/validators/matching.validator.ts::GapAnalysisSchema`

**Schema:**
```typescript
{
  missingSkills: string[];
  missingQualifications: string[];
  experienceGap?: string;
  educationGap?: string;
  recommendations: string[];
}
```

### MatchResult

**Location:** `src/validators/matching.validator.ts::MatchResultSchema`

Complete output from matching endpoint.

**Schema:**
```typescript
{
  matchScore: number;              // 0-100
  matchedKeywords: MatchedKeyword[];
  matchedSkills: MatchedSkill[];
  missingKeywords: string[];
  missingSkills: string[];
  gapAnalysis: GapAnalysis;
  metadata: MatchMetadata;
}
```

### MatchMetadata

**Schema:**
```typescript
{
  cvId: string;
  jobId: string;
  analyzedAt: string;              // ISO 8601 timestamp
  cacheKey?: string;
  processingTimeMs?: number;
}
```

---

## Validation Rules

### General Rules

1. **Required vs Optional Fields**
   - Required fields must be present and non-null
   - Optional fields can be omitted or null
   - Empty strings are allowed for optional string fields

2. **Number Ranges**
   - Scores: 0-100 (inclusive)
   - Confidence: 0-1 (inclusive)
   - IDs: Positive integers only

3. **String Formats**
   - Dates: ISO 8601 format or `YYYY-MM-DD` or `YYYY-MM`
   - Emails: RFC 5322 compliant
   - URLs: Valid HTTP/HTTPS URLs

4. **Arrays**
   - Empty arrays are valid
   - All elements must match specified type
   - No null elements allowed

5. **Enums**
   - Must exactly match one of the defined values
   - Case-sensitive

### PII Handling

The validation middleware automatically redacts PII from error logs:
- Email addresses → `[REDACTED_EMAIL]`
- Phone numbers → `[REDACTED_PHONE]`
- Long text (>100 chars) → `[REDACTED_LONG_TEXT]`
- Known PII fields → `[REDACTED]`

---

## Error Codes

### Validation Errors (400)

**Structure:**
```json
{
  "success": false,
  "message": "Request validation failed. Please check your input.",
  "errors": [
    {
      "field": "body.jobDescription",
      "message": "Job description must be at least 10 characters long."
    }
  ]
}
```

**Common Validation Errors:**

| Error Code | Field | Message |
|------------|-------|---------|
| VAL_001 | jobDescription | Job description must be at least 10 characters long. |
| VAL_002 | jobDescription | Job description cannot exceed 10000 characters. |
| VAL_003 | cvId | CV ID must be a valid number |
| VAL_004 | email | Invalid email address |
| VAL_005 | linkedin | Invalid LinkedIn URL |
| VAL_006 | start_date | Start date must be in YYYY-MM-DD or YYYY-MM format |
| VAL_007 | matchScore | matchScore must be between 0 and 100 |
| VAL_008 | atsQualitativeRating | Invalid rating. Must be Excellent, Good, Fair, or Poor |

---

## Request/Response Examples

### POST /api/v1/jobs/analyze

**Description:** Analyze a job description against a user's CV

**Request:**
```json
{
  "jobDescription": "We are seeking a Senior Full-Stack Developer with 5+ years of experience in React, Node.js, and PostgreSQL. Strong communication skills required.",
  "cvId": "42"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "matchScore": 78,
    "presentKeywords": ["React", "Node.js", "PostgreSQL", "communication"],
    "missingKeywords": ["5+ years", "Senior"],
    "strengthsSummary": "Your skills in React, Node.js are a great match.",
    "weaknessesSummary": "Consider highlighting experience with 5+ years, Senior.",
    "rawKeywords": ["React", "Node.js", "PostgreSQL", "Full-Stack", "communication"],
    "jobRequirements": {
      "keywords": ["React", "Node.js", "PostgreSQL", "Full-Stack", "communication"],
      "skills": ["React", "Node.js", "PostgreSQL"],
      "qualifications": ["5+ years of experience"],
      "responsibilities": ["Develop full-stack applications"]
    },
    "submittedAt": "2025-12-03T10:30:00.000Z",
    "atsScore": 82,
    "atsSuggestions": [
      "Add or rephrase experience to include keywords like: 5+ years, Senior"
    ],
    "atsQualitativeRating": "Good",
    "atsBreakdown": {
      "keywordDensityScore": 80,
      "formattingScore": 100,
      "sectionCompletenessScore": 100,
      "quantifiableAchievementsScore": 50
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Request validation failed. Please check your input.",
  "errors": [
    {
      "field": "body.jobDescription",
      "message": "Job description must be at least 10 characters long."
    }
  ]
}
```

### POST /api/v1/cvs/parse

**Description:** Upload and parse a CV file

**Request:** Multipart form-data with CV file

**Success Response (202):**
```json
{
  "success": true,
  "data": {
    "cvId": 123,
    "supabaseFilePath": "user_abc123/cv_20251203_103000.pdf"
  },
  "message": "CV parsing initiated. You will be notified when complete."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid file type. Only PDF, DOCX, DOC, and TXT are allowed. Detected: image/png"
}
```

### POST /api/v1/jobs/:jobId/match

**Description:** Match a CV to a job posting

**Request:**
```json
{
  "cvId": "42"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "matchScore": 85,
    "matchedKeywords": [
      {
        "keyword": "React",
        "source": "job",
        "matchType": "exact",
        "confidence": 1.0
      },
      {
        "keyword": "JavaScript",
        "source": "job",
        "matchType": "synonym",
        "confidence": 0.9
      }
    ],
    "matchedSkills": [
      {
        "skillName": "React",
        "cvProficiency": "advanced",
        "jobRequirement": "React",
        "matchStrength": 90
      }
    ],
    "missingKeywords": ["TypeScript", "GraphQL"],
    "missingSkills": ["TypeScript"],
    "gapAnalysis": {
      "missingSkills": ["TypeScript", "GraphQL"],
      "missingQualifications": [],
      "recommendations": [
        "Consider gaining experience in: TypeScript, GraphQL"
      ]
    },
    "metadata": {
      "cvId": "42",
      "jobId": "15",
      "analyzedAt": "2025-12-03T10:35:00.000Z",
      "cacheKey": "match:42:15",
      "processingTimeMs": 1250
    }
  }
}
```

---

## Schema Versioning

All schemas follow semantic versioning. Breaking changes will increment the major version.

**Current Version:** 1.0.0

**Change Log:**
- **1.0.0** (2025-12-03): Initial schema definitions for Story 3.6
  - Added JobAnalysisResultSchema
  - Added ExtractedJobDataSchema
  - Added ATSBreakdownSchema
  - Added MatchResultSchema
  - Added comprehensive validation rules
  - Added PII redaction in validation middleware

---

## Implementation Notes

### Backend Validation

1. **API Layer:** Validation middleware applied to routes using `validate()` function
2. **Service Layer:** Runtime validation using `schema.parse()` at service boundaries
3. **Error Handling:** User-friendly error messages, PII redacted from logs

### Frontend Validation

1. **Form Validation:** Zod schemas in `frontend/src/lib/schemas/`
2. **Type Safety:** TypeScript types inferred from Zod schemas
3. **Mirrored Schemas:** Frontend schemas exactly match backend for consistency

### Testing Requirements

- Unit tests for each schema with valid/invalid data
- Integration tests for endpoint validation
- Service-level validation tests
- Minimum 80% code coverage for validators

---

## References

- **Backend Validators:** `src/validators/`
- **Frontend Schemas:** `frontend/src/lib/schemas/`
- **Type Definitions:** `src/types/`
- **Validation Middleware:** `src/middleware/validate.middleware.ts`
- **Zod Documentation:** https://zod.dev/

---

**Document Maintained By:** Development Team
**Review Cycle:** After each schema change or API version update
