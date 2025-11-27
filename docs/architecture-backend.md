# Backend Architecture Specification
## AI CV & Job Application Assistant

**Version:** 1.0
**Created:** 2025-11-24
**Status:** Ready for Implementation
**Phase:** Phase 2 - Solutioning (Architecture Design)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [API Layer Architecture](#4-api-layer-architecture)
5. [Middleware Stack](#5-middleware-stack)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [AI Service Integration](#7-ai-service-integration)
8. [File Upload Handling](#8-file-upload-handling)
9. [Document Generation](#9-document-generation)
10. [Background Job Processing](#10-background-job-processing)
11. [Error Handling](#11-error-handling)
12. [Logging Strategy](#12-logging-strategy)
13. [GDPR Compliance Implementation](#13-gdpr-compliance-implementation)
14. [Security Measures](#14-security-measures)
15. [Performance Considerations](#15-performance-considerations)
16. [Epic Story Mapping](#16-epic-story-mapping)
17. [Technical Risks & Mitigations](#17-technical-risks--mitigations)

---

## 1. Executive Summary

This document defines the complete backend architecture for the AI CV & Job Application Assistant platform, a Node.js/Express.js API service that powers CV management, job analysis, and AI-driven application generation.

### Key Architectural Decisions

1. **Runtime:** Node.js v20.x LTS (Long-Term Support)
2. **Framework:** Express.js 4.x (battle-tested, extensive middleware ecosystem)
3. **Language:** TypeScript 5.3+ (strict mode for type safety)
4. **ORM:** Prisma 5.x (modern DX, excellent TypeScript integration, type-safe queries)
5. **Validation:** Zod 3.22+ (aligns with frontend, runtime safety)
6. **Authentication:** JWT (jsonwebtoken library) with HTTP-only cookies
7. **File Processing:** Multer (multipart/form-data handling)
8. **Background Jobs:** Bull 4.x + Redis (reliable queue management)
9. **AI Integration:** Vercel AI SDK 3.x (unified LLM interface)
10. **Database:** PostgreSQL 15+ via Supabase (managed, GDPR-compliant)

### Architecture Philosophy

- **Security-First:** Encryption, GDPR compliance, LLM sandboxing built-in from day one
- **Scalability-Ready:** Stateless design, horizontal scaling, database connection pooling
- **Observability:** Comprehensive logging with PII redaction, error tracking
- **Developer Experience:** TypeScript everywhere, schema validation, clear separation of concerns
- **AI-Powered:** Gemini 2.5 Flash primary, GPT-4/Claude fallback, prompt versioning

---

## 2. Technology Stack

### Core Runtime & Framework

**Node.js v20.x LTS**
- **Rationale:** LTS version ensures stability, security patches, and long-term support
- **Features:** Native ESM support, improved performance, fetch API built-in
- **Minimum Version:** 20.9.0 (released October 2023)

**Express.js 4.18+**
- **Rationale:** Industry-standard, mature ecosystem, extensive middleware, well-documented
- **Alternatives Considered:**
  - Fastify: Higher performance but smaller ecosystem, less familiar to team
  - NestJS: Opinionated, heavyweight, overkill for MVP
- **Decision:** Express.js for balance of power and simplicity

### Language & Type Safety

**TypeScript 5.3+**
- **Configuration:** Strict mode enabled (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`)
- **Rationale:** Type safety reduces runtime errors, improves refactoring confidence, aligns with frontend
- **Build:** TSC (TypeScript Compiler) or ESBuild for faster builds

### Database & ORM

**Prisma 5.x**
- **Rationale:**
  - Type-safe query builder (auto-generated TypeScript types)
  - Modern migration system (Prisma Migrate)
  - Excellent DX (Prisma Studio for database inspection)
  - Connection pooling built-in
- **Alternatives Considered:**
  - Sequelize: Legacy, less type-safe, verbose
  - TypeORM: Good but less ergonomic than Prisma
- **Decision:** Prisma for modern developer experience

**PostgreSQL 15+ (Supabase Cloud)**
- **Rationale:** ACID compliance, advanced features (JSONB, full-text search), GDPR-compliant EU hosting
- **Hosting:** Supabase (managed PostgreSQL + storage + auth)

### Validation & Schema

**Zod 3.22+**
- **Rationale:**
  - TypeScript-first (inferred types from schemas)
  - Runtime validation (protect against malformed requests)
  - Aligns with frontend (shared schemas possible)
- **Usage:** API request validation, environment variable validation, Prisma schema validation

### Authentication

**jsonwebtoken 9.x**
- **Rationale:** JWT standard, stateless authentication, widely supported
- **Strategy:**
  - Access token (15-minute expiry, stored in HTTP-only cookie)
  - Refresh token (7-day expiry, stored in HTTP-only cookie)
- **Alternative Considered:** Passport.js (too heavyweight for MVP)

### File Handling

**Multer 1.4+**
- **Rationale:** De facto standard for multipart/form-data, simple API, well-maintained
- **Configuration:** Memory storage for MVP, S3 storage for production

### Background Jobs

**Bull 4.x**
- **Rationale:** Redis-based, reliable, excellent retry logic, dashboard (Bull Board)
- **Redis Provider:** Upstash (serverless Redis, free tier sufficient for MVP)
- **Job Types:** CV parsing, document generation, data export, email sending

### AI Integration

**Vercel AI SDK 3.x**
- **Rationale:** Unified interface for multiple LLM providers, streaming support, TypeScript-first
- **Primary LLM:** Google Gemini 2.5 Flash (fast, cost-effective)
- **Fallbacks:** GPT-4 (OpenAI), Claude 3.5 (Anthropic)
- **Alternative Considered:** Direct API calls (too much boilerplate, no unified streaming)

### Document Generation

**Puppeteer 21+** (PDF)
- **Rationale:** Chromium-based, high-fidelity rendering, supports complex CSS
- **Alternative Considered:** html-pdf (deprecated, poor CSS support)

**docx 8.x** (DOCX)
- **Rationale:** Pure JavaScript, no external dependencies, programmatic document construction

### Logging & Monitoring

**Winston 3.x**
- **Rationale:** Flexible transport system, log levels, JSON formatting
- **Transports:** Console (development), File rotation (production), Sentry (errors)

**Morgan 1.x**
- **Rationale:** HTTP request logging middleware, integrates with Winston

**Sentry 7.x**
- **Rationale:** Error tracking, performance monitoring, user context

### Security

**Helmet 7.x**
- **Rationale:** Sets security headers (CSP, HSTS, X-Frame-Options)

**express-rate-limit 7.x**
- **Rationale:** Prevent abuse, protect AI endpoints

**bcrypt 5.x**
- **Rationale:** Password hashing with salt, industry standard

### Development Tools

**Nodemon 3.x** (development server with auto-reload)
**ESLint 8.x** (code linting, Airbnb style guide)
**Prettier 3.x** (code formatting)
**Jest 29.x** (unit testing)
**Supertest 6.x** (API testing)

---

## 3. Project Structure

### Directory Hierarchy

```
backend/
├── src/
│   ├── app.ts                     # Express app setup (middleware, routes)
│   ├── server.ts                  # HTTP server (listens on port)
│   ├── config/
│   │   ├── index.ts               # Centralized config exports
│   │   ├── env.ts                 # Environment variable validation (Zod)
│   │   ├── database.ts            # Prisma client initialization
│   │   ├── redis.ts               # Redis client initialization
│   │   ├── constants.ts           # App-wide constants
│   │   └── ai-providers.ts        # LLM provider configs (Gemini, GPT-4, Claude)
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT verification, protected route guard
│   │   ├── error.middleware.ts    # Global error handler (last middleware)
│   │   ├── validate.middleware.ts # Zod schema validation wrapper
│   │   ├── logging.middleware.ts  # Morgan + Winston integration
│   │   ├── rate-limit.middleware.ts # Rate limiting configs
│   │   └── sanitize.middleware.ts # Input sanitization (XSS prevention)
│   ├── routes/
│   │   ├── index.ts               # Main router (combines all routes)
│   │   ├── auth.routes.ts         # POST /auth/register, /auth/login, /auth/logout
│   │   ├── cv.routes.ts           # CRUD for CVs, versions, parsing
│   │   ├── job.routes.ts          # Job description analysis, match scoring
│   │   ├── application.routes.ts  # Tailored CV/cover letter generation, history
│   │   ├── user.routes.ts         # User profile, settings, GDPR endpoints
│   │   └── health.routes.ts       # GET /health (uptime check)
│   ├── controllers/
│   │   ├── auth.controller.ts     # Handle auth requests (thin layer)
│   │   ├── cv.controller.ts       # Handle CV requests
│   │   ├── job.controller.ts      # Handle job analysis requests
│   │   ├── application.controller.ts # Handle application requests
│   │   └── user.controller.ts     # Handle user/GDPR requests
│   ├── services/
│   │   ├── auth.service.ts        # Business logic: JWT generation, password hashing
│   │   ├── cv.service.ts          # Business logic: CV CRUD, versioning
│   │   ├── parsing.service.ts     # AI-powered CV parsing (Gemini)
│   │   ├── job-analysis.service.ts # Keyword extraction, match scoring, ATS scoring
│   │   ├── tailoring.service.ts   # AI-driven CV/cover letter generation
│   │   ├── document-generation.service.ts # PDF/DOCX generation (Puppeteer, docx)
│   │   ├── gdpr.service.ts        # Data export, deletion, consent management
│   │   ├── email.service.ts       # Email sending (transactional)
│   │   └── storage.service.ts     # Supabase Storage integration (file uploads)
│   ├── repositories/
│   │   ├── user.repository.ts     # Database access: User CRUD
│   │   ├── cv.repository.ts       # Database access: CV CRUD
│   │   ├── job.repository.ts      # Database access: Job postings CRUD
│   │   ├── application.repository.ts # Database access: Applications CRUD
│   │   └── consent.repository.ts  # Database access: Consent logs
│   ├── models/
│   │   └── prisma/                # (Prisma generates types from schema.prisma)
│   ├── utils/
│   │   ├── jwt.util.ts            # JWT sign/verify/decode helpers
│   │   ├── password.util.ts       # bcrypt hash/compare wrappers
│   │   ├── logger.util.ts         # Winston logger instance
│   │   ├── errors.util.ts         # Custom error classes (ValidationError, NotFoundError)
│   │   ├── redact.util.ts         # PII redaction for logs
│   │   └── retry.util.ts          # Retry logic for external services
│   ├── validators/
│   │   ├── auth.validator.ts      # Zod schemas: register, login
│   │   ├── cv.validator.ts        # Zod schemas: CV data
│   │   ├── job.validator.ts       # Zod schemas: Job description input
│   │   └── application.validator.ts # Zod schemas: Application generation
│   ├── types/
│   │   ├── auth.types.ts          # JWT payload, user session types
│   │   ├── cv.types.ts            # CV data structures
│   │   ├── job.types.ts           # Job analysis types
│   │   ├── application.types.ts   # Application generation types
│   │   └── api.types.ts           # Generic API response types
│   ├── jobs/
│   │   ├── index.ts               # Bull queue setup
│   │   ├── cv-parsing.job.ts      # Background CV parsing
│   │   ├── document-generation.job.ts # Background PDF/DOCX generation
│   │   ├── data-export.job.ts     # Background data export (GDPR)
│   │   └── email.job.ts           # Background email sending
│   └── prompts/
│       ├── cv-parsing.prompt.ts   # Versioned prompt templates for CV parsing
│       ├── job-extraction.prompt.ts # Job keyword extraction prompts
│       ├── tailored-cv.prompt.ts  # CV tailoring prompts
│       └── cover-letter.prompt.ts # Cover letter generation prompts
├── prisma/
│   ├── schema.prisma              # Database schema definition
│   ├── migrations/                # Migration history (auto-generated)
│   └── seed.ts                    # Development seed data
├── tests/
│   ├── unit/                      # Unit tests (services, utils)
│   ├── integration/               # Integration tests (API endpoints)
│   └── fixtures/                  # Test data (mock CVs, job descriptions)
├── .env.example                   # Environment variable template
├── .env                           # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json                  # TypeScript configuration
├── nodemon.json                   # Nodemon configuration
├── jest.config.js                 # Jest test configuration
└── README.md
```

### File Naming Conventions

- **Routes:** `*.routes.ts` (plural, e.g., `cv.routes.ts`)
- **Controllers:** `*.controller.ts` (singular, e.g., `cv.controller.ts`)
- **Services:** `*.service.ts` (singular, e.g., `cv.service.ts`)
- **Repositories:** `*.repository.ts` (singular, e.g., `cv.repository.ts`)
- **Validators:** `*.validator.ts` (singular, e.g., `cv.validator.ts`)
- **Types:** `*.types.ts` (plural, e.g., `cv.types.ts`)
- **Jobs:** `*.job.ts` (singular, e.g., `cv-parsing.job.ts`)
- **Prompts:** `*.prompt.ts` (singular, e.g., `cv-parsing.prompt.ts`)

---

## 4. API Layer Architecture

### RESTful Design Principles

**Resource-Oriented URLs:**
- Use nouns, not verbs: `/cv` not `/getCV`
- Use HTTP methods for actions: `GET`, `POST`, `PATCH`, `DELETE`
- Use plural nouns: `/cvs` not `/cv` (exception: `/auth` as it's not a collection)

**Hierarchical Structure:**
```
/api/v1/
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   └── POST /refresh
├── /cvs
│   ├── GET /           (list user's CVs)
│   ├── POST /          (create new CV)
│   ├── POST /parse     (upload & parse CV file)
│   ├── GET /:id        (get CV by ID)
│   ├── PATCH /:id      (update CV)
│   ├── DELETE /:id     (delete CV)
│   ├── GET /:id/versions (get version history)
│   ├── POST /:id/restore-version (restore previous version)
│   └── GET /:id/download (download PDF/DOCX)
├── /jobs
│   ├── POST /analyze   (analyze job description)
│   ├── GET /:id/match-score (get match score vs. CV)
│   ├── GET /:id/ats-score   (get ATS compatibility score)
│   └── GET /:id/gap-analysis (get skill gap analysis)
├── /applications
│   ├── POST /generate  (generate tailored CV + cover letter)
│   ├── GET /           (list user's applications with filters)
│   ├── GET /:id        (get application by ID)
│   ├── PATCH /:id      (update status, notes)
│   ├── DELETE /:id     (delete application)
│   └── GET /export     (export history as CSV)
└── /user
    ├── GET /profile    (get user profile)
    ├── PATCH /profile  (update profile)
    ├── PATCH /consent  (update GDPR consent)
    ├── POST /data-export (request data export)
    ├── GET /data-export/:token (download export)
    └── DELETE /account (delete account + all data)
```

### Controller Pattern (Thin Controllers, Fat Services)

**Controller Responsibilities:**
1. Receive HTTP request
2. Validate request data (Zod middleware)
3. Extract user context (from JWT)
4. Call service layer
5. Format response
6. Return HTTP response

**Example Controller:**

```typescript
// src/controllers/cv.controller.ts
import { Request, Response, NextFunction } from 'express';
import { cvService } from '../services/cv.service';
import { AuthRequest } from '../types/auth.types';

export const cvController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id; // Extracted by auth middleware
      const cvData = req.body; // Validated by Zod middleware

      const newCV = await cvService.createCV(userId, cvData);

      res.status(201).json({
        success: true,
        data: newCV,
        message: 'CV created successfully'
      });
    } catch (error) {
      next(error); // Pass to error handler middleware
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const cvId = req.params.id;

      const cv = await cvService.getCVById(userId, cvId);

      res.status(200).json({
        success: true,
        data: cv
      });
    } catch (error) {
      next(error);
    }
  },

  // ... other methods
};
```

### Service Layer (Business Logic)

**Service Responsibilities:**
1. Implement business logic
2. Orchestrate multiple repository calls
3. Call external services (AI, storage, email)
4. Handle domain-specific errors
5. Return domain objects

**Example Service:**

```typescript
// src/services/cv.service.ts
import { cvRepository } from '../repositories/cv.repository';
import { NotFoundError, UnauthorizedError } from '../utils/errors.util';
import { CVData, CVVersion } from '../types/cv.types';

export const cvService = {
  async createCV(userId: string, cvData: CVData) {
    // Business logic: Create CV with initial version
    const cv = await cvRepository.create({
      userId,
      ...cvData
    });

    // Create initial version snapshot
    await cvRepository.createVersion(cv.id, cvData, 1);

    return cv;
  },

  async getCVById(userId: string, cvId: string) {
    const cv = await cvRepository.findById(cvId);

    if (!cv) {
      throw new NotFoundError('CV not found');
    }

    if (cv.userId !== userId) {
      throw new UnauthorizedError('Not authorized to access this CV');
    }

    return cv;
  },

  async updateCV(userId: string, cvId: string, updates: Partial<CVData>) {
    const cv = await this.getCVById(userId, cvId); // Authorization check

    // Business logic: Increment version number on update
    const latestVersion = await cvRepository.getLatestVersion(cvId);
    const newVersionNumber = latestVersion ? latestVersion.version_number + 1 : 1;

    // Update CV
    const updatedCV = await cvRepository.update(cvId, updates);

    // Create version snapshot
    await cvRepository.createVersion(cvId, updatedCV, newVersionNumber);

    return updatedCV;
  },

  // ... other methods
};
```

### Repository Pattern (Database Access)

**Repository Responsibilities:**
1. Abstract database queries
2. Use Prisma client
3. Return domain objects (no HTTP concerns)
4. Handle database-specific errors

**Example Repository:**

```typescript
// src/repositories/cv.repository.ts
import { prisma } from '../config/database';
import { CVData } from '../types/cv.types';

export const cvRepository = {
  async create(data: CVData & { userId: string }) {
    return prisma.cv.create({
      data: {
        userId: data.userId,
        personal_info: data.personal_info,
        education: data.education,
        experience: data.experience,
        skills: data.skills,
        languages: data.languages
      }
    });
  },

  async findById(id: string) {
    return prisma.cv.findUnique({
      where: { id }
    });
  },

  async findByUserId(userId: string) {
    return prisma.cv.findMany({
      where: { userId },
      orderBy: { created_at: 'desc' }
    });
  },

  async update(id: string, data: Partial<CVData>) {
    return prisma.cv.update({
      where: { id },
      data
    });
  },

  async delete(id: string) {
    return prisma.cv.delete({
      where: { id }
    });
  },

  async createVersion(cvId: string, snapshot: CVData, versionNumber: number) {
    return prisma.cvVersion.create({
      data: {
        cv_id: cvId,
        version_number: versionNumber,
        snapshot: snapshot as any // JSONB type
      }
    });
  },

  async getLatestVersion(cvId: string) {
    return prisma.cvVersion.findFirst({
      where: { cv_id: cvId },
      orderBy: { version_number: 'desc' }
    });
  },

  // ... other methods
};
```

---

## 5. Middleware Stack

### Middleware Execution Order (Critical)

```typescript
// src/app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { loggingMiddleware } from './middleware/logging.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import routes from './routes';

const app = express();

// 1. Security headers (first, before anything else)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// 2. CORS (allow frontend domain)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Cookie parser
app.use(cookieParser());

// 5. Request logging (Morgan + Winston)
app.use(loggingMiddleware);

// 6. Routes (includes auth middleware for protected routes)
app.use('/api/v1', routes);

// 7. Error handler (MUST be last)
app.use(errorMiddleware);

export default app;
```

### Authentication Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/jwt.util';
import { UnauthorizedError } from '../utils/errors.util';
import { JWTPayload } from '../types/auth.types';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check for token in HTTP-only cookie
    const token = req.cookies['auth-token'];

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    // Verify JWT
    const payload = verifyJWT(token);

    // Attach user to request
    req.user = payload;

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
```

### Validation Middleware (Zod)

```typescript
// src/middleware/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.util';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        next(new ValidationError('Validation failed', errors));
      } else {
        next(error);
      }
    }
  };
};
```

**Usage Example:**

```typescript
// src/routes/cv.routes.ts
import { Router } from 'express';
import { cvController } from '../controllers/cv.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCVSchema } from '../validators/cv.validator';

const router = Router();

router.post(
  '/',
  authenticate,              // 1. Check authentication
  validate(createCVSchema),  // 2. Validate request body
  cvController.create        // 3. Execute controller
);

export default router;
```

### Rate Limiting Middleware

```typescript
// src/middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';

// General rate limit (all endpoints)
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// AI endpoint rate limit (expensive operations)
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'AI processing limit reached, please try again later'
});

// Auth rate limit (prevent brute force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later'
});
```

---

## 6. Authentication & Authorization

### JWT Token Strategy

**Two-Token System:**

1. **Access Token** (Short-lived)
   - Expiry: 15 minutes
   - Storage: HTTP-only cookie
   - Purpose: API authentication
   - Payload: `{ userId, email, iat, exp }`

2. **Refresh Token** (Long-lived)
   - Expiry: 7 days
   - Storage: HTTP-only cookie
   - Purpose: Obtain new access token
   - Payload: `{ userId, iat, exp }`

**Refresh Token Rotation (Security Enhancement):**

To mitigate the risk of a compromised refresh token, a one-time-use rotation strategy is implemented.

1.  **One-Time Use:** Each refresh token is valid for only a single use.
2.  **Redis Blacklist:** When a refresh token is used, its signature is added to a Redis blacklist with an expiry equal to the original token's lifetime (7 days).
3.  **Verification Flow:**
    -   The client sends its refresh token.
    -   The backend first checks if the token exists in the Redis blacklist. If it does, the request is rejected as a potential replay attack, and the user may be logged out.
    -   If the token is not blacklisted, it is verified.
    -   Upon successful verification, the backend issues both a **new access token** and a **new refresh token**.
    -   The old refresh token is then immediately added to the blacklist.
4.  **Benefit:** This ensures that even if a refresh token is captured, its value is extremely limited, as it is invalidated the moment it is used.

**JWT Generation:**

```typescript
// src/services/auth.service.ts
import { signJWT } from '../utils/jwt.util';
import { hashPassword, comparePassword } from '../utils/password.util';
import { userRepository } from '../repositories/user.repository';

export const authService = {
  async register(email: string, password: string, name: string) {
    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await userRepository.create({
      email,
      password_hash: hashedPassword,
      name,
      consent_essential: true, // Required for platform use
      consent_ai_training: false, // Opt-in per GDPR
      consent_marketing: false // Opt-in per GDPR
    });

    // Generate tokens
    const accessToken = signJWT(
      { userId: user.id, email: user.email },
      '15m'
    );
    const refreshToken = signJWT(
      { userId: user.id },
      '7d'
    );

    return { user, accessToken, refreshToken };
  },

  async login(email: string, password: string) {
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Generate tokens
    const accessToken = signJWT(
      { userId: user.id, email: user.email },
      '15m'
    );
    const refreshToken = signJWT(
      { userId: user.id },
      '7d'
    );

    return { user, accessToken, refreshToken };
  },

  async refresh(refreshToken: string) {
    const payload = verifyJWT(refreshToken);

    // Generate new access token
    const user = await userRepository.findById(payload.userId);
    const newAccessToken = signJWT(
      { userId: user.id, email: user.email },
      '15m'
    );

    return { accessToken: newAccessToken };
  }
};
```

**Cookie Configuration:**

```typescript
// src/controllers/auth.controller.ts
export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.login(email, password);

      // Set HTTP-only cookies
      res.cookie('auth-token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        },
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }
};
```

### Password Hashing

```typescript
// src/utils/password.util.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

---

## 7. AI Service Integration

### Vercel AI SDK Integration

**Primary Provider: Google Gemini 2.5 Flash**

```typescript
// src/config/ai-providers.ts
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY!
});

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});
```

**CV Parsing Service:**

```typescript
// src/services/parsing.service.ts
import { generateObject } from 'ai';
import { gemini } from '../config/ai-providers';
import { CVParsingPrompt } from '../prompts/cv-parsing.prompt';
import { CVParsingSchema } from '../validators/cv.validator';

export const parsingService = {
  async parseCV(fileContent: string, fileType: 'pdf' | 'docx' | 'txt') {
    try {
      const prompt = CVParsingPrompt.v1(fileContent, fileType);

      const result = await generateObject({
        model: gemini('gemini-2.5-flash'), // Primary model
        schema: CVParsingSchema,
        prompt,
        temperature: 0.2, // Low temperature for accuracy
      });

      return result.object;
    } catch (error) {
      // Fallback to GPT-4 if Gemini fails
      console.warn('Gemini parsing failed, falling back to GPT-4', error);
      return this.parseCVWithGPT4(fileContent, fileType);
    }
  },

  async parseCVWithGPT4(fileContent: string, fileType: string) {
    const prompt = CVParsingPrompt.v1(fileContent, fileType);

    const result = await generateObject({
      model: openai('gpt-4-turbo'),
      schema: CVParsingSchema,
      prompt,
      temperature: 0.2
    });

    return result.object;
  }
};
```

### Prompt Template Versioning

```typescript
// src/prompts/cv-parsing.prompt.ts
export const CVParsingPrompt = {
  version: '1.0.0',

  v1: (fileContent: string, fileType: string) => `
You are an expert CV parser. Extract structured information from the following ${fileType.toUpperCase()} CV content.

INSTRUCTIONS:
1. Extract ALL personal information (name, email, phone, address)
2. Extract ALL work experience entries (company, title, dates, description)
3. Extract ALL education entries (institution, degree, dates)
4. Extract ALL skills (technical, soft, languages)
5. If information is missing or unclear, leave the field empty (do NOT fabricate data)
6. Standardize dates to ISO 8601 format (YYYY-MM-DD)
7. Infer job titles if not explicitly stated (e.g., "Software Engineer" not "Developer")

CV CONTENT:
${fileContent}

IMPORTANT:
- Be accurate, not creative
- Preserve the candidate's voice in descriptions
- Do not add information that isn't in the CV
`,

  // Future versions can be added here without breaking existing code
  v2: (fileContent: string, fileType: string) => `
    ... improved prompt ...
  `
};
```

**Prompt Versioning Benefits:**
1. **Rollback:** Switch back to previous version if new prompt performs poorly
2. **A/B Testing:** Test multiple prompts side-by-side
3. **Audit Trail:** Track which prompt version generated each result
4. **Gradual Rollout:** Deploy new prompts to subset of users first

### Rate Limiting & Caching for AI Endpoints

```typescript
// src/services/job-analysis.service.ts
import { redis } from '../config/redis';
import { generateObject } from 'ai';
import { gemini } from '../config/ai-providers';

export const jobAnalysisService = {
  async extractKeywords(jobDescription: string) {
    // Cache key: SHA-256 hash of job description
    const cacheKey = `job-analysis:${hashString(jobDescription)}`;

    // Check cache (24-hour TTL)
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Call AI if not cached
    const result = await generateObject({
      model: gemini('gemini-2.5-flash'),
      schema: JobAnalysisSchema,
      prompt: JobExtractionPrompt.v1(jobDescription),
      temperature: 0.3
    });

    // Cache result for 24 hours
    await redis.setex(cacheKey, 86400, JSON.stringify(result.object));

    return result.object;
  }
};
```

### Streaming Responses

```typescript
// src/controllers/application.controller.ts
import { streamText } from 'ai';
import { gemini } from '../config/ai-providers';

export const applicationController = {
  async generateCoverLetter(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { cvData, jobDescription } = req.body;

      const prompt = CoverLetterPrompt.v1(cvData, jobDescription);

      const stream = await streamText({
        model: gemini('gemini-2.5-flash'),
        prompt,
        temperature: 0.7 // Higher temperature for creative writing
      });

      // Set headers for SSE (Server-Sent Events)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Stream response to client
      for await (const chunk of stream.textStream) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }

      res.end();
    } catch (error) {
      next(error);
    }
  }
};
```

---

## 8. File Upload Handling

### Multer Configuration

```typescript
// src/middleware/upload.middleware.ts
import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../utils/errors.util';

// Memory storage for MVP (files stored in RAM temporarily)
const storage = multer.memoryStorage();

// File filter (allow only PDF, DOCX, TXT)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Invalid file type. Only PDF, DOCX, and TXT are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  }
});
```

**Usage:**

```typescript
// src/routes/cv.routes.ts
import { upload } from '../middleware/upload.middleware';

router.post(
  '/parse',
  authenticate,
  upload.single('cv_file'), // Multer middleware
  cvController.parseAndCreate
);
```

### Supabase Storage Integration

```typescript
// src/services/storage.service.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export const storageService = {
  async uploadCV(userId: string, file: Express.Multer.File) {
    const fileName = `${userId}/${Date.now()}-${file.originalname}`;

    const { data, error } = await supabase.storage
      .from('cvs')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;

    return data.path;
  },

  async downloadCV(filePath: string) {
    const { data, error } = await supabase.storage
      .from('cvs')
      .download(filePath);

    if (error) throw error;

    return data;
  },

  async deleteCV(filePath: string) {
    const { error } = await supabase.storage
      .from('cvs')
      .remove([filePath]);

    if (error) throw error;
  }
};
```

---

## 9. Document Generation

### PDF Generation (Puppeteer)

```typescript
// src/services/document-generation.service.ts
import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export const documentGenerationService = {
  async generateCVPDF(cvData: CVData, templateName: string = 'modern') {
    // Load HTML template
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');

    // Compile Handlebars template
    const template = Handlebars.compile(templateContent);
    const html = template(cvData);

    // Launch headless browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });

    await browser.close();

    return pdfBuffer;
  }
};
```

### DOCX Generation

```typescript
// src/services/document-generation.service.ts
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export const documentGenerationService = {
  async generateCVDOCX(cvData: CVData) {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header: Name
            new Paragraph({
              text: cvData.personal_info.name,
              heading: HeadingLevel.HEADING_1,
              alignment: 'center'
            }),

            // Contact info
            new Paragraph({
              children: [
                new TextRun(cvData.personal_info.email),
                new TextRun(' | '),
                new TextRun(cvData.personal_info.phone)
              ],
              alignment: 'center'
            }),

            // Work Experience section
            new Paragraph({
              text: 'Work Experience',
              heading: HeadingLevel.HEADING_2
            }),

            ...cvData.experience.map(exp =>
              new Paragraph({
                children: [
                  new TextRun({ text: exp.title, bold: true }),
                  new TextRun(` at ${exp.company}`),
                  new TextRun({ text: `\n${exp.dates}`, italics: true }),
                  new TextRun(`\n${exp.description}`)
                ]
              })
            ),

            // Education section
            new Paragraph({
              text: 'Education',
              heading: HeadingLevel.HEADING_2
            }),

            ...cvData.education.map(edu =>
              new Paragraph({
                children: [
                  new TextRun({ text: edu.degree, bold: true }),
                  new TextRun(` - ${edu.institution}`),
                  new TextRun({ text: `\n${edu.dates}`, italics: true })
                ]
              })
            ),

            // Skills section
            new Paragraph({
              text: 'Skills',
              heading: HeadingLevel.HEADING_2
            }),

            new Paragraph({
              text: cvData.skills.join(', ')
            })
          ]
        }
      ]
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
};
```

---

## 10. Background Job Processing

### Bull Queue Setup

```typescript
// src/jobs/index.ts
import Queue from 'bull';
import { redis } from '../config/redis';

export const cvParsingQueue = new Queue('cv-parsing', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
});

export const documentGenerationQueue = new Queue('document-generation', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
});

export const dataExportQueue = new Queue('data-export', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
});

export const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  }
});
```

### Job Processors

```typescript
// src/jobs/cv-parsing.job.ts
import { cvParsingQueue } from './index';
import { parsingService } from '../services/parsing.service';
import { cvRepository } from '../repositories/cv.repository';

cvParsingQueue.process(async (job) => {
  const { userId, fileContent, fileType, cvId } = job.data;

  try {
    // Update job progress
    await job.progress(10);

    // Parse CV with AI
    const parsedData = await parsingService.parseCV(fileContent, fileType);
    await job.progress(60);

    // Save parsed data to database
    await cvRepository.update(cvId, parsedData);
    await job.progress(90);

    // Mark job complete
    await job.progress(100);

    return { success: true, cvId };
  } catch (error) {
    console.error('CV parsing job failed:', error);
    throw error; // Bull will retry based on retry strategy
  }
});

// Retry strategy
cvParsingQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);

  if (job.attemptsMade < 3) {
    console.log(`Retrying job ${job.id} (attempt ${job.attemptsMade + 1}/3)`);
  } else {
    console.error(`Job ${job.id} exhausted retries, sending error notification`);
    // TODO: Send error notification to user
  }
});
```

**Add Job to Queue:**

```typescript
// src/controllers/cv.controller.ts
export const cvController = {
  async parseAndCreate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const file = req.file!; // From Multer

      // Create empty CV record
      const cv = await cvRepository.create({
        userId,
        personal_info: {},
        education: [],
        experience: [],
        skills: [],
        languages: []
      });

      // Add parsing job to queue
      await cvParsingQueue.add({
        userId,
        fileContent: file.buffer.toString('utf-8'),
        fileType: file.mimetype.includes('pdf') ? 'pdf' : file.mimetype.includes('word') ? 'docx' : 'txt',
        cvId: cv.id
      });

      res.status(202).json({
        success: true,
        data: { cvId: cv.id },
        message: 'CV parsing started. Check status at /api/v1/cvs/:id'
      });
    } catch (error) {
      next(error);
    }
  }
};
```

---

## 11. Error Handling

### Custom Error Classes

```typescript
// src/utils/errors.util.ts
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  errors: Array<{ field: string; message: string }>;

  constructor(message: string, errors: Array<{ field: string; message: string }> = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
  }
}
```

### Global Error Handler Middleware

```typescript
// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors.util';
import { logger } from '../utils/logger.util';
import * as Sentry from '@sentry/node';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error caught by error handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Report to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(err);
  }

  // Handle known errors
  if (err instanceof AppError) {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors
      });
    }

    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: 'Database operation failed'
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred'
  });
};
```

---

## 12. Logging Strategy

### Winston Logger Setup

```typescript
// src/utils/logger.util.ts
import winston from 'winston';
import { redactPII } from './redact.util';

const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const redactedMeta = redactPII(meta);
  return `${timestamp} [${level}]: ${message} ${JSON.stringify(redactedMeta)}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport (development)
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),

    // File transport (production)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),

    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760,
      maxFiles: 10
    })
  ]
});
```

### PII Redaction

```typescript
// src/utils/redact.util.ts
const SENSITIVE_FIELDS = ['password', 'password_hash', 'email', 'phone', 'address', 'ssn', 'credit_card'];

export function redactPII(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactPII);
  }

  const redacted: any = {};
  for (const key in obj) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = redactPII(obj[key]);
    }
  }

  return redacted;
}
```

---

## 13. GDPR Compliance Implementation

### Consent Management

```typescript
// src/services/gdpr.service.ts
import { userRepository } from '../repositories/user.repository';
import { consentRepository } from '../repositories/consent.repository';

export const gdprService = {
  async updateConsent(userId: string, consentType: string, granted: boolean) {
    // Update user consent flag
    await userRepository.updateConsent(userId, consentType, granted);

    // Log consent change (audit trail)
    await consentRepository.logConsentChange(userId, consentType, granted);

    return { success: true };
  },

  async exportUserData(userId: string) {
    // Collect all user data
    const user = await userRepository.findById(userId);
    const cvs = await cvRepository.findByUserId(userId);
    const applications = await applicationRepository.findByUserId(userId);
    const consents = await consentRepository.findByUserId(userId);

    // Compile export (JSON format)
    const exportData = {
      export_date: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        registration_date: user.created_at
      },
      cvs: cvs.map(cv => ({
        id: cv.id,
        created_at: cv.created_at,
        personal_info: cv.personal_info,
        education: cv.education,
        experience: cv.experience,
        skills: cv.skills,
        languages: cv.languages
      })),
      applications: applications.map(app => ({
        id: app.id,
        created_at: app.created_at,
        job_title: app.job_title,
        tailored_cv: app.tailored_cv,
        cover_letter: app.cover_letter,
        ats_score: app.ats_score
      })),
      consent: {
        essential: user.consent_essential,
        ai_training: user.consent_ai_training,
        marketing: user.consent_marketing,
        updated_at: consents[0]?.timestamp
      }
    };

    return exportData;
  },

  async deleteUserAccount(userId: string) {
    // Cascade delete all user data
    await cvRepository.deleteByUserId(userId);
    await applicationRepository.deleteByUserId(userId);
    await consentRepository.deleteByUserId(userId);
    await userRepository.delete(userId);

    // TODO: Schedule backup deletion (30 days)
    // TODO: Anonymize logs

    return { success: true };
  }
};
```

---

## 14. Security Measures

### Encryption at Rest

**Database Encryption:**
- Supabase PostgreSQL: Enable Transparent Data Encryption (TDE)
- Backup encryption: Automatic via Supabase

**File Storage Encryption:**
- Supabase Storage: Server-side encryption with AES-256

### Input Sanitization

```typescript
// src/middleware/sanitize.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove null bytes (SQL injection prevention)
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/\0/g, '');
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  return obj;
}
```

### HTTPS Enforcement

```typescript
// src/middleware/https.middleware.ts
export const enforceHTTPS = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
};
```

---

## 15. Performance Considerations

### Database Connection Pooling

```typescript
// src/config/database.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Connection pool configuration (via DATABASE_URL params)
// Example: postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10
```

### Query Optimization

```typescript
// src/repositories/cv.repository.ts
export const cvRepository = {
  async findByUserId(userId: string) {
    return prisma.cv.findMany({
      where: { userId },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        personal_info: true,
        // Exclude large fields if not needed
        // experience: false,
        // education: false
      },
      orderBy: { created_at: 'desc' },
      take: 20 // Limit results
    });
  }
};
```

### Compression Middleware

```typescript
// src/app.ts
import compression from 'compression';

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

---

## 16. Epic Story Mapping

### Epic 1: Platform Foundation & User Onboarding

| Story | Backend Services | Key Files |
|-------|------------------|-----------|
| 1.1 | Project setup, database, CI/CD | `src/app.ts`, `prisma/schema.prisma` |
| 1.2 | User registration, password hashing | `auth.service.ts`, `user.repository.ts` |
| 1.3 | Login, JWT generation, cookie handling | `auth.controller.ts`, `jwt.util.ts` |
| 1.4 | Profile creation API | `user.controller.ts` |

### Epic 2: AI-Powered CV Data Management & Preview

| Story | Backend Services | Key Files |
|-------|------------------|-----------|
| 2.1 | Structured data model | `prisma/schema.prisma` |
| 2.2 | CV parsing (Gemini), file upload (Multer) | `parsing.service.ts`, `upload.middleware.ts` |
| 2.4-2.5 | CV CRUD operations | `cv.service.ts`, `cv.repository.ts` |
| 2.6 | Template rendering | `document-generation.service.ts` |
| 2.7 | PDF/DOCX generation (Puppeteer, docx) | `document-generation.service.ts` |
| 2.8 | Autosave (client-side) | N/A (frontend only) |
| 2.9 | Version history API | `cv.repository.ts` (versions) |

### Epic 3: Job Ad Analysis & Match Scoring

| Story | Backend Services | Key Files |
|-------|------------------|-----------|
| 3.1 | Job input API | `job.controller.ts` |
| 3.2 | Keyword extraction (Gemini), caching | `job-analysis.service.ts` |
| 3.3 | Match scoring algorithm | `job-analysis.service.ts` |
| 3.4 | Gap analysis | `job-analysis.service.ts` |
| 3.5 | ATS scoring algorithm | `job-analysis.service.ts` |
| 3.6 | Schema validation (Zod) | `validators/` |

### Epic 4: Tailored Application Generation

| Story | Backend Services | Key Files |
|-------|------------------|-----------|
| 4.1 | AI-driven CV tailoring (Gemini) | `tailoring.service.ts` |
| 4.2 | AI-driven cover letter (Gemini, streaming) | `tailoring.service.ts` |
| 4.3 | Edit API | `application.controller.ts` |
| 4.4 | Application history CRUD | `application.service.ts` |
| 4.5 | Error handling, retry logic | `error.middleware.ts`, Bull retries |

### Epic 5: Trust & Data Governance

| Story | Backend Services | Key Files |
|-------|------------------|-----------|
| 5.1 | Consent management API | `gdpr.service.ts`, `consent.repository.ts` |
| 5.2 | Data export (background job), deletion | `gdpr.service.ts`, `data-export.job.ts` |
| 5.3 | Encryption (Supabase, HTTPS) | N/A (infrastructure) |
| 5.4 | JWT middleware, role-based access | `auth.middleware.ts` |
| 5.5 | LLM sandboxing (no data retention) | Vercel AI SDK config |
| 5.6 | PII redaction in logs | `redact.util.ts`, `logger.util.ts` |
| 5.7 | Bias mitigation (prompt design) | `prompts/` |

---

## 17. Technical Risks & Mitigations

### Risk 1: AI API Costs Exceed Budget

**Mitigation:**
- Implement aggressive caching (Redis, 24-hour TTL for job analyses)
- Use Gemini 2.5 Flash (cheapest model) as primary
- Rate limiting (10 AI requests per 15 minutes per user)
- Background job queues (prevent duplicate requests)
- Monitor costs with OpenAI/Google Cloud dashboards

### Risk 2: Puppeteer Performance Issues

**Mitigation:**
- Use background jobs (Bull) for PDF generation (avoid blocking HTTP requests)
- Limit concurrent Puppeteer instances (max 3)
- Implement timeout (30 seconds max per PDF)
- Fallback to html-pdf if Puppeteer fails

### Risk 3: Database Connection Pool Exhaustion

**Mitigation:**
- Prisma connection pooling (20 connections max)
- Implement connection retry logic
- Monitor connection usage (Prisma metrics)
- Use read replicas for heavy queries (future)

### Risk 4: Redis Downtime Breaks Background Jobs

**Mitigation:**
- Use Upstash (99.99% uptime SLA)
- Implement graceful degradation (jobs fail, user gets error notification)
- Add Redis health check endpoint
- Queue retry logic (Bull handles this)

### Risk 5: GDPR Compliance Gaps

**Mitigation:**
- Automated testing for consent flows
- Regular security audits (quarterly)
- Legal review of privacy policy
- Document all data processing in Data Processing Agreement (DPA)

---

## Conclusion

This Backend Architecture Specification provides a comprehensive blueprint for implementing the AI CV & Job Application Assistant API. All architectural decisions are aligned with the PRD, Frontend Architecture, Database Schema, and Epic stories.

### Key Takeaways

1. **Node.js v20 + Express.js + TypeScript** for type-safe, scalable API
2. **Prisma ORM** for modern database access with PostgreSQL
3. **JWT authentication** with HTTP-only cookies for security
4. **Vercel AI SDK** for unified LLM integration (Gemini, GPT-4, Claude)
5. **Bull + Redis** for reliable background job processing
6. **Winston logging** with PII redaction for GDPR compliance
7. **Comprehensive error handling** with custom error classes
8. **Security-first** approach (Helmet, rate limiting, input sanitization)
9. **Performance-optimized** with caching, connection pooling, compression

### Next Steps

1. **Set up** Node.js project with TypeScript
2. **Configure** Prisma with Supabase PostgreSQL
3. **Implement** Epic 1 stories (authentication, user management)
4. **Deploy** to Render/Railway with CI/CD
5. **Iterate** through Epics 2-5 in priority order

---

**Document Status:** ✅ Ready for Implementation
**Last Updated:** 2025-11-24
**Maintainer:** BMM Architect Agent (Winston)
