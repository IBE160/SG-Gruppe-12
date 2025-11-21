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