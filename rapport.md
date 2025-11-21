# Rapport – SG-Gruppe-12

Dette dokumentet beskriver arbeidet i prosjektet **"AI CV and Application"** i faget *IBE160 Programmering med KI*.  
Prosjektet er delt inn i flere deler, og hvert gruppemedlem har hatt ansvar for en spesifikk del av fase 1.

---

## Fase 1 – Workflow status *(Martin Reppen)*

### Mål
Målet mitt var å sette opp et GitHub Actions-oppsett (en workflow) som automatisk kjører hver gang noen oppdaterer koden.  
Dette gjør at gruppen enkelt kan se om prosjektet bygger riktig, ved hjelp av en “status-badge” i README-filen.

### Hva jeg gjorde
- Lagde en ny mappe i prosjektet: `.github/workflows/`
- Opprettet en fil kalt `ci.yml`
- La inn en enkel GitHub Actions workflow som sjekker at alt fungerer
- Satte opp workflowen til å kjøre automatisk ved **push** og **pull request** til `main`
- La til en badge øverst i `README.md` som viser grønn (passing) eller rød (failing) status

### Koden jeg brukte (workflow-filen)
```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "CI is working ✅"
Resultat

Når workflowen kjører uten feil, vises “CI passing” i README.
Hvis noe går galt i koden, blir den rød og viser “CI failing”.
Dette fungerer som en enkel form for Continuous Integration (CI), som hjelper oss å oppdage feil tidlig.

Kort oppsummering

Jeg har satt opp en automatisk workflow som fungerer som en test av koden vår.
Badgen i README viser om alt fungerer, og gir gruppen en rask statusoversikt.
---

## Phase 1 – Brainstorming & Ideation *(Kaylee Floden)*

### Goal
The goal of the brainstorming sessions was to deeply understand the problems job seekers face and to shape a concrete solution for the "AI CV and Application" project. We wanted to identify the biggest frustrations and define the core functionality for an MVP.

### What I did
- **Identified User Problems:** Analyzed and defined the central challenges for job seekers, including vague job ads, lack of skill standardization, and rapid technological development.
- **Shaped the Solution Concept:** Developed ideas for core functionality, which were divided into two main branches:
    1.  **CV Creation and Management:** A smart system to capture user data and automatically organize and generate CVs.
    2.  **Job Application and Customization:** A system to analyze job ads, compare them with the user's profile, and generate tailored applications and cover letters.
- **Prioritized Features for MVP:** Defined the three most important features for a first version of the product:
    1.  An intelligent data intake system (Smart Intake System).
    2.  A generator for CVs and applications.
    3.  A system for matching and tailoring applications.
- **Outlined Technical Architecture:** Contributed to outlining a high-level technical architecture, including a Node.js/Express backend, a React frontend, and a PostgreSQL database.

### Result
The result of these sessions was a clear and prioritized list of functionality for the MVP, a common understanding of the user's pain points, and a technical foundation for further development. These insights were directly used in the creation of the Product Brief document.

### Brief Summary
Through brainstorming, I have contributed to shaping the core of the product, from understanding the problem to a concrete, prioritized plan for functionality and technical architecture.
---

## Phase 1 – Product Brief *(Kaylee Floden)*

### Goal
My goal was to define and document the product vision for the "AI CV and Application" project, and to create a solid foundation for further development. This included clarifying what we are building, for whom, why it is important, and how we measure success.

### What I did
- **Defined the Product Vision:** Collaborated to establish a clear vision for the "AI CV and Application" as a global platform.
- **Clarified the Problem and Solution:** Articulated the biggest frustration for job seekers (guesswork and time wasted on customizing applications) and how our AI-driven solution addresses this.
- **Identified Target Users:** Described the ideal primary user ("The Exhausted Job Seeker") and their journey from frustration to efficiency.
- **Set Success Criteria:** Established measurable success metrics, business objectives, and KPIs for the first 6-12 months, with a focus on user engagement and real impact.
- **Defined MVP Scope:** Clarified the Minimum Viable Product (MVP) with core features (authentication, CV intake, AI job analysis, generation of tailored CV/application) and what is out of scope.
- **Contributed to Strategic Dimensions:** Provided input on financial considerations (monetization strategy), and reviewed market analysis, technical preferences, and timeline constraints.
- **Ensured Global Focus:** Adjusted the document to reflect a global ambition, with a regional focus as a strategic starting point.
- **Version Control:** Completed the Product Brief document, committed it to the `main` branch, and renamed the associated feature branch from `project-brief` to `product-brief`.

### Result
A comprehensive Product Brief document (`docs/product-brief-ibe160-2025-11-18.md`) that provides a clear and detailed overview of the project. This document serves as a roadmap for further development and ensures that all team members have a common understanding of the product's goals and direction.

### Brief Summary
I have led the work of defining the product's core, from vision to MVP, and ensured that we have a solid foundation for building the "AI CV and Application" project.
---

## Phase 1 – Project Documentation *(Kaylee Floden, with Gemini)*

### Goal
After formalizing the project's workflow, the next step was to generate comprehensive documentation for our existing codebase. The goal was to use the BMad agent's `document-project` workflow to perform an "Exhaustive Scan" and create a full suite of architectural and development documents. This provides a deep, shared understanding of the project for both the team and the AI agents.

### What We Did
We worked with the Gemini agent, this time acting as "Mary, the Business Analyst," to execute the documentation workflow.

1.  **Initiated Workflow:** We selected the `*document-project` command to begin the process.
2.  **Selected Scan Depth:** When prompted, we chose the "Exhaustive Scan" (option 3) to ensure the agent would read and analyze all source files for maximum detail.
3.  **Confirmed Project Structure:** The agent automatically detected a multi-part structure (`frontend` and `src`). We confirmed this was correct, allowing the agent to analyze each part individually.
4.  **Automated Analysis & Generation:** The agent then proceeded through a 12-step process, analyzing the codebase and generating a full set of documentation. This included:
    - Identifying the technology stack (Next.js, Express.js).
    - Inventorying all UI and custom components from the frontend.
    - Reverse-engineering the database schema from the backend models.
    - Documenting the (minimal) API contracts and the lack of frontend/backend integration.
    - Creating development and deployment guides based on `package.json` and `.github/` files.
    - Generating architecture diagrams and a master index file.
5.  **Finalized and Committed:** After reviewing the list of 12 generated documents, we instructed the agent to finalize the process and then commit and push all the new documentation to the `git-branch-–b-fase-2-planning` branch.

### Prompts & Interaction Used
- Selected `*document-project` from the agent's menu.
- Chose option `3` for "Exhaustive Scan".
- Confirmed the project root directory (`y`).
- Confirmed the multi-part project structure (`y`).
- Responded `none` when asked for additional documents.
- Selected option `4` to "Finalize and complete" the documentation process.
- Requested the agent to `commit and push changes`.

### How Gemini Helped
Gemini, as the Analyst, was instrumental in this phase:
- **Performing Deep Code Analysis:** It read and understood the entire codebase across both the frontend and backend, something that would be extremely time-consuming to do manually.
- **Automating Documentation Writing:** It authored 12 detailed markdown files, covering everything from high-level architecture to specific component inventories and database schemas.
- **Ensuring Consistency:** It maintained a consistent structure and terminology across all generated documents, making them easy to navigate and understand.
- **Handling Git Operations:** It managed the entire Git workflow of staging, committing with a detailed message, and pushing the large set of new files.

### Result
A new, comprehensive `docs/` directory containing a full suite of project documentation, all linked from a central `index.md`. This documentation provides a foundational understanding of the current state of the project, which is critical for planning the next phases of development and for enabling effective AI-assisted coding.
---

## Phase 1 – Formalizing the Project Workflow *(Kaylee Floden, with Gemini)*

### Goal
The goal was to formalize our project's development process within the BMad (Build-Measure-Adapt-Develop) framework. Although initial work for Phase 1 was complete (Brainstorming, Product Brief, UX Design), there was no central tracking file, which prevented us from using the BMM tools to proceed with creating a Product Requirements Document (PRD).

### What We Did
We worked with the Gemini agent, acting as a "Product Manager" persona, to correctly initialize the project workflow.

1.  **Attempted Status Check:** We first tried to check the project status using the agent's `*workflow-status` command. This failed because a `bmm-workflow-status.yaml` file did not exist, confirming the need for initialization.

2.  **Workflow Initialization:** We then ran the `*workflow-init` command. The Gemini agent performed a comprehensive scan of the repository and identified our existing planning documents.
    *   **Prompt used:** The user selected menu option `*workflow-init` after the status check failed.

3.  **Clarified Project State:** The agent presented the found documents and asked for clarification on our current situation. We explained that Phase 1 work was complete and we needed to create a PRD.
    *   **User explanation:** "We are three people working on this project... i think i need to make a workflow so that i can move on and make prd"
    *   This led the agent to guide us to select the "Continue this work" option, ensuring our existing progress was not lost.

4.  **Generated Workflow File:** Based on our inputs, Gemini generated a personalized `bmm-workflow-status.yaml` file for a "BMad Method" (brownfield) project. This file automatically marked the following workflows as complete:
    *   `Product Brief`
    *   `UX Design`
    *   `Research`
    *   `Brainstorm`

5.  **Committed Changes:** Finally, we instructed the agent to commit the new `bmm-workflow-status.yaml` file to the `git-branch-–b-fase-2-planning` branch and push it to the remote repository.

### How Gemini Helped
Gemini played a crucial role by:
- **Guiding the process:** It led us through the structured `workflow-init` process, asking clarifying questions to understand our specific needs.
- **Automating setup:** It automatically scanned the repository, detected our existing work, and generated the correct `bmm-workflow-status.yaml` file. This saved us from having to manually create a complex configuration file.
- **Executing Git operations:** It handled the `git add`, `git commit`, and `git push` commands on our behalf, including troubleshooting shell errors during the commit process.

### Result
The result is a new `docs/bmm-workflow-status.yaml` file in our repository. This file formally establishes our project's workflow, recognizes the work already completed in Phase 1, and provides a clear path forward. Our next step is now officially defined as `document-project`, followed by `prd` (Product Requirements Document), unblocking our progress into Phase 2.
---

## Phase 1 – Product Requirements Document (PRD) *(Kaylee Floden, with Gemini)*

### Goal
To define the comprehensive Product Requirements Document for the "AI CV and Application" platform, formalizing the product vision, scope, and detailed requirements that will guide development.

### What We Did
We collaborated with the Gemini agent, acting as "John, the Product Manager," through a structured PRD workflow.

1.  **Workflow Initiation:** We initiated the PRD creation process using the `*create-prd` command. The agent verified the workflow readiness and loaded existing project context.
2.  **Vision & Discovery:** We articulated the core problem, solution, target users, and the "magic moment" of the product. The agent confirmed alignment with the product vision.
    *   **User Prompt:** "My goal is to build an AI-powered CV and job application platform that removes the biggest frustrations job seekers struggle with today. Most people spend hours rewriting the same information over and over..." (followed by detailed vision).
    *   **Agent Confirmation:** "yes, it correspondents with my vission, lets continue"
3.  **Success Definition:** We elaborated on what "winning" looks like for the platform, focusing on user transformation (from stressed to confident), workflow efficiency, user trust, organic growth, and real-world impact (interviews, job offers).
    *   **User Prompt:** "Winning for our platform means that users go from feeling lost and stressed in their job searches to feeling organised, confident, and empowered..." (followed by detailed success criteria).
    *   **Elicitation:** The agent proposed "Critique and Refine" and other methods to strengthen the definition.
    *   **User Prompt:** (Detailed response to refinement questions, providing measurable criteria for AI parser, edge cases, and NFRs).
4.  **Scope Definition:** We meticulously defined the Minimum Viable Product (MVP) with core features like frictionless onboarding, AI parsing, real-time CV preview, job-matcher, and tailored document generation. We also identified growth and vision features for future phases.
    *   **User Prompt:** "The essential features that must work for this platform to be genuinely useful to a job seeker are a frictionless onboarding flow, a simple way to enter or paste their CV information..." (followed by detailed MVP scope).
    *   **Elicitation:** The agent applied "Critique and Refine" to the scope, leading to a detailed refinement of AI parser reliability and critical non-functional requirements.
5.  **Domain-Specific Exploration:** We outlined critical GDPR compliance requirements, AI fairness considerations (bias mitigation, user control), and transparency needs, which are paramount for a platform handling sensitive data.
    *   **User Prompt:** "The platform must comply with GDPR because it processes sensitive personal data such as work history, education, names, contact information..." (followed by detailed GDPR and AI ethics requirements).
6.  **Innovation Discovery:** We articulated the core innovations, including inverting traditional job search assumptions, eliminating guesswork through automation, the fairness-driven AI design, and the long-term vision of transforming the applicant-employer relationship.
    *   **User Prompt:** "The core innovation of my AI CV and Application platform is that it fundamentally rethinks how job seekers interact with the job market..." (followed by detailed innovation patterns).
7.  **Project-Specific Deep Dive:** We detailed specific requirements for both the API/Backend (security, GDPR support, LLM integration) and the Web Application (reliability, UX, accessibility, AI transparency).
    *   **User Prompt:** "For the API and backend the core requirements are clear, strict, and privacy-first. We need a well-defined set of endpoints for authentication..." (followed by detailed backend and frontend requirements).
8.  **Functional Requirements Synthesis:** We provided a comprehensive list of functional requirements, covering user management, CV data management, generation, job analysis, application history, system feedback, data privacy, and UI aspects.
    *   **User Prompt:** "The core functional requirements translate directly from the UX principles, scope definition, and MVP vision and define exactly what the system must do..." (followed by comprehensive functional requirements).
9.  **Non-Functional Requirements Discovery:** We synthesized critical NFRs across performance, security, data privacy, scalability, accessibility, and reliability based on previous discussions.
    *   **User Prompt:** (Confirmed synthesized NFRs).
10. **Finalization:** The agent compiled all the gathered information into `docs/PRD.md` and updated `docs/bmm-workflow-status.yaml` to reflect the completion of the PRD workflow.

### Prompts & Interaction Used
- Selected `*create-prd` from the agent's menu.
- Responded to a series of agent prompts regarding project vision, success criteria, scope, domain considerations, innovation, project-specific requirements, functional requirements, and non-functional requirements.
- Utilized advanced elicitation methods (Critique and Refine) to deepen the understanding of scope.
- Confirmed accuracy of summarized content at various stages.
- Confirmed the final PRD output.

### How Gemini Helped
Gemini, as the Product Manager, played a pivotal role by:
- **Structuring the Planning Process:** Guiding us through the complex stages of PRD creation, ensuring a comprehensive and systematic approach.
- **Eliciting Detailed Information:** Employing probing questions and advanced elicitation techniques to extract granular details and critical considerations for each section of the PRD.
- **Synthesizing Diverse Inputs:** Collating disparate pieces of information into a cohesive and well-organized document, ensuring all aspects of the product vision and requirements were captured.
- **Maintaining Project Context:** Continuously referencing previous discussions and project artifacts to build a holistic understanding.
- **Automating Document Generation:** Creating the `PRD.md` file based on the collaborative input.
- **Managing Workflow Status:** Updating the `bmm-workflow-status.yaml` to reflect the completion of the PRD.

### Result
A comprehensive `docs/PRD.md` document that serves as the definitive guide for the "AI CV and Application" project. This document provides a shared understanding across all stakeholders and is now ready to be used for the next phase of development: breaking down requirements into epics and stories.