# AI CV & Job Application Assistant

## Background
Creating tailored CVs and job applications is often time-consuming and challenging for students and job seekers. Many struggle to showcase their most relevant experiences and adapt their application to match the language of the job description. With employers increasingly relying on AI-driven Applicant Tracking Systems (ATS), it has become essential for applicants to optimize their documents for these systems to improve their chances of success.

## Purpose
The purpose of this application is to assist users in creating customized, high-quality CVs and job applications that align with specific job postings. It not only provides personalized suggestions, highlights missing qualifications, and ensures ATS optimization, but also helps applicants emphasize their genuine skills and experiences. The system is designed to focus on what is truly relevant for the job without fabricating or misrepresenting information, making the job search process both effective and authentic.

## Target Users
- Students and graduates entering the job market  
- Professionals seeking new opportunities or career changes  
- Anyone who needs support in preparing effective CVs and job applications  

## Core Functionality
The core functionality of the system revolves around analyzing user CVs in relation to job postings and providing actionable, tailored outputs that improve job application quality.

### Must Have (MVP)
- Upload CV and job posting for analysis  
- Generate tailored job application letter based on the CV and posting  
- Provide suggestions to improve the CV (structure, keywords, formatting)  

### Nice to Have (Optional Extensions)
- Gap analysis showing missing qualifications or skills  
- ATS optimization checker with a scoring system  

## Data Requirements
- User CVs: name, education, work experience, skills, contact information  
- Job postings: title, description, key requirements, company details  
- Application outputs: tailored cover letters, CV improvement notes, keyword suggestions  

### Database Structure (ERD Overview)
The PostgreSQL database will include four main tables:  
- Users (user_id, name, email, hashed_password)  
- CVs (cv_id, user_id, upload_date, file_path, skills_extracted)  
- Job_Postings (job_id, title, company, key_requirements, description)  
- Generated_Outputs (output_id, cv_id, job_id, cover_letter_text, ats_score, feedback_notes)  

Relationships: Users → CVs → Generated_Outputs (1–M–M), Job_Postings → Generated_Outputs (1–M).  

## Technical Constraints
- Secure login and encrypted document storage  
- Accept multiple document formats (DOC, PDF, TXT)  
- Multi-language support (English, Norwegian, etc.)  

## Decision Points
- AI Provider: Dual integration with GPT-5 (OpenAI) and Claude 3.5 (Anthropic)  
- Output Mode: AI suggestions and semi-automated rewriting  
- Data Storage: PostgreSQL with encrypted access, automatic file deletion after 7 days  
- Authentication: Firebase Auth with HTTPS; optional OAuth integration later  
- Language: English for MVP; Norwegian as extension  
- Deployment: Vercel (frontend) + Render (backend)  

## Platform Type
The system will be implemented as a **web application**, accessible directly from the browser.

## Technology Stack
- **Frontend:** React.js + Tailwind CSS  
- **Backend:** Node.js (Express)  
- **AI/NLP:** GPT-5 (OpenAI) + Claude 3.5 (Anthropic)  
- **Database:** PostgreSQL (Supabase Cloud)  
- **Authentication:** Firebase Auth with HTTPS  
- **Hosting:** Vercel (frontend) + Render (backend)  
- **Security:** TLS encryption and GDPR-compliant file deletion (7 days)  

## Development Timeline and Milestones
| Week | Focus | Deliverables |
|------|--------|--------------|
| 1 | Setup and architecture design | Configure Node.js, connect to PostgreSQL, design API endpoints |
| 2 | File upload and parsing | Implement secure upload (PDF/TXT) and storage in database |
| 3 | AI integration | Connect GPT-5 and Claude APIs for analysis and keyword extraction |
| 4 | Cover letter generation | Create cover letter generator and refinement interface |
| 5 | CV improvement module | Add feedback system for structure, formatting, and missing skills |
| 6 | Testing and deployment | Unit testing, bug fixes, and cloud deployment |

## Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| API integration complexity | Medium | Start with one API, add dual-model logic later |
| Parsing errors for DOCX/PDF | Medium | Limit MVP to PDF/TXT |
| Hosting downtime | Low | Use managed cloud hosting |
| API cost | Medium | Apply rate limiting and batch processing |
| Data privacy compliance | High | Enforce GDPR and TLS encryption |
| Schedule overrun | Medium | Follow weekly milestones and limited MVP scope |

## Success Criteria
- 95% of uploaded documents processed successfully  
- Cover letters include ≥80% of job requirements  
- Average user satisfaction ≥4/5  
- 100% encryption of user data and deletion within 7 days  
- AI response time <10 seconds  
- Users can rate outputs (1–5 scale)  

## Difficulty Level
Medium – NLP integration, secure storage, and ATS scoring require careful balancing between automation and authenticity.
