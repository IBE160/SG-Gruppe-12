# Integration Architecture

This document describes the communication and data flow between the different parts of the "AI CV and Application" project.

## Overview

The project is composed of two main parts:
- **`frontend`**: A Next.js web application.
- **`src` (backend)**: An Express.js API.

The intended architecture is for the `frontend` to consume APIs provided by the `backend`.

## Integration Points

As of the current analysis, **no active integration points were found** between the frontend and backend.

- The frontend application is currently a static landing page and does not make any `fetch` or `axios` calls to the backend.
- The backend API has a single `GET /` health-check endpoint but no other routes for the frontend to consume.

### Future Integration

The expected integration pattern is **REST API calls** over HTTPS. The frontend will call endpoints on the backend to:
- Authenticate users.
- Manage user data (CVs, job postings).
- Trigger AI-powered analysis and content generation.
- Retrieve analysis results.
