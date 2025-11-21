# Source Tree Analysis

This document provides an annotated analysis of the project's directory structure, showing the organization of the frontend and backend parts.

## Project Structure Overview

The project is a multi-part application with a clear separation between the frontend and backend.

- **`frontend/`**: A Next.js (TypeScript) application that serves as the user interface.
- **`src/`**: An Express.js (JavaScript) application that provides the backend API and database interactions.

## Annotated Directory Tree

```
project-root/
├── frontend/          # Next.js (TypeScript) frontend application (Part: frontend)
│   ├── src/
│   │   ├── app/         # Main application pages and layouts (inferred from Next.js conventions)
│   │   ├── components/  # Reusable UI components
│   │   │   ├── custom/  # Application-specific components (e.g., ATSScoreCard)
│   │   │   └── ui/      # Base UI components from shadcn/ui (e.g., Button, Card)
│   │   ├── lib/         # Utility functions (e.g., cn for classnames)
│   │   ├── styles/      # Global stylesheets
│   │   └── types/       # TypeScript type definitions (e.g., CVData, Change)
│   ├── public/        # Static assets like images and fonts (inferred)
│   ├── next.config.js # Next.js configuration file
│   └── package.json   # Frontend dependencies and scripts
│
├── src/               # Express.js (JavaScript) backend API (Part: src)
│   ├── controllers/   # Request handlers that process API requests
│   ├── middleware/    # Custom Express middleware
│   ├── models/        # Database models defining the schema for tables like users, cvs, etc.
│   ├── routes/        # API route definitions (currently empty)
│   ├── services/      # Business logic layer
│   ├── utils/         # Utility functions (e.g., database connection)
│   ├── app.js         # Express application setup and middleware configuration
│   └── server.js      # The main entry point that starts the Node.js server
│
├── docs/              # Contains all generated and manually created project documentation.
│
├── .github/           # GitHub-specific configuration.
│   └── workflows/     # Contains the CI/CD pipeline definition (ci.yml).
│
├── package.json       # Defines backend dependencies (like express, pg) and project scripts.
│
└── README.md          # The main README file for the project.
```

## Part Interfaces

- The **`frontend`** application is expected to make API calls to the **`src` (backend)** to fetch data, perform analyses, and manage user information.
- The **`src` (backend)** interfaces with the PostgreSQL database, defined by the schemas in `src/models/`.
