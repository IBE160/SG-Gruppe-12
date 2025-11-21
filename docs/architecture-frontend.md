# Architecture Documentation - Frontend

This document provides a detailed overview of the architecture for the `frontend` part of the "AI CV and Application" project.

## 1. Executive Summary

The frontend is a modern web application built with Next.js and TypeScript. It serves as the user interface for the AI CV Assistant, providing a rich, interactive experience. The architecture is designed to be a "fat client," meaning it will handle most of the user interaction, state management, and view logic, while relying on the backend for data and AI processing.

- **Project Type:** Web Application
- **Primary Technologies:** Next.js, React, TypeScript, Tailwind CSS
- **Architectural Style:** Component-based

## 2. Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (^14.2.0)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (^5.4.3)
- **UI Library:** [React](https://react.dev/) (^18.3.0)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (^3.4.1)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (using Radix UI primitives)
- **Linting & Formatting:** ESLint

## 3. Architecture Pattern

The frontend follows a **Component-Based Architecture**, which is standard for React and Next.js applications.

- **Pages and Layouts:** The file-based routing system of Next.js's `app` directory is used to define pages and nested layouts.
- **Component Hierarchy:** The UI is broken down into small, reusable components. A distinction is made between:
    - **Base UI Components (`src/components/ui`):** Generic, unstyled primitives (e.g., Button, Card).
    - **Custom Components (`src/components/custom`):** Domain-specific components with business logic (e.g., `ATSScoreCard`, `CVComparisonView`).
- **State Management:** Currently, local component state (`useState`) is used. For more complex global state, React Context or a library like Zustand/Redux would be introduced.

## 4. Component Overview

The frontend has a rich set of custom components for its core functionality:

- **`MatchScoreGauge`:** Visualizes the match percentage between a CV and a job.
- **`ATSScoreCard`:** Provides a score and actionable feedback on a CV's compatibility with Applicant Tracking Systems.
- **`GapAnalysisPanel`:** Shows missing skills and keywords from the user's CV compared to a job description.
- **`CVComparisonView`:** A side-by-side view to compare the original CV with the AI-tailored version.

A detailed inventory can be found in the [Component Inventory](./component-inventory-frontend.md) document.

## 5. Source Tree

The directory structure is organized around Next.js conventions:

- **`src/app/`**: Contains the main pages and layouts.
- **`src/components/`**: The core of the UI, divided into `ui` and `custom`.
- **`src/lib/`**: Shared utility functions.
- **`src/styles/`**: Global styles.
- **`src/types/`**: TypeScript type definitions.

*(See the full [Source Tree Analysis](./source-tree-analysis.md) for more detail.)*

## 6. Development Workflow

Local development is managed via `npm` scripts defined in `frontend/package.json`.

- **Installation:** `npm install`
- **Run Dev Server:** `npm run dev`
- **Build for Production:** `npm run build`

*(See the [Development Guide](./development-guide.md) for complete instructions.)*

## 7. Deployment Architecture

The frontend is a standalone Next.js application that can be deployed to any platform supporting Node.js or serverless functions (like Vercel or AWS Amplify). Currently, no specific deployment configuration (like a Dockerfile) exists.

*(See the [Deployment Guide](./deployment-guide.md) for more detail.)*
