# Epic 5 – Trust & Data Governance
Technical Specification – Sprint Artifact  
Author: Martin Reppen  
Date: 2025-11-25  

---

## 1. Overview

Epic 5 focuses on trust, privacy, and data governance throughout the entire application. Unlike previous epics, this is a **cross-cutting epic** that affects all parts of the system. The goal is to ensure safe, transparent, and GDPR-compliant handling of user data, especially because CVs and job descriptions often contain highly sensitive personal information.

This epic also defines guidelines for ethical AI usage, including preventing hallucinations, avoiding fabrication of experience, and mitigating bias in AI-generated outputs.

Epic 5 operationalizes PRD requirements related to:
- GDPR and privacy  
- Data deletion  
- Data export  
- User control  
- Transparency  
- Ethical AI usage  
- Secure handling of CVs and job descriptions  
- Logging and monitoring  
- Role-based access control  
- Data minimization principles  

---

## 2. Purpose & Goals

The primary purpose of Epic 5 is to make users feel safe and confident in how their data is collected, processed, stored, and used.

System goals:
- Ensure **full GDPR compliance**
- Provide **clear data control features** (export, delete, view, correct)
- Guarantee **no unauthorized access**
- Ensure **no personal data is used for AI training**
- Prevent AI hallucinations or fabrication of user qualifications
- Limit storage of job descriptions to short-term retention
- Implement strong privacy-first logging practices
- Deliver transparent explanations of AI outputs

---

## 3. In Scope

Epic 5 includes:

### GDPR Core Functions
- Right to access (export personal data)
- Right to delete (permanent account removal)
- Right to correct personal data
- Clear storage timelines for:
  - CVs
  - Job descriptions
  - AI-generated content
  - Application history

### Data Governance Standards
- Encryption at rest and in transit
- Strict logging policy (no sensitive content stored)
- Secure storage regions (EU/GDPR)
- Data retention rules

### Transparency Features
- Explain how match score is calculated
- Explain how tailored CV/letters are generated
- Ensure user can see and edit all AI-generated output

### Security Measures
- Role-Based Access Control (RBAC)
- Safe file handling for CV uploads
- Prevent storing raw job descriptions long-term

### AI Governance
- Prevent fabrication of experience
- Prevent biased language
- Require deterministic LLM prompts

---

## 4. Out of Scope

Not included in this epic:
- Detailed UI design  
- Business analytics dashboards  
- Company-side hiring features  
- Premium tiers / monetization logic  
- Multi-user collaboration  

These may be included in later phases.

---

## 5. GDPR Feature Design

### 5.1 Data Export (Right of Access)

**Endpoint:**  
`GET /api/user/export`

**Output:**  
A ZIP file containing:
- CV data (JSON)
- Job analyses (JSON)
- Tailored applications
- Account metadata

### 5.2 Data Deletion (Right to be Forgotten)

**Endpoint:**  
`DELETE /api/user/delete-account`

Process:
1. Delete CVs  
2. Delete personal info  
3. Delete job descriptions  
4. Delete generated outputs  
5. Delete application history  
6. Invalidate sessions and tokens  

### 5.3 Data Correction

Users can update:
- CV fields  
- Personal info  
- Profile details  

All updates overwrite previous versions without retaining unnecessary historical copies.

---

## 6. Data Storage & Retention Rules

### CV Data  
- Stored until user deletes it  
- Fully encrypted at rest  
- Not used for AI training  
- Editable at all times  

### Job Descriptions  
- Stored short-term only (max 24–48 hours)  
- Deleted automatically after analysis  
- Cached versions removed by retention job  

### AI-Generated Content  
- Stored only if user saves it (e.g. tailored CV or cover letter)

### Logs  
- Must **not** contain:
  - Names  
  - Addresses  
  - CV text  
  - Job description text  
  - Application content  

Logs only store:
- Request type  
- Timestamps  
- Error categories  

---

## 7. Security Requirements

### 7.1 Encryption  
- TLS for all network traffic  
- AES-256 for database encryption (if supported)  

### 7.2 Authentication & Authorization  
- Secure login (minimum 12-character password requirement)  
- Role-based access for admin vs user  
- No elevated privileges without justification  

### 7.3 Secure File Handling  
- Validate MIME types (PDF, DOCX, TXT only)  
- Reject oversized files  
- Virus scan recommended (optional MVP)  
- Temporary files deleted immediately after use  

### 7.4 Prevention of Sensitive Data Leakage  
- No sending CVs or job descriptions to 3rd parties  
- No embedding personal data in prompts beyond what is required  
- No logging LLM prompts containing personal data  

---

## 8. AI Safety & Bias Mitigation

The system must:

### Avoid Hallucination
- Never fabricate experience, degrees or certifications  
- Never invent company names  
- Always base output on actual CV fields  

### Reduce Bias  
- Avoid gendered language  
- Avoid age assumptions  
- Avoid ethnic assumptions  
- Avoid unnecessary personal references  
- Avoid biased phrasing in strengths/weaknesses  

### Prompt Rules  
LLM prompts must:
- Describe allowed content  
- Forbid fabrication  
- Request structured output  
- Be deterministic  

### Example Safety-Guided Prompt

```text
You must not invent any new experience, education or skills. 
Only use information from the provided CV data.
Avoid biased language and avoid implying demographic traits.
Keep the writing professional and factual.
```

---

## 9. Audit & Logging Rules

Audit logs must record:
- When users export data  
- When users delete data  
- When tailored application content is generated  
- When account settings are changed  

Log entries include:
- User ID (hashed)  
- Timestamp  
- Action category  

No raw text from user inputs should appear in logs.

---

## 10. Non-Functional Requirements

### Performance
- Data export within 3–8 seconds  
- Deletion jobs under 2 seconds  
- No GDPR jobs should block the main request flow  

### Reliability
- Fully deterministic deletion process  
- Backup-safe architecture  

### Scalability
- Distributed deletion jobs use locking (e.g. Redis)  
- Log volume kept minimal  

### Transparency
- Clear user-facing messages explaining:
  - Why certain data is stored  
  - How match score works  
  - How AI generates content  

---

## 11. Test Ideas

### GDPR Tests
- Data export contains all but only user-owned data  
- Delete account removes all records  
- Retention job deletes old job descriptions  

### Security Tests
- Upload invalid file → rejected  
- Try accessing other user's data → forbidden  
- Prompt injection attempts handled safely  

### AI Safety Tests
- Check LLM output for fabricated information  
- Check for disallowed bias patterns  
- Edge cases: empty CV sections  

---

## 12. Conclusion

Epic 5 establishes the core privacy, governance, and ethical foundations required for a professional AI-powered job application system. It ensures the platform operates safely, respects user rights, stays compliant with GDPR, and maintains transparency in how AI-driven decisions are made.

With Epic 5 in place, the system gains long-term trustworthiness and readiness for real-world deployment in sensitive HR and recruitment contexts.
