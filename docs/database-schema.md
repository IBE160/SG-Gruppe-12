# Database Schema Specification
## AI CV & Job Application Assistant

**Version:** 1.0
**Created:** 2025-11-24
**Status:** Ready for Implementation
**Phase:** Phase 2 - Solutioning (Architecture Design)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Database Choice Rationale](#2-database-choice-rationale)
3. [Complete Table Definitions](#3-complete-table-definitions)
4. [Relationships Diagram](#4-relationships-diagram)
5. [Indexes for Performance](#5-indexes-for-performance)
6. [Migration Strategy](#6-migration-strategy)
7. [Data Retention Policies](#7-data-retention-policies)
8. [Prisma Schema Implementation](#8-prisma-schema-implementation)
9. [Epic Story Mapping](#9-epic-story-mapping)

---

## 1. Executive Summary

This document defines the complete PostgreSQL database schema for the AI CV & Job Application Assistant platform, hosted on Supabase Cloud for GDPR-compliant data storage.

### Key Design Decisions

1. **Database:** PostgreSQL 15+ (Supabase managed)
2. **ORM:** Prisma 5.x (schema-first approach)
3. **Primary Keys:** UUID (universally unique, secure)
4. **Timestamps:** `created_at`, `updated_at` on all tables (auto-managed)
5. **JSON Storage:** JSONB columns for structured CV data (flexible, queryable)
6. **Foreign Keys:** Cascading deletes for GDPR compliance (user deletion removes all data)
7. **Indexes:** Strategic indexes on foreign keys, email, timestamps, status fields

### Schema Philosophy

- **GDPR-First:** Built-in support for data export, deletion, consent tracking
- **Performance-Optimized:** Strategic indexes, JSONB for flexibility without N+1 queries
- **Audit Trail:** Consent logs, version history, deletion logs
- **Data Minimization:** Job descriptions auto-deleted after 24 hours (copyright compliance)
- **Type-Safe:** Prisma-generated TypeScript types for compile-time safety

---

## 2. Database Choice Rationale

### Why PostgreSQL?

**Technical Advantages:**
1. **ACID Compliance:** Transactions ensure data integrity (critical for CV versioning)
2. **JSONB Support:** Native JSON storage with indexing (flexible CV schema without migrations)
3. **Full-Text Search:** Built-in search for job descriptions, CV content (future feature)
4. **Advanced Features:** CTEs, window functions, array types
5. **Mature Ecosystem:** Well-supported by Prisma, extensive tooling

**Alternatives Considered:**

| Database | Pros | Cons | Decision |
|----------|------|------|----------|
| **MySQL** | Popular, fast reads | Limited JSON support, less advanced features | ❌ PostgreSQL superior for this use case |
| **MongoDB** | Flexible schema, horizontal scaling | No ACID guarantees, less mature ORM support | ❌ Overkill for MVP, less type-safe |
| **SQLite** | Simple, serverless | Not suitable for production web apps | ❌ Not scalable |

**Decision:** PostgreSQL via Supabase (managed, GDPR-compliant EU hosting)

### Why Supabase?

1. **GDPR Compliance:** EU data centers (Frankfurt, London)
2. **Managed Service:** Automatic backups, updates, monitoring
3. **Integrated Services:** Storage (for CV uploads), Auth (backup option)
4. **Cost-Effective:** Free tier sufficient for MVP (500 MB database, 1 GB storage)
5. **Developer Experience:** Web UI (Supabase Studio), SQL editor, real-time subscriptions

---

## 3. Complete Table Definitions

### Table: `users`

**Purpose:** Store user accounts and authentication credentials

**Epic 1 (Story 1.2):** User registration and account creation

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP,
  consent_essential BOOLEAN NOT NULL DEFAULT true,
  consent_ai_training BOOLEAN NOT NULL DEFAULT false,
  consent_marketing BOOLEAN NOT NULL DEFAULT false
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email (login) |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `name` | VARCHAR(255) | | User full name |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last profile update |
| `last_login_at` | TIMESTAMP | | Last successful login |
| `consent_essential` | BOOLEAN | NOT NULL, DEFAULT true | Essential data processing (required) |
| `consent_ai_training` | BOOLEAN | NOT NULL, DEFAULT false | AI training consent (opt-in per GDPR) |
| `consent_marketing` | BOOLEAN | NOT NULL, DEFAULT false | Marketing emails consent (opt-in) |

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
```

---

### Table: `cvs`

**Purpose:** Store structured CV data for each user

**Epic 2 (Story 2.1):** Structured CV data model

```sql
CREATE TABLE cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  personal_info JSONB NOT NULL DEFAULT '{}',
  education JSONB NOT NULL DEFAULT '[]',
  experience JSONB NOT NULL DEFAULT '[]',
  skills TEXT[] NOT NULL DEFAULT '{}',
  languages JSONB NOT NULL DEFAULT '[]'
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique CV identifier |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | Owner of this CV |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | CV creation time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last CV update |
| `personal_info` | JSONB | NOT NULL, DEFAULT '{}' | Name, email, phone, address (structured) |
| `education` | JSONB | NOT NULL, DEFAULT '[]' | Array of education entries |
| `experience` | JSONB | NOT NULL, DEFAULT '[]' | Array of work experience entries |
| `skills` | TEXT[] | NOT NULL, DEFAULT '{}' | Array of skill strings |
| `languages` | JSONB | NOT NULL, DEFAULT '[]' | Array of language objects (name, proficiency) |

**JSONB Structure Examples:**

```json
// personal_info
{
  "name": "Emma Johnson",
  "email": "emma@example.com",
  "phone": "+47 123 45 678",
  "address": "Oslo, Norway"
}

// education (array of objects)
[
  {
    "institution": "University of Oslo",
    "degree": "Bachelor of Science in Computer Science",
    "start_date": "2018-08-15",
    "end_date": "2021-06-01",
    "description": "Relevant coursework: Algorithms, Databases, AI"
  }
]

// experience (array of objects)
[
  {
    "company": "Tech Startup AS",
    "title": "Junior Software Engineer",
    "start_date": "2021-08-01",
    "end_date": "2023-12-31",
    "description": "Developed web applications using React and Node.js"
  }
]

// skills (PostgreSQL TEXT[] array)
["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"]

// languages (array of objects)
[
  {
    "language": "Norwegian",
    "proficiency": "Native"
  },
  {
    "language": "English",
    "proficiency": "Fluent"
  }
]
```

**Indexes:**
```sql
CREATE INDEX idx_cvs_user_id ON cvs(user_id);
CREATE INDEX idx_cvs_created_at ON cvs(created_at);
CREATE INDEX idx_cvs_skills ON cvs USING GIN(skills); -- GIN index for array search
```

**Foreign Key Cascade:**
- `ON DELETE CASCADE`: When user is deleted, all their CVs are automatically deleted (GDPR compliance)

---

### Table: `cv_versions`

**Purpose:** Track CV edit history for versioning and rollback

**Epic 2 (Story 2.9):** CV data versioning

```sql
CREATE TABLE cv_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(cv_id, version_number)
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique version identifier |
| `cv_id` | UUID | FOREIGN KEY → cvs(id), NOT NULL | CV this version belongs to |
| `version_number` | INTEGER | NOT NULL | Sequential version number (1, 2, 3...) |
| `snapshot` | JSONB | NOT NULL | Full CV data at this version (all fields) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Version creation time |

**JSONB Structure Example:**

```json
// snapshot (full CV data)
{
  "personal_info": { ... },
  "education": [ ... ],
  "experience": [ ... ],
  "skills": [ ... ],
  "languages": [ ... ]
}
```

**Indexes:**
```sql
CREATE INDEX idx_cv_versions_cv_id ON cv_versions(cv_id);
CREATE INDEX idx_cv_versions_created_at ON cv_versions(created_at);
CREATE UNIQUE INDEX idx_cv_versions_cv_version ON cv_versions(cv_id, version_number);
```

**Business Logic:**
- Every CV update creates a new version (incremental `version_number`)
- Versions allow rollback to previous state (Story 2.9)
- `snapshot` stores complete CV data (no deltas, simplifies restore logic)

---

### Table: `job_postings`

**Purpose:** Store analyzed job descriptions (temporary, auto-deleted after 24 hours)

**Epic 3 (Story 3.1, 3.2):** Job description analysis

```sql
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  company VARCHAR(255),
  description TEXT NOT NULL,
  extracted_keywords TEXT[] NOT NULL DEFAULT '{}',
  required_skills JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  auto_delete_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique job posting identifier |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | User who analyzed this job |
| `title` | VARCHAR(255) | | Job title (e.g., "Marketing Coordinator") |
| `company` | VARCHAR(255) | | Company name |
| `description` | TEXT | NOT NULL | Full job description (pasted by user) |
| `extracted_keywords` | TEXT[] | NOT NULL, DEFAULT '{}' | AI-extracted keywords |
| `required_skills` | JSONB | NOT NULL, DEFAULT '[]' | AI-extracted required skills (structured) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Analysis timestamp |
| `auto_delete_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() + 24h | Auto-deletion timestamp (24 hours) |

**JSONB Structure Example:**

```json
// required_skills
[
  {
    "skill": "Project Management",
    "importance": "required"
  },
  {
    "skill": "Social Media Marketing",
    "importance": "preferred"
  }
]
```

**Indexes:**
```sql
CREATE INDEX idx_job_postings_user_id ON job_postings(user_id);
CREATE INDEX idx_job_postings_auto_delete_at ON job_postings(auto_delete_at); -- For cleanup job
```

**Data Retention:**
- **Auto-delete after 24 hours** to minimize copyright risk (raw job ads)
- Background job (cron) runs hourly: `DELETE FROM job_postings WHERE auto_delete_at < NOW()`
- User can manually delete earlier via API

---

### Table: `generated_outputs`

**Purpose:** Store AI-generated tailored CVs and cover letters

**Epic 4 (Story 4.1, 4.2):** Tailored application generation

```sql
CREATE TABLE generated_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job_postings(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tailored_cv JSONB NOT NULL,
  cover_letter_text TEXT NOT NULL,
  ats_score INTEGER,
  match_score INTEGER,
  feedback_notes TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique output identifier |
| `cv_id` | UUID | FOREIGN KEY → cvs(id), NOT NULL | Base CV used for tailoring |
| `job_id` | UUID | FOREIGN KEY → job_postings(id), NULL | Job posting (NULL if job deleted) |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | Owner of this output |
| `tailored_cv` | JSONB | NOT NULL | AI-tailored CV data (same structure as cvs table) |
| `cover_letter_text` | TEXT | NOT NULL | AI-generated cover letter (plain text) |
| `ats_score` | INTEGER | | ATS compatibility score (0-100) |
| `match_score` | INTEGER | | CV-job match score (0-100) |
| `feedback_notes` | TEXT[] | | AI-generated feedback (e.g., "Add quantifiable results") |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Generation timestamp |

**Indexes:**
```sql
CREATE INDEX idx_generated_outputs_user_id ON generated_outputs(user_id);
CREATE INDEX idx_generated_outputs_cv_id ON generated_outputs(cv_id);
CREATE INDEX idx_generated_outputs_job_id ON generated_outputs(job_id);
CREATE INDEX idx_generated_outputs_created_at ON generated_outputs(created_at);
```

**Foreign Key Behavior:**
- `job_id ON DELETE SET NULL`: If job posting is deleted (24h auto-delete), output remains but `job_id` becomes NULL
- `cv_id`, `user_id ON DELETE CASCADE`: If user deletes CV or account, outputs are deleted (GDPR)

---

### Table: `applications`

**Purpose:** Track user's job applications with status and notes

**Epic 4 (Story 4.4):** Application history

```sql
CREATE TYPE application_status AS ENUM (
  'applied',
  'interview_scheduled',
  'interviewing',
  'offered',
  'rejected',
  'withdrawn',
  'archived'
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  output_id UUID NOT NULL REFERENCES generated_outputs(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'applied',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique application identifier |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | User who created this application |
| `output_id` | UUID | FOREIGN KEY → generated_outputs(id), NOT NULL | Tailored CV/cover letter used |
| `status` | ENUM | NOT NULL, DEFAULT 'applied' | Application status (see enum values) |
| `notes` | TEXT | | User notes (e.g., "Sent via LinkedIn", "Follow up on Dec 1") |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Application submission time |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last status/notes update |

**Enum Values:**
- `applied`: Initial state (CV/cover letter sent)
- `interview_scheduled`: Interview confirmed
- `interviewing`: Currently in interview process
- `offered`: Job offer received
- `rejected`: Application rejected by employer
- `withdrawn`: User withdrew application
- `archived`: User archived (no longer tracking)

**Indexes:**
```sql
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_output_id ON applications(output_id);
CREATE INDEX idx_applications_status ON applications(status); -- Filter by status
CREATE INDEX idx_applications_created_at ON applications(created_at);
```

---

### Table: `consent_logs`

**Purpose:** Audit trail for GDPR consent changes

**Epic 5 (Story 5.1):** GDPR consent management

```sql
CREATE TABLE consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  granted BOOLEAN NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique log entry identifier |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | User whose consent changed |
| `consent_type` | VARCHAR(50) | NOT NULL | Type: 'essential', 'ai_training', 'marketing' |
| `granted` | BOOLEAN | NOT NULL | true = consent given, false = consent revoked |
| `timestamp` | TIMESTAMP | NOT NULL, DEFAULT NOW() | When consent was changed |

**Indexes:**
```sql
CREATE INDEX idx_consent_logs_user_id ON consent_logs(user_id);
CREATE INDEX idx_consent_logs_timestamp ON consent_logs(timestamp);
```

**Business Logic:**
- Append-only (no updates/deletes) for audit trail
- Every consent change creates a new log entry
- GDPR requires audit trail for 5 years (check local regulations)

---

### Table: `data_export_requests`

**Purpose:** Track GDPR data export requests and download links

**Epic 5 (Story 5.2):** Data export

```sql
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'ready', 'expired');

CREATE TABLE data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status export_status NOT NULL DEFAULT 'pending',
  file_path VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique request identifier |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | User requesting export |
| `status` | ENUM | NOT NULL, DEFAULT 'pending' | Request status |
| `file_path` | VARCHAR(500) | | Supabase Storage path (when ready) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Request creation time |
| `expires_at` | TIMESTAMP | | Download link expiration (7 days after ready) |

**Enum Values:**
- `pending`: Request received, queued for processing
- `processing`: Background job running
- `ready`: Export file ready for download
- `expired`: Download link expired (file deleted)

**Indexes:**
```sql
CREATE INDEX idx_data_export_requests_user_id ON data_export_requests(user_id);
CREATE INDEX idx_data_export_requests_status ON data_export_requests(status);
CREATE INDEX idx_data_export_requests_expires_at ON data_export_requests(expires_at); -- Cleanup job
```

**Business Logic:**
- Background job generates JSON export (see Backend Architecture Section 13)
- File stored in Supabase Storage with 7-day expiration
- Cleanup job deletes expired exports: `DELETE FROM data_export_requests WHERE status = 'expired' AND expires_at < NOW() - INTERVAL '7 days'`

---

## 4. Relationships Diagram

```
┌─────────────┐
│   users     │
│             │
│ id (PK)     │◄──────────┐
│ email       │           │
│ password    │           │
│ consents    │           │
└─────────────┘           │
      │                   │
      │ 1:many            │
      │                   │
      ▼                   │
┌─────────────┐           │
│    cvs      │           │
│             │           │
│ id (PK)     │           │
│ user_id(FK) │───────────┘
│ personal    │
│ education   │
│ experience  │
└─────────────┘
      │
      │ 1:many
      │
      ▼
┌─────────────────┐
│  cv_versions    │
│                 │
│ id (PK)         │
│ cv_id (FK)      │───────────┐
│ version_number  │           │
│ snapshot        │           │
└─────────────────┘           │
                              │
┌─────────────────┐           │
│ job_postings    │           │
│                 │           │
│ id (PK)         │           │
│ user_id (FK)    │───────────┤
│ description     │           │
│ keywords        │           │
│ auto_delete_at  │           │
└─────────────────┘           │
      │                       │
      │                       │
      │ many:1:1              │
      │                       │
      ▼                       │
┌─────────────────────┐       │
│ generated_outputs   │       │
│                     │       │
│ id (PK)             │       │
│ cv_id (FK)          │───────┤
│ job_id (FK)         │───────┘
│ user_id (FK)        │───────┐
│ tailored_cv         │       │
│ cover_letter        │       │
│ ats_score           │       │
└─────────────────────┘       │
      │                       │
      │ 1:1                   │
      │                       │
      ▼                       │
┌─────────────────┐           │
│  applications   │           │
│                 │           │
│ id (PK)         │           │
│ user_id (FK)    │───────────┤
│ output_id (FK)  │───────────┘
│ status          │
│ notes           │
└─────────────────┘

┌─────────────────────┐
│   consent_logs      │ (Audit trail, many:1 with users)
│                     │
│ id (PK)             │
│ user_id (FK)        │───────────┐
│ consent_type        │           │
│ granted             │           │
│ timestamp           │           │
└─────────────────────┘           │
                                  │
┌─────────────────────────┐       │
│ data_export_requests    │       │ (Audit trail, many:1 with users)
│                         │       │
│ id (PK)                 │       │
│ user_id (FK)            │───────┘
│ status                  │
│ file_path               │
│ expires_at              │
└─────────────────────────┘
```

**Relationship Summary:**

1. **users → cvs** (1:many): One user has multiple CVs
2. **cvs → cv_versions** (1:many): One CV has multiple versions
3. **users → job_postings** (1:many): One user analyzes multiple jobs
4. **cvs + job_postings → generated_outputs** (many:1:1): Multiple CVs and jobs generate multiple outputs
5. **users → applications** (1:many): One user has multiple applications
6. **generated_outputs → applications** (1:1): Each application links to one generated output
7. **users → consent_logs** (1:many): One user has multiple consent log entries (audit trail)
8. **users → data_export_requests** (1:many): One user can request multiple exports

---

## 5. Indexes for Performance

### Index Strategy

**Primary Indexes (Automatic):**
- All primary keys (UUID) have automatic indexes
- All unique constraints (e.g., `users.email`) have automatic indexes

**Foreign Key Indexes (Manual):**
```sql
-- cvs table
CREATE INDEX idx_cvs_user_id ON cvs(user_id);

-- cv_versions table
CREATE INDEX idx_cv_versions_cv_id ON cv_versions(cv_id);

-- job_postings table
CREATE INDEX idx_job_postings_user_id ON job_postings(user_id);

-- generated_outputs table
CREATE INDEX idx_generated_outputs_user_id ON generated_outputs(user_id);
CREATE INDEX idx_generated_outputs_cv_id ON generated_outputs(cv_id);
CREATE INDEX idx_generated_outputs_job_id ON generated_outputs(job_id);

-- applications table
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_output_id ON applications(output_id);

-- consent_logs table
CREATE INDEX idx_consent_logs_user_id ON consent_logs(user_id);

-- data_export_requests table
CREATE INDEX idx_data_export_requests_user_id ON data_export_requests(user_id);
```

**Filtering Indexes (Manual):**
```sql
-- Filter by application status
CREATE INDEX idx_applications_status ON applications(status);

-- Filter by export request status
CREATE INDEX idx_data_export_requests_status ON data_export_requests(status);
```

**Sorting Indexes (Manual):**
```sql
-- Sort CVs by creation date (most recent first)
CREATE INDEX idx_cvs_created_at ON cvs(created_at);

-- Sort applications by creation date
CREATE INDEX idx_applications_created_at ON applications(created_at);

-- Sort consent logs by timestamp
CREATE INDEX idx_consent_logs_timestamp ON consent_logs(timestamp);
```

**Array Indexes (GIN - Generalized Inverted Index):**
```sql
-- Search skills array (e.g., WHERE 'JavaScript' = ANY(skills))
CREATE INDEX idx_cvs_skills ON cvs USING GIN(skills);

-- Search extracted keywords
CREATE INDEX idx_job_postings_keywords ON job_postings USING GIN(extracted_keywords);
```

**Cleanup Job Indexes:**
```sql
-- Find expired job postings (auto-delete)
CREATE INDEX idx_job_postings_auto_delete_at ON job_postings(auto_delete_at);

-- Find expired export requests
CREATE INDEX idx_data_export_requests_expires_at ON data_export_requests(expires_at);
```

**Composite Indexes (Multi-column):**
```sql
-- Unique version per CV
CREATE UNIQUE INDEX idx_cv_versions_cv_version ON cv_versions(cv_id, version_number);

-- Filter applications by user + status (common query)
CREATE INDEX idx_applications_user_status ON applications(user_id, status);
```

---

## 6. Migration Strategy

### Prisma Migrate

**Migration Workflow:**

1. **Define Schema:** Edit `prisma/schema.prisma`
2. **Generate Migration:** `npx prisma migrate dev --name <migration_name>`
3. **Apply Migration:** Automatically applied in dev mode
4. **Review SQL:** Check `prisma/migrations/<timestamp>_<name>/migration.sql`
5. **Deploy Production:** `npx prisma migrate deploy`

**Migration Naming Convention:**

- `init`: Initial schema creation
- `add_<table>_table`: New table
- `add_<column>_to_<table>`: New column
- `add_index_<table>_<column>`: New index
- `alter_<table>_<change>`: Schema alteration

**Example Migration File:**

```sql
-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('applied', 'interview_scheduled', 'interviewing', 'offered', 'rejected', 'withdrawn', 'archived');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ...
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
```

### Rollback Strategy

**Development:**
- `npx prisma migrate reset`: Drop database, re-apply all migrations

**Production:**
- **Manual Rollback:** Create new migration to reverse changes
- **Never delete migration files** (breaks migration history)
- **Test rollback** in staging before production

**Example Rollback Migration:**

```sql
-- Rollback: Remove column 'bio' from users table
ALTER TABLE users DROP COLUMN bio;
```

---

## 7. Data Retention Policies

### Table-Level Retention

| Table | Retention Policy | Rationale |
|-------|------------------|-----------|
| **users** | Until user deletes account | User owns account |
| **cvs** | Until user deletes | User-managed data |
| **cv_versions** | Until user deletes CV | Tied to CV lifecycle |
| **job_postings** | Auto-delete after 24 hours | Copyright compliance, minimize storage |
| **generated_outputs** | Until user deletes | User-generated content |
| **applications** | Until user deletes | User-managed history |
| **consent_logs** | 90 days (PII redacted) | GDPR audit trail (check local regulations) |
| **data_export_requests** | 7 days after expiration | Temporary files |

### Automated Cleanup Jobs

**Job 1: Delete Expired Job Postings (Hourly)**

```sql
DELETE FROM job_postings
WHERE auto_delete_at < NOW();
```

**Job 2: Delete Expired Export Requests (Daily)**

```sql
-- Mark as expired
UPDATE data_export_requests
SET status = 'expired'
WHERE status = 'ready' AND expires_at < NOW();

-- Delete expired records (7 days after expiration)
DELETE FROM data_export_requests
WHERE status = 'expired' AND expires_at < NOW() - INTERVAL '7 days';
```

**Job 3: Delete Inactive User Accounts (Weekly)**

```sql
-- Find users inactive for 7+ days
DELETE FROM users
WHERE last_login_at < NOW() - INTERVAL '7 days';

-- Note: This is OPTIONAL per PRD. Consider sending warning email before deletion.
```

**Job 4: Prune Old Consent Logs (Monthly)**

```sql
-- Keep consent logs for 90 days (adjust per GDPR requirements)
DELETE FROM consent_logs
WHERE timestamp < NOW() - INTERVAL '90 days';
```

---

## 8. Prisma Schema Implementation

### Complete Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== MODELS ====================

model User {
  id                   String   @id @default(uuid()) @db.Uuid
  email                String   @unique @db.VarChar(255)
  password_hash        String   @db.VarChar(255)
  name                 String?  @db.VarChar(255)
  created_at           DateTime @default(now()) @db.Timestamp()
  updated_at           DateTime @updatedAt @db.Timestamp()
  last_login_at        DateTime? @db.Timestamp()
  consent_essential    Boolean  @default(true)
  consent_ai_training  Boolean  @default(false)
  consent_marketing    Boolean  @default(false)

  // Relations
  cvs                  CV[]
  job_postings         JobPosting[]
  generated_outputs    GeneratedOutput[]
  applications         Application[]
  consent_logs         ConsentLog[]
  data_export_requests DataExportRequest[]

  @@index([email])
  @@index([created_at])
  @@map("users")
}

model CV {
  id             String   @id @default(uuid()) @db.Uuid
  user_id        String   @db.Uuid
  created_at     DateTime @default(now()) @db.Timestamp()
  updated_at     DateTime @updatedAt @db.Timestamp()
  personal_info  Json     @default("{}") @db.JsonB
  education      Json     @default("[]") @db.JsonB
  experience     Json     @default("[]") @db.JsonB
  skills         String[] @default([])
  languages      Json     @default("[]") @db.JsonB

  // Relations
  user              User              @relation(fields: [user_id], references: [id], onDelete: Cascade)
  versions          CVVersion[]
  generated_outputs GeneratedOutput[]

  @@index([user_id])
  @@index([created_at])
  @@index([skills], type: Gin) // GIN index for array search
  @@map("cvs")
}

model CVVersion {
  id             String   @id @default(uuid()) @db.Uuid
  cv_id          String   @db.Uuid
  version_number Int
  snapshot       Json     @db.JsonB
  created_at     DateTime @default(now()) @db.Timestamp()

  // Relations
  cv CV @relation(fields: [cv_id], references: [id], onDelete: Cascade)

  @@unique([cv_id, version_number])
  @@index([cv_id])
  @@index([created_at])
  @@map("cv_versions")
}

model JobPosting {
  id                  String   @id @default(uuid()) @db.Uuid
  user_id             String   @db.Uuid
  title               String?  @db.VarChar(255)
  company             String?  @db.VarChar(255)
  description         String   @db.Text
  extracted_keywords  String[] @default([])
  required_skills     Json     @default("[]") @db.JsonB
  created_at          DateTime @default(now()) @db.Timestamp()
  auto_delete_at      DateTime @default(dbgenerated("NOW() + INTERVAL '24 hours'")) @db.Timestamp()

  // Relations
  user              User              @relation(fields: [user_id], references: [id], onDelete: Cascade)
  generated_outputs GeneratedOutput[]

  @@index([user_id])
  @@index([auto_delete_at]) // For cleanup job
  @@index([extracted_keywords], type: Gin)
  @@map("job_postings")
}

model GeneratedOutput {
  id               String   @id @default(uuid()) @db.Uuid
  cv_id            String   @db.Uuid
  job_id           String?  @db.Uuid
  user_id          String   @db.Uuid
  tailored_cv      Json     @db.JsonB
  cover_letter_text String  @db.Text
  ats_score        Int?
  match_score      Int?
  feedback_notes   String[] @default([])
  created_at       DateTime @default(now()) @db.Timestamp()

  // Relations
  cv           CV           @relation(fields: [cv_id], references: [id], onDelete: Cascade)
  job          JobPosting?  @relation(fields: [job_id], references: [id], onDelete: SetNull)
  user         User         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  applications Application[]

  @@index([user_id])
  @@index([cv_id])
  @@index([job_id])
  @@index([created_at])
  @@map("generated_outputs")
}

enum ApplicationStatus {
  applied
  interview_scheduled
  interviewing
  offered
  rejected
  withdrawn
  archived
}

model Application {
  id         String            @id @default(uuid()) @db.Uuid
  user_id    String            @db.Uuid
  output_id  String            @db.Uuid
  status     ApplicationStatus @default(applied)
  notes      String?           @db.Text
  created_at DateTime          @default(now()) @db.Timestamp()
  updated_at DateTime          @updatedAt @db.Timestamp()

  // Relations
  user   User            @relation(fields: [user_id], references: [id], onDelete: Cascade)
  output GeneratedOutput @relation(fields: [output_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([output_id])
  @@index([status])
  @@index([created_at])
  @@index([user_id, status]) // Composite index for common query
  @@map("applications")
}

model ConsentLog {
  id           String   @id @default(uuid()) @db.Uuid
  user_id      String   @db.Uuid
  consent_type String   @db.VarChar(50)
  granted      Boolean
  timestamp    DateTime @default(now()) @db.Timestamp()

  // Relations
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([timestamp])
  @@map("consent_logs")
}

enum ExportStatus {
  pending
  processing
  ready
  expired
}

model DataExportRequest {
  id         String        @id @default(uuid()) @db.Uuid
  user_id    String        @db.Uuid
  status     ExportStatus  @default(pending)
  file_path  String?       @db.VarChar(500)
  created_at DateTime      @default(now()) @db.Timestamp()
  expires_at DateTime?     @db.Timestamp()

  // Relations
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([user_id])
  @@index([status])
  @@index([expires_at]) // For cleanup job
  @@map("data_export_requests")
}
```

### Prisma Client Usage

```typescript
// src/config/database.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Example query
const user = await prisma.user.findUnique({
  where: { email: 'emma@example.com' },
  include: {
    cvs: true, // Include related CVs
    applications: {
      include: {
        output: true // Nested include
      }
    }
  }
});
```

---

## 9. Epic Story Mapping

### Database Schema Coverage by Epic

| Epic | Stories | Tables Involved | Key Features |
|------|---------|----------------|--------------|
| **Epic 1** | 1.1-1.4 | `users` | User registration, authentication, profile |
| **Epic 2** | 2.1-2.9 | `cvs`, `cv_versions` | CV CRUD, versioning, JSONB storage |
| **Epic 3** | 3.1-3.6 | `job_postings` | Job analysis, keyword extraction, 24h auto-delete |
| **Epic 4** | 4.1-4.5 | `generated_outputs`, `applications` | Tailored CV/cover letter, application history |
| **Epic 5** | 5.1-5.7 | `consent_logs`, `data_export_requests` | GDPR compliance, audit trail |

---

## Conclusion

This Database Schema Specification provides a complete PostgreSQL schema for the AI CV & Job Application Assistant platform, optimized for GDPR compliance, performance, and developer experience.

### Key Takeaways

1. **PostgreSQL 15+ via Supabase** for GDPR-compliant EU hosting
2. **Prisma ORM** for type-safe database access and migrations
3. **UUID primary keys** for security and uniqueness
4. **JSONB columns** for flexible CV data without frequent migrations
5. **Cascading foreign keys** for automatic data deletion (GDPR)
6. **Strategic indexes** on foreign keys, timestamps, status fields, and arrays
7. **Automated cleanup jobs** for job postings (24h) and export requests (7 days)
8. **Audit trails** for consent changes (90-day retention)

### Next Steps

1. **Initialize Prisma:** `npx prisma init`
2. **Copy schema:** Paste Prisma schema into `prisma/schema.prisma`
3. **Generate migration:** `npx prisma migrate dev --name init`
4. **Seed development data:** Create `prisma/seed.ts`
5. **Generate Prisma Client:** `npx prisma generate`
6. **Test queries:** Use Prisma Studio (`npx prisma studio`)

---

**Document Status:** ✅ Ready for Implementation
**Last Updated:** 2025-11-24
**Maintainer:** BMM Architect Agent (Winston)
