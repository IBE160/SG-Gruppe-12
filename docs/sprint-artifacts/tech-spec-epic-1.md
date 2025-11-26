# Epic 1: Platform Foundation & User Onboarding - Technical Specification

## 1. Introduction
This document outlines the technical design and implementation details for Epic 1: "Platform Foundation & User Onboarding" of the AI CV & Job Application Assistant project. It consolidates architectural decisions, technology choices, and implementation strategies relevant to establishing the core technical infrastructure, user authentication, and basic profile creation.

## 2. Goals & Scope
Epic 1 aims to:
- Establish the monorepo structure with frontend, backend, and documentation directories.
- Configure Node.js/Express.js backend and Next.js/React/Tailwind CSS frontend.
- Integrate PostgreSQL as the primary database with Prisma ORM.
- Implement secure user registration, login, and session management (JWT).
- Set up a basic CI/CD pipeline using GitHub Actions.

## 3. Architecture Overview
### 3.1 Overall System Architecture
The project follows a monorepo structure containing a Next.js (React) frontend and a Node.js (Express.js) backend. Communication between frontend and backend is via RESTful APIs. PostgreSQL is the primary data store, accessed by the backend via Prisma ORM.

### 3.2 Backend Architecture (src/)
- **Runtime**: Node.js v20.x LTS
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.3+
- **ORM**: Prisma 5.x for PostgreSQL
- **Database**: PostgreSQL 15+ (via Supabase)
- **Authentication**: JWT (jsonwebtoken library) with HTTP-only cookies
- **Project Structure**: Layered (controllers, services, repositories, middleware, utils)

### 3.3 Frontend Architecture (frontend/)
- **Framework**: Next.js 14 with App Router (React Server Components)
- **UI Library**: shadcn/ui (Tailwind CSS + Radix UI primitives)
- **Styling**: Tailwind CSS 3.4+
- **State Management**: Zustand (local/global UI state), SWR (server state fetching)
- **Forms**: React Hook Form + Zod validation
- **Project Structure**: Feature-driven, component-based

## 4. Technology Choices & Justification
- **Monorepo**: Facilitates code sharing, unified tooling, and atomic commits across frontend and backend.
- **Node.js/Express.js/TypeScript**: Robust, scalable, and type-safe backend development.
- **Prisma**: Modern ORM offering type-safe queries and excellent developer experience with PostgreSQL.
- **Next.js/React**: Industry-standard for performant, scalable web applications with strong ecosystem support.
- **Tailwind CSS/shadcn/ui**: Utility-first CSS framework for rapid UI development and highly customizable, accessible components.
- **Zod**: TypeScript-first schema validation, ensuring data integrity across layers.
- **Zustand/SWR**: Efficient state management solutions for React applications.
- **JWT**: Secure, stateless authentication mechanism.

## 5. Data Model (Relevant to Epic 1)
- **User Model**:
  - `id`: Unique identifier (UUID/Integer)
  - `email`: User's email (unique)
  - `name`: User's display name
  - `password_hash`: Hashed password
  - `created_at`: Timestamp
  - `updated_at`: Timestamp
- **Prisma Schema**: Defined in `prisma/schema.prisma`.

## 6. API Design (Relevant to Epic 1)
- **Authentication Endpoints**:
  - `POST /api/v1/auth/register`: User registration.
  - `POST /api/v1/auth/login`: User login, issuing JWT tokens.
  - `POST /api/v1/auth/logout`: User logout.
- **User Profile Endpoints**:
  - `GET /api/v1/user/profile`: Retrieve authenticated user's profile.
  - `PATCH /api/v1/user/profile`: Update authenticated user's profile.

## 7. Security Considerations (Relevant to Epic 1)
- **Password Hashing**: Use `bcrypt` for secure password storage.
- **JWT Security**: Store tokens in HTTP-only, secure cookies.
- **Middleware**: Implement security middleware (e.g., `helmet`, CORS configuration).
- **Environment Variables**: Use `.env` files for sensitive configuration (e.g., `DATABASE_URL`, `JWT_SECRET`).

## 8. Testing Strategy
- **Unit Tests**: Jest for isolated testing of functions, services, and utilities.
- **Integration Tests**: Supertest for API endpoints, verifying interaction between controllers, services, and repositories (mocking external dependencies).
- **E2E Tests**: Playwright for end-to-end user flows, simulating browser interactions.
- **CI/CD**: GitHub Actions to automate linting, testing, and building across the monorepo.

## 9. CI/CD Pipeline
- **Platform**: GitHub Actions.
- **Workflow (`.github/workflows/ci.yml`)**:
  - Separate jobs for backend (`src/`) and frontend (`frontend/`).
  - Steps include `actions/checkout`, `actions/setup-node`, `npm install` (per workspace), `npm run lint`, `npm test`, `npm run build` (frontend only).

## 10. Open Questions & Future Considerations
- Database connection pooling configuration (Prisma).
- Detailed error handling strategy (custom error classes, global middleware).
- Logging strategy (Winston, PII redaction).
- More robust input validation for all API endpoints.

## 11. Known Risks & Mitigations (from Architecture Review)
- **Risk:** Weak Password Policy. **Mitigation:** Strengthen to 12+ chars, special char, breach check. (High Priority)
- **Risk:** JWT Refresh Token Rotation Not Implemented. **Mitigation:** Implement rotation with blacklisting. (High Priority)
- **Risk:** No Content Security Policy (CSP) Headers. **Mitigation:** Configure strict CSP. (High Priority)
- **Risk:** No Application Performance Monitoring (APM). **Mitigation:** Add Sentry Performance Monitoring. (High Priority)

---
**Status:** DRAFT
**Version:** 1.0
**Created By:** AI Agent
**Date:** 2025-11-26