# API Contracts Specification
## AI CV & Job Application Assistant

**Version:** 1.0
**Created:** 2025-11-24
**Status:** Ready for Implementation
**Phase:** Phase 2 - Solutioning (Architecture Design)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [API Design Principles](#2-api-design-principles)
3. [Authentication Endpoints](#3-authentication-endpoints)
4. [CV Management Endpoints](#4-cv-management-endpoints)
5. [Job Analysis Endpoints](#5-job-analysis-endpoints)
6. [Application Endpoints](#6-application-endpoints)
7. [User & GDPR Endpoints](#7-user--gdpr-endpoints)
8. [Common Response Patterns](#8-common-response-patterns)
9. [Error Codes Reference](#9-error-codes-reference)
10. [Rate Limiting](#10-rate-limiting)
11. [Epic Story Mapping](#11-epic-story-mapping)

---

## 1. Executive Summary

This document defines the complete REST API specification for the AI CV & Job Application Assistant backend, including all endpoints, request/response schemas, authentication requirements, and error handling.

### API Base URL

**Development:** `http://localhost:4000/api/v1`
**Production:** `https://api.aicvassistant.com/api/v1`

### API Versioning

- **Current Version:** v1
- **Format:** `/api/v1/...`
- **Future Versions:** `/api/v2/...` (backward compatible for 6 months)

### Content Type

All requests and responses use **JSON** (`application/json`) unless otherwise specified.

---

## 2. API Design Principles

### REST Conventions

1. **Resource-Oriented URLs:** Use nouns, not verbs (`/cvs` not `/getCVs`)
2. **HTTP Methods:** `GET` (read), `POST` (create), `PATCH` (update), `DELETE` (delete)
3. **Status Codes:** Follow HTTP standards (200, 201, 400, 401, 404, 500)
4. **Idempotency:** `GET`, `PUT`, `DELETE` are idempotent
5. **Pluralization:** Use plural nouns (`/cvs`, `/applications`)

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [ ... ] // Optional validation errors
  }
}
```

### Authentication

**Method:** JWT tokens in HTTP-only cookies
**Cookie Names:** `auth-token` (access), `refresh-token` (refresh)
**Protected Routes:** Indicated by 🔒 emoji in endpoint descriptions

---

## 3. Authentication Endpoints

### POST /api/v1/auth/register

**Description:** Create a new user account

**Epic 1 (Story 1.2):** User registration

**Authentication:** None (public)

**Rate Limit:** 5 requests per 15 minutes per IP

**Request:**
```json
{
  "email": "emma@example.com",
  "password": "SecurePass123!",
  "name": "Emma Johnson"
}
```

**Request Schema:**
```typescript
interface RegisterRequest {
  email: string;      // Valid email format, max 255 chars
  password: string;   // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
  name: string;       // Max 255 chars
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "emma@example.com",
      "name": "Emma Johnson",
      "created_at": "2025-11-24T10:00:00Z"
    }
  },
  "message": "Account created successfully. Please log in."
}
```

**Error Responses:**

- **400 Bad Request** (Invalid input):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "password", "message": "Password must be at least 8 characters" }
    ]
  }
}
```

- **409 Conflict** (Email already exists):
```json
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "An account with this email already exists"
  }
}
```

---

### POST /api/v1/auth/login

**Description:** Authenticate user and receive JWT tokens

**Epic 1 (Story 1.3):** User login

**Authentication:** None (public)

**Rate Limit:** 5 attempts per 15 minutes per IP

**Request:**
```json
{
  "email": "emma@example.com",
  "password": "SecurePass123!"
}
```

**Request Schema:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "emma@example.com",
      "name": "Emma Johnson"
    }
  },
  "message": "Login successful"
}
```

**Cookies Set:**
```
Set-Cookie: auth-token=<JWT>; HttpOnly; Secure; SameSite=Strict; Max-Age=900
Set-Cookie: refresh-token=<JWT>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Error Responses:**

- **401 Unauthorized** (Invalid credentials):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

### POST /api/v1/auth/logout

**Description:** Invalidate user session (clear cookies)

**Authentication:** 🔒 Required

**Request:** Empty body

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookies Cleared:**
```
Set-Cookie: auth-token=; Max-Age=0
Set-Cookie: refresh-token=; Max-Age=0
```

---

### POST /api/v1/auth/refresh

**Description:** Obtain new access token using refresh token

**Authentication:** Refresh token cookie required

**Request:** Empty body

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

**Cookies Set:**
```
Set-Cookie: auth-token=<NEW_JWT>; HttpOnly; Secure; SameSite=Strict; Max-Age=900
```

**Error Response:**

- **401 Unauthorized** (Invalid refresh token):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired refresh token. Please log in again."
  }
}
```

---

## 4. CV Management Endpoints

### POST /api/v1/cvs/parse

**Description:** Upload CV file for AI-powered parsing (PDF/DOCX/TXT)

**Epic 2 (Story 2.2):** AI-powered CV parsing

**Authentication:** 🔒 Required

**Rate Limit:** 10 requests per 15 minutes (AI endpoint)

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `cv_file`: File (max 5 MB, PDF/DOCX/TXT only)

**cURL Example:**
```bash
curl -X POST https://api.aicvassistant.com/api/v1/cvs/parse \
  -H "Cookie: auth-token=<JWT>" \
  -F "cv_file=@/path/to/cv.pdf"
```

**Success Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "cv_id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "parsing",
    "message": "CV parsing started. Check status at GET /api/v1/cvs/:id"
  }
}
```

**Error Responses:**

- **400 Bad Request** (Invalid file type):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only PDF, DOCX, and TXT files are supported"
  }
}
```

- **413 Payload Too Large** (File too large):
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 5 MB limit"
  }
}
```

---

### GET /api/v1/cvs/:id

**Description:** Get CV by ID (with parsed data if available)

**Epic 2 (Story 2.1):** Retrieve CV data

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): CV identifier

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2025-11-24T10:00:00Z",
    "updated_at": "2025-11-24T10:05:00Z",
    "personal_info": {
      "name": "Emma Johnson",
      "email": "emma@example.com",
      "phone": "+47 123 45 678",
      "address": "Oslo, Norway"
    },
    "education": [
      {
        "institution": "University of Oslo",
        "degree": "Bachelor of Science in Computer Science",
        "start_date": "2018-08-15",
        "end_date": "2021-06-01",
        "description": "Relevant coursework: Algorithms, Databases, AI"
      }
    ],
    "experience": [
      {
        "company": "Tech Startup AS",
        "title": "Junior Software Engineer",
        "start_date": "2021-08-01",
        "end_date": "2023-12-31",
        "description": "Developed web applications using React and Node.js"
      }
    ],
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"],
    "languages": [
      {
        "language": "Norwegian",
        "proficiency": "Native"
      },
      {
        "language": "English",
        "proficiency": "Fluent"
      }
    ]
  }
}
```

**Response Schema:**
```typescript
interface CVResponse {
  id: string;
  user_id: string;
  created_at: string; // ISO 8601 timestamp
  updated_at: string;
  personal_info: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    start_date: string; // ISO 8601 date
    end_date?: string;
    description?: string;
  }>;
  experience: Array<{
    company: string;
    title: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>;
  skills: string[];
  languages: Array<{
    language: string;
    proficiency: string; // e.g., "Native", "Fluent", "Conversational"
  }>;
}
```

**Error Responses:**

- **404 Not Found** (CV doesn't exist):
```json
{
  "success": false,
  "error": {
    "code": "CV_NOT_FOUND",
    "message": "CV not found"
  }
}
```

- **403 Forbidden** (Not authorized):
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not authorized to access this CV"
  }
}
```

---

### POST /api/v1/cvs

**Description:** Create a new CV manually (without parsing)

**Epic 2 (Story 2.1):** Manual CV creation

**Authentication:** 🔒 Required

**Request:**
```json
{
  "personal_info": {
    "name": "Emma Johnson",
    "email": "emma@example.com",
    "phone": "+47 123 45 678",
    "address": "Oslo, Norway"
  },
  "education": [
    {
      "institution": "University of Oslo",
      "degree": "Bachelor of Science in Computer Science",
      "start_date": "2018-08-15",
      "end_date": "2021-06-01",
      "description": "Relevant coursework: Algorithms, Databases, AI"
    }
  ],
  "experience": [
    {
      "company": "Tech Startup AS",
      "title": "Junior Software Engineer",
      "start_date": "2021-08-01",
      "end_date": "2023-12-31",
      "description": "Developed web applications using React and Node.js"
    }
  ],
  "skills": ["JavaScript", "TypeScript", "React"],
  "languages": [
    {
      "language": "Norwegian",
      "proficiency": "Native"
    }
  ]
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2025-11-24T10:00:00Z",
    "updated_at": "2025-11-24T10:00:00Z",
    "personal_info": { ... },
    "education": [ ... ],
    "experience": [ ... ],
    "skills": [ ... ],
    "languages": [ ... ]
  },
  "message": "CV created successfully"
}
```

---

### PATCH /api/v1/cvs/:id

**Description:** Update existing CV (partial update)

**Epic 2 (Story 2.2):** CV editing

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): CV identifier

**Request (partial update, only include fields to change):**
```json
{
  "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Python"]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2025-11-24T10:00:00Z",
    "updated_at": "2025-11-24T10:30:00Z",
    "personal_info": { ... },
    "education": [ ... ],
    "experience": [ ... ],
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Python"],
    "languages": [ ... ]
  },
  "message": "CV updated successfully"
}
```

**Note:** Every update creates a new version (see `GET /api/v1/cvs/:id/versions`)

---

### DELETE /api/v1/cvs/:id

**Description:** Delete CV permanently

**Epic 2 (Story 2.2):** CV deletion

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): CV identifier

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "CV deleted successfully"
}
```

**Note:** Cascades to `cv_versions`, `generated_outputs`, `applications`

---

### GET /api/v1/cvs/:id/versions

**Description:** Get CV version history

**Epic 2 (Story 2.9):** CV versioning

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): CV identifier

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "version-uuid-1",
      "cv_id": "550e8400-e29b-41d4-a716-446655440000",
      "version_number": 3,
      "created_at": "2025-11-24T11:00:00Z",
      "snapshot": { ... } // Full CV data at version 3
    },
    {
      "id": "version-uuid-2",
      "cv_id": "550e8400-e29b-41d4-a716-446655440000",
      "version_number": 2,
      "created_at": "2025-11-24T10:30:00Z",
      "snapshot": { ... }
    },
    {
      "id": "version-uuid-3",
      "cv_id": "550e8400-e29b-41d4-a716-446655440000",
      "version_number": 1,
      "created_at": "2025-11-24T10:00:00Z",
      "snapshot": { ... }
    }
  ]
}
```

---

### POST /api/v1/cvs/:id/restore-version

**Description:** Restore CV to a previous version

**Epic 2 (Story 2.9):** Version rollback

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): CV identifier

**Request:**
```json
{
  "version_number": 2
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2025-11-24T10:00:00Z",
    "updated_at": "2025-11-24T11:15:00Z",
    "personal_info": { ... }, // Restored from version 2
    "education": [ ... ],
    "experience": [ ... ],
    "skills": [ ... ],
    "languages": [ ... ]
  },
  "message": "CV restored to version 2"
}
```

**Note:** Restoring creates a new version (e.g., version 4 with version 2's data)

---

### GET /api/v1/cvs/:id/download

**Description:** Download CV as PDF or DOCX

**Epic 2 (Story 2.7):** CV download

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): CV identifier

**Query Parameters:**
- `format` (string): `pdf` or `docx` (default: `pdf`)
- `template` (string): `modern`, `classic`, `minimalist` (default: `modern`)

**Example:**
```
GET /api/v1/cvs/550e8400-e29b-41d4-a716-446655440000/download?format=pdf&template=modern
```

**Success Response (200 OK):**
- **Content-Type:** `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Content-Disposition:** `attachment; filename="Emma_Johnson_CV.pdf"`
- **Body:** Binary file data

**Error Response:**

- **404 Not Found** (CV doesn't exist):
```json
{
  "success": false,
  "error": {
    "code": "CV_NOT_FOUND",
    "message": "CV not found"
  }
}
```

---

## 5. Job Analysis Endpoints

### POST /api/v1/jobs/analyze

**Description:** Analyze job description with AI (extract keywords, requirements)

**Epic 3 (Story 3.2):** Job description text extraction

**Authentication:** 🔒 Required

**Rate Limit:** 10 requests per 15 minutes (AI endpoint)

**Request:**
```json
{
  "title": "Marketing Coordinator",
  "company": "Innovative Tech AS",
  "description": "We are seeking a Marketing Coordinator to join our team...\n\nRequirements:\n- Bachelor's degree in Marketing\n- 2+ years of experience in digital marketing\n- Proficiency in social media platforms\n- Strong project management skills\n\nPreferred:\n- Experience with SEO/SEM\n- Graphic design skills (Adobe Creative Suite)"
}
```

**Request Schema:**
```typescript
interface JobAnalyzeRequest {
  title?: string;      // Optional, can be extracted from description
  company?: string;    // Optional
  description: string; // Required, max 10,000 chars
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job_id": "job-uuid-123",
    "title": "Marketing Coordinator",
    "company": "Innovative Tech AS",
    "extracted_keywords": [
      "marketing",
      "digital marketing",
      "social media",
      "project management",
      "SEO",
      "SEM",
      "graphic design"
    ],
    "required_skills": [
      {
        "skill": "Bachelor's degree in Marketing",
        "importance": "required"
      },
      {
        "skill": "2+ years digital marketing experience",
        "importance": "required"
      },
      {
        "skill": "Social media proficiency",
        "importance": "required"
      },
      {
        "skill": "Project management",
        "importance": "required"
      },
      {
        "skill": "SEO/SEM",
        "importance": "preferred"
      },
      {
        "skill": "Graphic design (Adobe Creative Suite)",
        "importance": "preferred"
      }
    ],
    "created_at": "2025-11-24T12:00:00Z",
    "auto_delete_at": "2025-11-25T12:00:00Z"
  },
  "message": "Job description analyzed successfully"
}
```

**Response Schema:**
```typescript
interface JobAnalyzeResponse {
  job_id: string;
  title: string;
  company: string;
  extracted_keywords: string[];
  required_skills: Array<{
    skill: string;
    importance: "required" | "preferred" | "nice-to-have";
  }>;
  created_at: string;
  auto_delete_at: string; // 24 hours after creation
}
```

**Error Response:**

- **400 Bad Request** (Description too long):
```json
{
  "success": false,
  "error": {
    "code": "DESCRIPTION_TOO_LONG",
    "message": "Job description exceeds 10,000 character limit"
  }
}
```

---

### GET /api/v1/jobs/:id/match-score

**Description:** Get match score between user's CV and job posting

**Epic 3 (Story 3.4):** Match score calculation

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): Job posting identifier

**Query Parameters:**
- `cv_id` (UUID, required): CV to compare against job

**Example:**
```
GET /api/v1/jobs/job-uuid-123/match-score?cv_id=cv-uuid-456
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job_id": "job-uuid-123",
    "cv_id": "cv-uuid-456",
    "match_score": 78,
    "strengths": [
      "2+ years experience in digital marketing (matches requirement)",
      "Strong social media portfolio (matches requirement)",
      "Project management certification (matches requirement)"
    ],
    "weaknesses": [
      "Missing: Bachelor's degree in Marketing (has Business Administration instead)",
      "Missing: SEO/SEM experience",
      "Missing: Graphic design skills"
    ],
    "matched_keywords": [
      "digital marketing",
      "social media",
      "project management"
    ],
    "missing_keywords": [
      "SEO",
      "SEM",
      "graphic design",
      "Adobe Creative Suite"
    ]
  }
}
```

**Response Schema:**
```typescript
interface MatchScoreResponse {
  job_id: string;
  cv_id: string;
  match_score: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  matched_keywords: string[];
  missing_keywords: string[];
}
```

---

### GET /api/v1/jobs/:id/ats-score

**Description:** Get ATS (Applicant Tracking System) compatibility score

**Epic 3 (Story 3.5):** ATS score calculation

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): Job posting identifier

**Query Parameters:**
- `cv_id` (UUID, required): CV to evaluate

**Example:**
```
GET /api/v1/jobs/job-uuid-123/ats-score?cv_id=cv-uuid-456
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job_id": "job-uuid-123",
    "cv_id": "cv-uuid-456",
    "ats_score": 85,
    "rating": "Good",
    "breakdown": {
      "keyword_presence": 75,
      "formatting_simplicity": 95,
      "section_completeness": 90,
      "quantifiable_achievements": 80
    },
    "suggestions": [
      "Add more industry-specific keywords from the job description",
      "Include quantifiable results in work experience (e.g., 'Increased social media engagement by 40%')",
      "Consider adding a 'Technical Skills' section for better ATS parsing"
    ]
  }
}
```

**Response Schema:**
```typescript
interface ATSScoreResponse {
  job_id: string;
  cv_id: string;
  ats_score: number; // 0-100
  rating: "Excellent" | "Good" | "Fair" | "Poor";
  breakdown: {
    keyword_presence: number; // 0-100
    formatting_simplicity: number;
    section_completeness: number;
    quantifiable_achievements: number;
  };
  suggestions: string[];
}
```

---

### GET /api/v1/jobs/:id/gap-analysis

**Description:** Get detailed skill gap analysis

**Epic 3 (Story 3.4):** Gap analysis

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): Job posting identifier

**Query Parameters:**
- `cv_id` (UUID, required): CV to analyze

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "job_id": "job-uuid-123",
    "cv_id": "cv-uuid-456",
    "gap_analysis": [
      {
        "skill": "Bachelor's degree in Marketing",
        "status": "missing",
        "user_has": "Bachelor of Business Administration",
        "recommendation": "Highlight transferable marketing coursework from your degree"
      },
      {
        "skill": "2+ years digital marketing experience",
        "status": "match",
        "user_has": "3 years as Digital Marketing Specialist",
        "recommendation": "Emphasize this experience in your tailored CV"
      },
      {
        "skill": "SEO/SEM",
        "status": "missing",
        "user_has": null,
        "recommendation": "Consider taking an SEO fundamentals course (e.g., Google Analytics Certification)"
      }
    ]
  }
}
```

**Response Schema:**
```typescript
interface GapAnalysisResponse {
  job_id: string;
  cv_id: string;
  gap_analysis: Array<{
    skill: string;
    status: "match" | "partial" | "missing";
    user_has: string | null;
    recommendation: string;
  }>;
}
```

---

## 6. Application Endpoints

### POST /api/v1/applications/generate

**Description:** Generate tailored CV and cover letter for a job

**Epic 4 (Story 4.1, 4.2):** Tailored application generation

**Authentication:** 🔒 Required

**Rate Limit:** 10 requests per 15 minutes (AI endpoint)

**Request:**
```json
{
  "cv_id": "cv-uuid-456",
  "job_id": "job-uuid-123"
}
```

**Request Schema:**
```typescript
interface GenerateApplicationRequest {
  cv_id: string;  // Base CV to tailor
  job_id: string; // Job posting to tailor for
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "output_id": "output-uuid-789",
    "cv_id": "cv-uuid-456",
    "job_id": "job-uuid-123",
    "tailored_cv": {
      "personal_info": { ... },
      "education": [ ... ],
      "experience": [
        {
          "company": "Tech Startup AS",
          "title": "Junior Software Engineer",
          "start_date": "2021-08-01",
          "end_date": "2023-12-31",
          "description": "Led development of marketing automation web applications using React and Node.js, increasing user engagement by 35%. Collaborated with marketing team to optimize social media integration features." // AI-tailored description
        }
      ],
      "skills": ["Digital Marketing", "JavaScript", "TypeScript", "React", "Node.js", "Social Media APIs"],
      "languages": [ ... ]
    },
    "cover_letter_text": "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Marketing Coordinator position at Innovative Tech AS...\n\n[AI-generated cover letter content]\n\nSincerely,\nEmma Johnson",
    "ats_score": 92,
    "match_score": 85,
    "feedback_notes": [
      "Emphasized marketing-related projects in work experience",
      "Added 'Digital Marketing' to skills section",
      "Highlighted social media platform proficiency",
      "Cover letter addresses 3 key job requirements"
    ],
    "created_at": "2025-11-24T12:30:00Z"
  },
  "message": "Tailored application generated successfully"
}
```

**Response Schema:**
```typescript
interface GenerateApplicationResponse {
  output_id: string;
  cv_id: string;
  job_id: string;
  tailored_cv: CVResponse; // Same structure as GET /cvs/:id
  cover_letter_text: string;
  ats_score: number;
  match_score: number;
  feedback_notes: string[];
  created_at: string;
}
```

---

### GET /api/v1/applications

**Description:** Get user's application history (with filters)

**Epic 4 (Story 4.4):** Application history

**Authentication:** 🔒 Required

**Query Parameters:**
- `status` (string, optional): Filter by status (`applied`, `interview_scheduled`, `interviewing`, `offered`, `rejected`, `withdrawn`, `archived`)
- `limit` (number, optional): Number of results (default: 20, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Example:**
```
GET /api/v1/applications?status=applied&limit=10&offset=0
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app-uuid-111",
        "output_id": "output-uuid-789",
        "status": "applied",
        "notes": "Applied via LinkedIn on Nov 24. Follow up on Dec 1.",
        "created_at": "2025-11-24T13:00:00Z",
        "updated_at": "2025-11-24T13:00:00Z",
        "output": {
          "job_title": "Marketing Coordinator",
          "company": "Innovative Tech AS",
          "ats_score": 92,
          "match_score": 85
        }
      },
      {
        "id": "app-uuid-222",
        "output_id": "output-uuid-456",
        "status": "interview_scheduled",
        "notes": "Phone interview scheduled for Nov 30 at 2pm",
        "created_at": "2025-11-20T10:00:00Z",
        "updated_at": "2025-11-23T14:00:00Z",
        "output": {
          "job_title": "Senior Marketing Manager",
          "company": "Global Corp",
          "ats_score": 88,
          "match_score": 79
        }
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 10,
      "offset": 0,
      "has_more": true
    }
  }
}
```

---

### GET /api/v1/applications/:id

**Description:** Get application details by ID

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): Application identifier

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "app-uuid-111",
    "user_id": "user-uuid-123",
    "output_id": "output-uuid-789",
    "status": "applied",
    "notes": "Applied via LinkedIn on Nov 24. Follow up on Dec 1.",
    "created_at": "2025-11-24T13:00:00Z",
    "updated_at": "2025-11-24T13:00:00Z",
    "output": {
      "output_id": "output-uuid-789",
      "cv_id": "cv-uuid-456",
      "job_id": "job-uuid-123",
      "tailored_cv": { ... },
      "cover_letter_text": "...",
      "ats_score": 92,
      "match_score": 85,
      "feedback_notes": [ ... ]
    }
  }
}
```

---

### PATCH /api/v1/applications/:id

**Description:** Update application status and notes

**Epic 4 (Story 4.4):** Update application

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): Application identifier

**Request:**
```json
{
  "status": "interview_scheduled",
  "notes": "Phone interview scheduled for Nov 30 at 2pm. Prep: Review project management examples."
}
```

**Request Schema:**
```typescript
interface UpdateApplicationRequest {
  status?: "applied" | "interview_scheduled" | "interviewing" | "offered" | "rejected" | "withdrawn" | "archived";
  notes?: string;
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "app-uuid-111",
    "output_id": "output-uuid-789",
    "status": "interview_scheduled",
    "notes": "Phone interview scheduled for Nov 30 at 2pm. Prep: Review project management examples.",
    "created_at": "2025-11-24T13:00:00Z",
    "updated_at": "2025-11-25T10:00:00Z"
  },
  "message": "Application updated successfully"
}
```

---

### DELETE /api/v1/applications/:id

**Description:** Delete application

**Authentication:** 🔒 Required

**URL Parameters:**
- `id` (UUID): Application identifier

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

---

### GET /api/v1/applications/export

**Description:** Export application history as CSV

**Epic 4 (Story 4.4):** Export applications

**Authentication:** 🔒 Required

**Query Parameters:**
- `status` (string, optional): Filter by status

**Example:**
```
GET /api/v1/applications/export?status=applied
```

**Success Response (200 OK):**
- **Content-Type:** `text/csv`
- **Content-Disposition:** `attachment; filename="applications_export.csv"`
- **Body:**
```csv
Application ID,Job Title,Company,Status,ATS Score,Match Score,Applied Date,Last Updated,Notes
app-uuid-111,Marketing Coordinator,Innovative Tech AS,applied,92,85,2025-11-24,2025-11-24,Applied via LinkedIn...
app-uuid-222,Senior Marketing Manager,Global Corp,interview_scheduled,88,79,2025-11-20,2025-11-23,Phone interview...
```

---

## 7. User & GDPR Endpoints

### GET /api/v1/user/profile

**Description:** Get user profile

**Authentication:** 🔒 Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid-123",
    "email": "emma@example.com",
    "name": "Emma Johnson",
    "created_at": "2025-11-01T10:00:00Z",
    "last_login_at": "2025-11-24T09:00:00Z",
    "consent": {
      "essential": true,
      "ai_training": false,
      "marketing": false
    }
  }
}
```

---

### PATCH /api/v1/user/profile

**Description:** Update user profile

**Authentication:** 🔒 Required

**Request:**
```json
{
  "name": "Emma Marie Johnson"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid-123",
    "email": "emma@example.com",
    "name": "Emma Marie Johnson",
    "created_at": "2025-11-01T10:00:00Z",
    "last_login_at": "2025-11-24T09:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

---

### PATCH /api/v1/user/consent

**Description:** Update GDPR consent preferences

**Epic 5 (Story 5.1):** Consent management

**Authentication:** 🔒 Required

**Request:**
```json
{
  "ai_training": true,
  "marketing": false
}
```

**Request Schema:**
```typescript
interface UpdateConsentRequest {
  ai_training?: boolean;
  marketing?: boolean;
  // Note: 'essential' cannot be changed (always true)
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "consent": {
      "essential": true,
      "ai_training": true,
      "marketing": false,
      "updated_at": "2025-11-24T14:00:00Z"
    }
  },
  "message": "Consent preferences updated successfully"
}
```

**Note:** Every consent change is logged in `consent_logs` table for audit trail

---

### POST /api/v1/user/data-export

**Description:** Request GDPR data export

**Epic 5 (Story 5.2):** Data export

**Authentication:** 🔒 Required

**Request:** Empty body

**Success Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "request_id": "export-request-uuid-999",
    "status": "pending",
    "created_at": "2025-11-24T14:30:00Z",
    "estimated_completion": "2025-11-24T14:32:00Z"
  },
  "message": "Data export request received. You will receive an email when your export is ready."
}
```

**Response Schema:**
```typescript
interface DataExportResponse {
  request_id: string;
  status: "pending" | "processing" | "ready" | "expired";
  created_at: string;
  estimated_completion: string;
}
```

**Note:** Background job processes export. Email sent when ready with download link.

---

### GET /api/v1/user/data-export/:token

**Description:** Download GDPR data export

**Authentication:** None (token-based authentication)

**URL Parameters:**
- `token` (string): Secure download token (sent via email)

**Success Response (200 OK):**
- **Content-Type:** `application/json`
- **Content-Disposition:** `attachment; filename="emma_johnson_data_export.json"`
- **Body:** JSON file (see Database Schema Section 13 for structure)

**Error Responses:**

- **404 Not Found** (Invalid or expired token):
```json
{
  "success": false,
  "error": {
    "code": "EXPORT_NOT_FOUND",
    "message": "Export not found or has expired"
  }
}
```

---

### DELETE /api/v1/user/account

**Description:** Permanently delete user account and all data (GDPR right to be forgotten)

**Epic 5 (Story 5.2):** Account deletion

**Authentication:** 🔒 Required

**Request:**
```json
{
  "confirmation": "DELETE MY ACCOUNT"
}
```

**Request Schema:**
```typescript
interface DeleteAccountRequest {
  confirmation: string; // Must exactly match "DELETE MY ACCOUNT" (case-insensitive)
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Account and all data have been permanently deleted. You will be logged out shortly."
}
```

**Note:**
- All user data is deleted: `cvs`, `cv_versions`, `job_postings`, `generated_outputs`, `applications`, `consent_logs`
- User is immediately logged out (cookies cleared)
- Confirmation email sent
- Backups deleted within 30 days (GDPR compliance)

---

## 8. Common Response Patterns

### Success Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [ ... ] // Optional (for validation errors)
  }
}
```

### Pagination Format

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "total": 50,
      "limit": 20,
      "offset": 0,
      "has_more": true
    }
  }
}
```

---

## 9. Error Codes Reference

### Authentication Errors (401)

| Code | Message | HTTP Status |
|------|---------|-------------|
| `INVALID_CREDENTIALS` | Invalid email or password | 401 |
| `INVALID_TOKEN` | Invalid or expired token | 401 |
| `AUTHENTICATION_REQUIRED` | Authentication required | 401 |

### Authorization Errors (403)

| Code | Message | HTTP Status |
|------|---------|-------------|
| `FORBIDDEN` | You are not authorized to access this resource | 403 |

### Validation Errors (400)

| Code | Message | HTTP Status |
|------|---------|-------------|
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `INVALID_FILE_TYPE` | Only PDF, DOCX, and TXT files are supported | 400 |
| `FILE_TOO_LARGE` | File size exceeds 5 MB limit | 413 |
| `DESCRIPTION_TOO_LONG` | Job description exceeds 10,000 character limit | 400 |

### Resource Errors (404)

| Code | Message | HTTP Status |
|------|---------|-------------|
| `CV_NOT_FOUND` | CV not found | 404 |
| `JOB_NOT_FOUND` | Job posting not found | 404 |
| `APPLICATION_NOT_FOUND` | Application not found | 404 |
| `USER_NOT_FOUND` | User not found | 404 |
| `EXPORT_NOT_FOUND` | Export not found or has expired | 404 |

### Conflict Errors (409)

| Code | Message | HTTP Status |
|------|---------|-------------|
| `EMAIL_EXISTS` | An account with this email already exists | 409 |

### Rate Limit Errors (429)

| Code | Message | HTTP Status |
|------|---------|-------------|
| `RATE_LIMIT_EXCEEDED` | Too many requests. Please try again later. | 429 |

### Server Errors (500)

| Code | Message | HTTP Status |
|------|---------|-------------|
| `INTERNAL_SERVER_ERROR` | An unexpected error occurred | 500 |
| `AI_SERVICE_ERROR` | AI service temporarily unavailable | 503 |

---

## 10. Rate Limiting

### Rate Limit Headers

All responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700834400
```

### Rate Limit Tiers

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| **General Endpoints** | 100 requests | 15 minutes |
| **AI Endpoints** (parse, analyze, generate) | 10 requests | 15 minutes |
| **Auth Endpoints** (login, register) | 5 requests | 15 minutes |

### Rate Limit Exceeded Response (429)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 12 minutes.",
    "retry_after": 720
  }
}
```

---

## 11. Epic Story Mapping

### API Endpoints Coverage by Epic

| Epic | Stories | Endpoints |
|------|---------|-----------|
| **Epic 1** | 1.2-1.3 | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` |
| **Epic 2** | 2.1-2.9 | `POST /cvs/parse`, `GET /cvs/:id`, `POST /cvs`, `PATCH /cvs/:id`, `DELETE /cvs/:id`, `GET /cvs/:id/versions`, `POST /cvs/:id/restore-version`, `GET /cvs/:id/download` |
| **Epic 3** | 3.1-3.6 | `POST /jobs/analyze`, `GET /jobs/:id/match-score`, `GET /jobs/:id/ats-score`, `GET /jobs/:id/gap-analysis` |
| **Epic 4** | 4.1-4.5 | `POST /applications/generate`, `GET /applications`, `GET /applications/:id`, `PATCH /applications/:id`, `DELETE /applications/:id`, `GET /applications/export` |
| **Epic 5** | 5.1-5.2 | `PATCH /user/consent`, `POST /user/data-export`, `GET /user/data-export/:token`, `DELETE /user/account` |

---

## Conclusion

This API Contracts Specification provides complete REST API documentation for the AI CV & Job Application Assistant backend, including all endpoints, request/response schemas, authentication, error handling, and rate limiting.

### Key Takeaways

1. **REST principles** with resource-oriented URLs and HTTP methods
2. **JWT authentication** via HTTP-only cookies
3. **Consistent response format** (success/error with codes)
4. **Comprehensive error handling** with specific error codes
5. **Rate limiting** to protect AI endpoints (10 req/15min)
6. **GDPR compliance** built-in (consent, export, deletion)
7. **Type-safe schemas** (TypeScript interfaces provided)

### Next Steps

1. **Implement backend** routes following this specification
2. **Generate OpenAPI/Swagger docs** from this specification
3. **Write integration tests** for all endpoints
4. **Set up Postman collection** for manual testing
5. **Deploy to staging** for frontend integration

---

**Document Status:** ✅ Ready for Implementation
**Last Updated:** 2025-11-24
**Maintainer:** BMM Architect Agent (Winston)
