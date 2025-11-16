# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI CV & Job Application Assistant** - A web application that helps job seekers create customized CVs and cover letters tailored to specific job postings using AI-powered analysis and generation.

**Course:** IBE160 Programmering med KI
**Group:** SG-Gruppe-12

### Purpose
Assist users in creating ATS-optimized, tailored CVs and cover letters by analyzing their existing CV against job postings, providing keyword matching, gap analysis, and generating personalized application materials.

### Target Stack
- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js (Express)
- **AI/NLP:** GPT-5 (OpenAI) + Claude 3.5 (Anthropic)
- **Database:** PostgreSQL (Supabase Cloud)
- **Authentication:** Firebase Auth with HTTPS
- **Hosting:** Vercel (frontend) + Render (backend)

## Development Workflow

This repository uses the **BMad Method (BMM)** - an AI-driven agile development framework with specialized agents and structured workflows. The project follows a phased approach:

### Phase Structure
1. **Phase 0:** Documentation (for existing codebases)
2. **Phase 1:** Analysis (brainstorming, research, product brief)
3. **Phase 2:** Planning (PRD, UX design, tech specs)
4. **Phase 3:** Solutioning (architecture design)
5. **Phase 4:** Implementation (sprint planning, story development)

### BMM Agents
The project leverages specialized AI agents defined in `.claude/agents/`:
- **bmm-analyst**: Requirements analysis, brainstorming, research
- **bmm-pm**: Product management, PRD creation
- **bmm-ux-designer**: User experience and interface design
- **bmm-architect**: Technical architecture and design
- **bmm-sm**: Sprint planning and story management
- **bmm-dev**: Implementation and coding
- **bmm-tea**: Testing framework, CI/CD, QA
- **bmm-tech-writer**: Documentation

### Using BMM Agents
Execute agent tasks using the `/run-agent-task` command:
```
/run-agent-task <agent> *<task> <prompt>
```

Examples:
- `/run-agent-task analyst *brainstorm "User authentication flows"`
- `/run-agent-task pm *prd`
- `/run-agent-task architect *architecture`
- `/run-agent-task dev *implement-story`

See `docs/project-plan.md` for the complete workflow checklist.

## CI/CD

**GitHub Actions Workflow:** `.github/workflows/ci.yml`
- Triggers on push/PR to `main` branch
- Currently runs basic verification
- Status badge in README shows CI health

**Running CI locally:**
```bash
# Verify CI workflow syntax
cat .github/workflows/ci.yml
```

## Logging & Telemetry

The `.logging/` directory contains API request tracking infrastructure:
- **View requests:** `uv run .logging/server.py` or `python .logging/server.py`
  - Opens browser at `http://localhost:8000/api-viewer.html`
  - Lists all API sessions with timestamps and titles
- **Process requests:** `.logging/process-api-requests.py`
- **Watch sessions:** `.logging/watcher.py`

Session files stored in `.logging/requests/` with format: `{timestamp}-{kebab-title}.json`

## Project Documentation

Key documentation files:
- **proposal.md** - Complete project proposal with tech stack, user flows, and success criteria
- **rapport.md** - Norwegian progress report for Phase 1
- **docs/project-plan.md** - Detailed phase-by-phase task checklist
- **.bmad/bmm/** - BMM framework documentation and agent definitions

## Development Guidelines

### Authentication & Security
- Use Firebase Auth with HTTPS
- TLS encryption for all data transmission
- GDPR compliance: auto-delete user files after 7 days
- Never commit secrets - all sensitive data goes in `.env` files

### AI Integration
- Dual AI provider support (OpenAI GPT-5 + Anthropic Claude 3.5)
- Rate limiting and batch processing to manage API costs
- Target: <10 second response time for AI operations

### Database Schema
PostgreSQL with four main tables:
- **Users:** user_id, name, email, hashed_password
- **CVs:** cv_id, user_id, upload_date, file_path, skills_extracted
- **Job_Postings:** job_id, title, company, key_requirements, description
- **Generated_Outputs:** output_id, cv_id, job_id, cover_letter_text, ats_score, feedback_notes

### File Upload Support
- MVP: PDF and TXT formats
- Extension: DOCX support
- Secure upload handling with validation

## Success Metrics
- 95% document processing success rate
- 80%+ job requirement coverage in cover letters
- 4/5+ average user satisfaction
- 100% data encryption
- <10s AI response time

## Git Workflow
- Main branch: `main`
- CI badge in README tracks build status
- Current state: Early development (Phase 1 - CI setup complete)
