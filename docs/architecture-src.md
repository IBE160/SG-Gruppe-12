# Architecture Documentation - Backend (src)

This document provides a detailed overview of the architecture for the `src` (backend) part of the "AI CV and Application" project.

## 1. Executive Summary

The backend is a Node.js application built with the Express.js framework. Its primary responsibility is to serve as an API for the frontend, handle business logic, interact with the PostgreSQL database, and (in the future) integrate with AI services for CV analysis and generation.

- **Project Type:** Backend API
- **Primary Technologies:** Node.js, Express.js, PostgreSQL
- **Architectural Style:** Layered, Service-oriented API

## 2. Technology Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/) (^4.18.2)
- **Language:** JavaScript
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via the `pg` driver ^8.16.3)
- **Environment Management:** `dotenv`

## 3. Architecture Pattern

The backend follows a **Layered Architecture**, which separates concerns into distinct layers:

1.  **Routing Layer (`src/routes/`)**: Defines the API endpoints. *Currently, this layer is not utilized, with a single route in `app.js`.*
2.  **Controller Layer (`src/controllers/`)**: Handles incoming HTTP requests, validates input, and calls the appropriate service.
3.  **Service Layer (`src/services/`)**: Contains the core business logic of the application. It orchestrates calls to the data access layer and any external services.
4.  **Data Access Layer (`src/models/`)**: Responsible for all communication with the PostgreSQL database. It encapsulates SQL queries and provides a clean interface to the services.
5.  **Utility Layer (`src/utils/`)**: Contains shared utilities, such as the database connection setup.

This pattern makes the application easier to maintain, test, and scale by isolating responsibilities.

## 4. Data Architecture

The data architecture is centered around a PostgreSQL relational database. The schema is defined implicitly through the data access objects in `src/models/`.

- **Key Tables:** `users`, `cvs`, `cv_components`, `job_postings`, `application_analyses`.
- **Relationships:** The tables are linked via foreign keys (e.g., `cvs` belongs to a `user`, an `application_analysis` links a `user`, a `cv`, and a `job_posting`).
- **Data Integrity:** The database is the single source of truth for all application data.

A complete description of the tables and their columns can be found in the [Data Models](./data-models-backend.md) document.

## 5. API Design

The API is intended to be a RESTful service. However, the current implementation is minimal.

- **Endpoints:** Only a single `GET /` health-check endpoint is defined.
- **Data Format:** JSON is the expected data format for requests and responses.
- **Authentication:** No authentication middleware is currently implemented, but the presence of `password_hash` in the `users` table suggests a future token-based (e.g., JWT) authentication strategy.

A detailed (though currently sparse) list of endpoints is in the [API Contracts](./api-contracts-backend.md) document.

## 6. Source Tree

The directory structure is organized by layer:

- **`src/controllers/`**: Request handlers.
- **`src/middleware/`**: Express middleware.
- **`src/models/`**: Database interaction logic.
- **`src/routes/`**: Endpoint definitions.
- **`src/services/`**: Business logic.
- **`src/utils/`**: Shared utilities.
- **`app.js`**: Express app configuration.
- **`server.js`**: Server entry point.

*(See the full [Source Tree Analysis](./source-tree-analysis.md) for more detail.)*

## 7. Development and Deployment

- **Development:** The backend is run using `npm` scripts for development (`npm run dev`) and production (`npm run start`). It relies on a `.env` file for configuration.
- **Deployment:** No deployment configuration (like a Dockerfile) exists yet. The application is a standard Node.js server that can be deployed to any Node.js hosting environment.

*(See the [Development Guide](./development-guide.md) and [Deployment Guide](./deployment-guide.md) for complete instructions.)*
