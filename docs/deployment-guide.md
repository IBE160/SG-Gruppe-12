# Deployment Guide
## AI CV & Job Application Assistant

**Version:** 1.0
**Created:** 2025-11-24
**Status:** Ready for Implementation
**Phase:** Phase 2 - Solutioning (Architecture Design)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Deployment Architecture Overview](#2-deployment-architecture-overview)
3. [Environment Variables](#3-environment-variables)
4. [Vercel Deployment (Frontend)](#4-vercel-deployment-frontend)
5. [Render Deployment (Backend)](#5-render-deployment-backend)
6. [Supabase Setup](#6-supabase-setup)
7. [Upstash Redis Setup](#7-upstash-redis-setup)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Monitoring & Logging](#9-monitoring--logging)
10. [Backup Strategy](#10-backup-strategy)
11. [Scaling Strategy](#11-scaling-strategy)
12. [Security Checklist](#12-security-checklist)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Executive Summary

This document provides a complete deployment guide for the AI CV & Job Application Assistant platform, covering infrastructure setup, environment configuration, CI/CD pipelines, monitoring, and scaling strategies.

### Deployment Stack

| Component | Service | Plan | Cost (MVP) |
|-----------|---------|------|-----------|
| **Frontend** | Vercel | Hobby | Free |
| **Backend** | Render | Starter | $7/month |
| **Database** | Supabase | Free | Free (500 MB) |
| **File Storage** | Supabase Storage | Free | Free (1 GB) |
| **Redis** | Upstash | Free | Free (10k commands/day) |
| **AI APIs** | Google/OpenAI | Pay-as-you-go | ~$10-50/month |
| **Monitoring** | Sentry | Developer | Free (5k errors/month) |
| **Total** | | | **~$17-57/month** |

### Architecture Philosophy

- **Serverless-First:** Vercel Edge Functions for frontend, serverless PostgreSQL (Supabase)
- **Cost-Optimized:** Free tiers for MVP, pay-as-you-grow
- **GDPR-Compliant:** EU data centers (Supabase Frankfurt, Vercel EU region)
- **Zero-Downtime Deployments:** Blue-green deployment via Vercel/Render
- **Developer Experience:** Git-based workflows, preview deployments, instant rollback

---

## 2. Deployment Architecture Overview

### Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                     (emma@example.com)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                       │
│                  (Global CDN + Edge Functions)               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  FRONTEND (Next.js 14)                             │     │
│  │  - React UI                                        │     │
│  │  - Server-Side Rendering (SSR)                     │     │
│  │  - Static Site Generation (SSG)                    │     │
│  │  - API Routes (Next.js API)                        │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Custom Domain: https://app.aicvassistant.com               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (HTTPS)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     RENDER (US/EU Regions)                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │  BACKEND (Node.js + Express)                       │     │
│  │  - RESTful API                                     │     │
│  │  - JWT Authentication                              │     │
│  │  - AI Service Integration (Gemini, GPT-4)         │     │
│  │  - Background Jobs (Bull)                          │     │
│  │  - Document Generation (Puppeteer)                 │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Custom Domain: https://api.aicvassistant.com               │
└─────────────────────────────────────────────────────────────┘
         │                  │                  │
         │                  │                  │
         ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  SUPABASE    │  │   UPSTASH    │  │  AI APIs     │
│  (EU)        │  │   REDIS      │  │              │
│              │  │              │  │  - Gemini    │
│ - PostgreSQL │  │ - Job Queue  │  │    2.5 Flash │
│   (Managed)  │  │ - Caching    │  │  - GPT-4     │
│              │  │              │  │  - Claude    │
│ - Storage    │  │              │  │    3.5       │
│   (S3-like)  │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Component Responsibilities

**Vercel (Frontend):**
- Hosts Next.js 14 application
- Serves static assets via global CDN
- Handles SSR/SSG for landing pages
- Edge Functions for API optimization
- Automatic HTTPS, DDoS protection

**Render (Backend):**
- Hosts Node.js/Express API
- Handles authentication (JWT)
- Integrates with AI services
- Processes background jobs (Bull + Redis)
- Generates documents (Puppeteer)

**Supabase (Database + Storage):**
- PostgreSQL database (EU Frankfurt)
- File storage for CV uploads
- Automatic backups (daily)
- Connection pooling

**Upstash (Redis):**
- Job queue (Bull)
- Caching (AI responses, job analyses)
- Session storage (optional)

**AI APIs:**
- Google Gemini 2.5 Flash (primary)
- OpenAI GPT-4 (fallback)
- Anthropic Claude 3.5 (fallback)

---

## 3. Environment Variables

### Frontend Environment Variables (.env.local)

**Vercel Dashboard: Settings → Environment Variables**

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.aicvassistant.com/api/v1

# Supabase (Public Keys - Safe for Frontend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Vercel Analytics (Optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
```

**Environment-Specific Values:**

| Variable | Development | Production |
|----------|-------------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` | `https://api.aicvassistant.com/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dev-project.supabase.co` | `https://prod-project.supabase.co` |

---

### Backend Environment Variables (.env)

**Render Dashboard: Environment → Environment Variables**

```bash
# Server Configuration
PORT=4000
NODE_ENV=production

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres?schema=public&connection_limit=20&pool_timeout=10

# JWT Secrets (Generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-access-token-key-here
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-token-key-here

# AI API Keys
GOOGLE_AI_API_KEY=AIzaSyC...                  # Google Gemini
OPENAI_API_KEY=sk-proj-...                    # OpenAI GPT-4
ANTHROPIC_API_KEY=sk-ant-api03-...            # Anthropic Claude

# Supabase (Backend Keys)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Service role key (private)

# Redis (Upstash)
REDIS_URL=rediss://default:password@redis-12345.upstash.io:6379
REDIS_HOST=redis-12345.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password

# Frontend URL (CORS)
FRONTEND_URL=https://app.aicvassistant.com

# Sentry (Error Tracking)
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

# Logging
LOG_LEVEL=info
```

**Environment-Specific Values:**

| Variable | Development | Production |
|----------|-------------|------------|
| `NODE_ENV` | `development` | `production` |
| `FRONTEND_URL` | `http://localhost:3000` | `https://app.aicvassistant.com` |
| `DATABASE_URL` | Local/Dev Supabase | Production Supabase |
| `LOG_LEVEL` | `debug` | `info` |

---

### Generating Secrets

**JWT Secrets:**
```bash
openssl rand -base64 32
```

**Database URL Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public&connection_limit=20
```

---

## 4. Vercel Deployment (Frontend)

### Prerequisites

1. **GitHub Repository:** Push Next.js frontend code to GitHub
2. **Vercel Account:** Sign up at https://vercel.com (free tier)

### Deployment Steps

#### Step 1: Connect GitHub Repository

1. Go to https://vercel.com/dashboard
2. Click **"Add New..." → "Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository (e.g., `SG-Gruppe-12/frontend`)
5. Click **"Import"**

#### Step 2: Configure Build Settings

**Vercel Auto-Detects Next.js:**
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)
- **Node.js Version:** 20.x (recommended)

**Custom Settings (Optional):**
```
Build Command: npm run build
Output Directory: .next
Install Command: npm ci --legacy-peer-deps
```

#### Step 3: Add Environment Variables

In Vercel Dashboard → **Settings → Environment Variables**, add:

```
NEXT_PUBLIC_API_URL=https://api.aicvassistant.com/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Environment Scopes:**
- ✅ Production
- ✅ Preview (optional, for PR previews)
- ✅ Development (optional, for local development)

#### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your app is live at `https://your-project.vercel.app`

**Deployment URL:**
```
https://ai-cv-assistant-frontend-<random>.vercel.app
```

#### Step 5: Configure Custom Domain (Optional)

1. Go to **Settings → Domains**
2. Add domain: `app.aicvassistant.com`
3. Configure DNS:
   - **Type:** CNAME
   - **Name:** `app`
   - **Value:** `cname.vercel-dns.com`
4. Wait for DNS propagation (5-60 minutes)
5. Vercel automatically provisions SSL certificate (Let's Encrypt)

---

### Vercel Features

**Automatic Deployments:**
- Every `git push` to `main` triggers production deployment
- Every PR creates preview deployment (e.g., `pr-123.vercel.app`)
- Instant rollback to previous deployments

**Performance Optimizations:**
- **Edge Network:** Global CDN (300+ locations)
- **Image Optimization:** Automatic WebP/AVIF conversion (`next/image`)
- **Code Splitting:** Automatic per-page bundles
- **Compression:** Brotli/gzip compression

**Environment Management:**
- **Production:** `main` branch → `app.aicvassistant.com`
- **Preview:** PR branches → `pr-123.vercel.app`
- **Development:** Local (`npm run dev`)

---

## 5. Render Deployment (Backend)

### Prerequisites

1. **GitHub Repository:** Push Node.js backend code to GitHub
2. **Render Account:** Sign up at https://render.com (free tier available, Starter $7/month recommended)

### Deployment Steps

#### Step 1: Create New Web Service

1. Go to https://dashboard.render.com
2. Click **"New +" → "Web Service"**
3. Connect GitHub account (if not already connected)
4. Select repository (e.g., `SG-Gruppe-12/backend`)
5. Click **"Connect"**

#### Step 2: Configure Service

**Basic Settings:**
- **Name:** `ai-cv-assistant-backend`
- **Region:** `Frankfurt (EU Central)` (for GDPR compliance)
- **Branch:** `main`
- **Root Directory:** (leave blank if backend is at root, or `backend/` if in subdirectory)

**Build & Start Commands:**
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm run start`

**Environment:**
- **Runtime:** Node
- **Node Version:** 20.x (specify in `package.json` engines field)

#### Step 3: Add Environment Variables

Click **"Advanced" → "Add Environment Variable"**, add all backend env vars (see Section 3):

```
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
GOOGLE_AI_API_KEY=...
...
```

**Tip:** Use Render's "Secret File" feature for multi-line secrets (e.g., service account JSON)

#### Step 4: Choose Plan

**Free Tier:**
- Spins down after 15 minutes of inactivity
- Cold start: 30-60 seconds
- Suitable for: Development/testing

**Starter Plan ($7/month):**
- Always-on (no cold starts)
- 512 MB RAM
- Suitable for: MVP production

**Standard Plan ($25/month):**
- 2 GB RAM
- Auto-scaling
- Suitable for: Growth stage

**Recommended for MVP:** Starter Plan

#### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Your API is live at `https://ai-cv-assistant-backend.onrender.com`

**Health Check:**
```
GET https://ai-cv-assistant-backend.onrender.com/api/v1/health
```

#### Step 6: Configure Custom Domain (Optional)

1. Go to **Settings → Custom Domains**
2. Add domain: `api.aicvassistant.com`
3. Configure DNS:
   - **Type:** CNAME
   - **Name:** `api`
   - **Value:** `ai-cv-assistant-backend.onrender.com`
4. Wait for DNS propagation
5. Render automatically provisions SSL certificate

---

### Render Features

**Automatic Deployments:**
- Every `git push` to `main` triggers deployment
- Zero-downtime blue-green deployment
- Instant rollback

**Monitoring:**
- **Logs:** Real-time logs in dashboard
- **Metrics:** CPU, memory, request count
- **Alerts:** Email notifications for failures

**Scaling:**
- **Horizontal:** Add instances (Standard plan+)
- **Vertical:** Upgrade plan (more RAM)

---

## 6. Supabase Setup

### Prerequisites

1. **Supabase Account:** Sign up at https://supabase.com (free tier)

### Setup Steps

#### Step 1: Create New Project

1. Go to https://app.supabase.com
2. Click **"New Project"**
3. Fill in details:
   - **Name:** `ai-cv-assistant-prod`
   - **Database Password:** Generate strong password (save this!)
   - **Region:** `Frankfurt (EU Central)` (GDPR compliance)
   - **Pricing Plan:** Free (500 MB database, 1 GB storage)
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

#### Step 2: Configure Database

**Connection String:**

1. Go to **Settings → Database**
2. Copy **Connection String (URI)**:
```
postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
```

**Connection Pooling:**

For production, use **Pooler (Transaction Mode)**:
1. Enable connection pooler
2. Copy pooler connection string:
```
postgresql://postgres.your-project:password@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```
3. Use this for `DATABASE_URL` (handles 20+ concurrent connections)

#### Step 3: Initialize Schema with Prisma

**From your backend project:**

```bash
# 1. Set DATABASE_URL in .env
echo "DATABASE_URL=postgresql://..." >> .env

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations (creates all tables)
npx prisma migrate deploy

# 4. (Optional) Seed development data
npx prisma db seed
```

**Verify in Supabase:**
1. Go to **Table Editor**
2. Confirm tables exist: `users`, `cvs`, `cv_versions`, `job_postings`, etc.

#### Step 4: Configure Storage Bucket

**Create CV Uploads Bucket:**

1. Go to **Storage**
2. Click **"Create a new bucket"**
3. Fill in:
   - **Name:** `cvs`
   - **Public bucket:** ❌ (private)
4. Click **"Create bucket"**

**Configure Storage Policies (Optional):**

Row Level Security (RLS) policies:
```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own files
CREATE POLICY "Users can read own CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Step 5: Get API Keys

1. Go to **Settings → API**
2. Copy keys:
   - **Project URL:** `https://your-project.supabase.co`
   - **anon public key:** (for frontend, public)
   - **service_role secret:** (for backend, private, full access)

**Add to Environment Variables:**

**Frontend:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**Backend:**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGci... (service_role key)
```

---

### Supabase Features

**Automatic Backups:**
- **Free Tier:** Daily backups (7-day retention)
- **Pro Tier:** Daily backups (30-day retention)
- **Point-in-Time Recovery:** Pro tier only

**Monitoring:**
- **Dashboard:** Query performance, connections, storage usage
- **Logs:** SQL query logs, function logs

**Security:**
- **Row Level Security (RLS):** Fine-grained access control
- **SSL/TLS:** All connections encrypted
- **GDPR Compliance:** EU data centers

---

## 7. Upstash Redis Setup

### Prerequisites

1. **Upstash Account:** Sign up at https://upstash.com (free tier)

### Setup Steps

#### Step 1: Create Redis Database

1. Go to https://console.upstash.com
2. Click **"Create Database"**
3. Fill in:
   - **Name:** `ai-cv-assistant-redis`
   - **Type:** Regional
   - **Region:** `eu-central-1` (Frankfurt, for GDPR)
   - **TLS:** Enabled
   - **Eviction:** No eviction (recommended for job queue)
4. Click **"Create"**

#### Step 2: Get Connection Details

1. Go to database details
2. Copy:
   - **Endpoint:** `redis-12345.upstash.io`
   - **Port:** `6379`
   - **Password:** `your-password`
   - **Redis URL:** `rediss://default:password@redis-12345.upstash.io:6379`

**Add to Backend .env:**
```
REDIS_URL=rediss://default:password@redis-12345.upstash.io:6379
REDIS_HOST=redis-12345.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

#### Step 3: Test Connection

```bash
# Install redis-cli (macOS)
brew install redis

# Test connection
redis-cli -u rediss://default:password@redis-12345.upstash.io:6379 ping
# Expected output: PONG
```

---

### Upstash Features

**Free Tier:**
- **10,000 commands/day** (sufficient for MVP)
- **256 MB storage**
- **TLS encryption**

**Use Cases:**
1. **Job Queue (Bull):** CV parsing, document generation, email sending
2. **Caching:** AI responses, job analyses (24-hour TTL)
3. **Session Storage (optional):** Rate limiting, user sessions

---

## 8. CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Frontend CI
  frontend-ci:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}

  # Backend CI
  backend-ci:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Build
        run: npm run build

  # Deployment (only on push to main)
  deploy:
    needs: [frontend-ci, backend-ci]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - name: Deploy notification
        run: |
          echo "CI passed! Vercel and Render will auto-deploy."
          # Vercel and Render auto-deploy on push to main
```

---

### Deployment Triggers

**Frontend (Vercel):**
- ✅ Push to `main` → Production deployment
- ✅ Pull request → Preview deployment

**Backend (Render):**
- ✅ Push to `main` → Production deployment
- ❌ Pull requests → Manual preview (create separate Render service)

---

## 9. Monitoring & Logging

### Sentry Setup (Error Tracking)

#### Step 1: Create Sentry Account

1. Go to https://sentry.io
2. Sign up (free tier: 5,000 errors/month)
3. Create new project:
   - **Platform:** Next.js (frontend) or Node.js (backend)
   - **Name:** `ai-cv-assistant-frontend` / `ai-cv-assistant-backend`

#### Step 2: Install Sentry SDK

**Frontend:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Backend:**
```bash
npm install @sentry/node
```

**Backend Integration (src/server.ts):**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // 100% of transactions for performance monitoring
});

// Add error handler middleware
app.use(Sentry.Handlers.errorHandler());
```

#### Step 3: Add DSN to Environment Variables

**Vercel (Frontend):**
```
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

**Render (Backend):**
```
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

---

### Logging Strategy

**Backend (Winston):**

**Logs Directory:** `logs/`
- `error.log` (errors only)
- `combined.log` (all levels: error, warn, info, debug)

**Log Retention:**
- **Development:** Keep all logs
- **Production:** Rotate logs (max 10 MB per file, keep 10 files)

**Accessing Logs:**
- **Render Dashboard:** **Logs** tab (real-time streaming)
- **Download Logs:** Click "Download Logs" button

---

### Vercel Analytics

**Enable Analytics:**
1. Go to Vercel Dashboard → **Settings → Analytics**
2. Toggle **Enable Analytics**
3. View metrics: Page views, unique visitors, top pages

**Web Vitals Monitoring:**
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 10. Backup Strategy

### Database Backups (Supabase)

**Automatic Backups:**
- **Free Tier:** Daily backups, 7-day retention
- **Pro Tier:** Daily backups, 30-day retention, point-in-time recovery

**Manual Backup:**

```bash
# Export database to SQL file
pg_dump postgresql://postgres:password@db.your-project.supabase.co:5432/postgres > backup.sql

# Restore from SQL file
psql postgresql://postgres:password@db.your-project.supabase.co:5432/postgres < backup.sql
```

**Backup Schedule:**
- **Production:** Daily automatic (Supabase)
- **Pre-Deployment:** Manual backup before major schema changes

---

### Storage Backups (Supabase Storage)

**Automatic Backups:**
- Supabase Storage is replicated across multiple availability zones (AWS S3 backend)

**Manual Backup (Optional):**
```bash
# Download all files from 'cvs' bucket
supabase storage download cvs --recursive
```

---

## 11. Scaling Strategy

### Frontend Scaling (Vercel)

**Automatic Scaling:**
- ✅ Vercel Edge Network scales automatically (no configuration needed)
- ✅ CDN caching reduces origin requests
- ✅ Edge Functions scale to handle traffic spikes

**Performance Optimizations:**
1. **Image Optimization:** Use `next/image` component
2. **Code Splitting:** Lazy load components with `next/dynamic`
3. **Static Generation:** Pre-render landing pages (SSG)
4. **Edge Caching:** Cache API responses at edge (Vercel Edge Middleware)

---

### Backend Scaling (Render)

**Vertical Scaling (Increase Resources):**
- **Starter Plan:** 512 MB RAM → **Standard Plan:** 2 GB RAM
- Upgrade in Render Dashboard → **Plan**

**Horizontal Scaling (Add Instances):**
- **Standard Plan+:** Auto-scaling based on CPU/memory
- Configure in Render Dashboard → **Scaling**
- Example: Auto-scale from 1 to 5 instances when CPU > 80%

**Stateless Design for Scaling:**
- ✅ No in-memory sessions (use Redis or JWT cookies)
- ✅ No local file storage (use Supabase Storage)
- ✅ Database connection pooling (Prisma + Supabase Pooler)

---

### Database Scaling (Supabase)

**Vertical Scaling (Increase Resources):**
- **Free Tier:** 500 MB → **Pro Tier:** Unlimited
- Upgrade in Supabase Dashboard → **Billing**

**Connection Pooling:**
- Use **Supabase Pooler** (PgBouncer) for 100+ concurrent connections
- Configure in Prisma schema:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL") // Pooler URL
}
```

**Read Replicas (Future):**
- Pro tier: Add read replicas for heavy read workloads

---

### Redis Scaling (Upstash)

**Vertical Scaling:**
- **Free Tier:** 10k commands/day → **Pay-as-you-go:** Unlimited
- Upgrade in Upstash Dashboard → **Billing**

---

## 12. Security Checklist

### Pre-Deployment Security

- ✅ **Environment Variables:** Never commit `.env` files to Git
- ✅ **JWT Secrets:** Generate strong secrets (32+ characters)
- ✅ **Database Password:** Strong password (16+ characters, alphanumeric + symbols)
- ✅ **HTTPS Everywhere:** Force HTTPS in production (automatic with Vercel/Render)
- ✅ **CORS Configuration:** Whitelist frontend domain only
- ✅ **Rate Limiting:** Implement on AI endpoints (10 req/15min)
- ✅ **Input Validation:** Zod schemas on all API endpoints
- ✅ **SQL Injection Prevention:** Use Prisma (parameterized queries)
- ✅ **XSS Prevention:** Sanitize user inputs
- ✅ **Helmet.js:** Set security headers
- ✅ **Password Hashing:** bcrypt with salt (10 rounds)
- ✅ **JWT Expiration:** 15-minute access tokens, 7-day refresh tokens
- ✅ **HTTP-Only Cookies:** Store tokens in HTTP-only cookies (not localStorage)

---

### GDPR Compliance Checklist

- ✅ **EU Data Centers:** Supabase (Frankfurt), Render (EU Central)
- ✅ **Encryption at Rest:** Supabase (AES-256)
- ✅ **Encryption in Transit:** HTTPS/TLS everywhere
- ✅ **Consent Management:** Explicit opt-in for AI training, marketing
- ✅ **Data Export:** User can download all data (JSON format)
- ✅ **Data Deletion:** User can permanently delete account + all data
- ✅ **PII Redaction:** Logs redact sensitive fields (email, phone, password)
- ✅ **Data Retention:** Job postings auto-delete after 24 hours
- ✅ **Audit Trail:** Consent changes logged with timestamps
- ✅ **Privacy Policy:** Clear, accessible, up-to-date

---

## 13. Troubleshooting

### Frontend Issues

**Issue:** Build fails on Vercel
**Solution:**
1. Check build logs in Vercel Dashboard
2. Verify environment variables are set
3. Run `npm run build` locally to reproduce
4. Check Node.js version (`engines` in `package.json`)

**Issue:** API calls fail (CORS error)
**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend CORS configuration (allow frontend domain)
3. Ensure cookies are sent with `credentials: 'include'`

---

### Backend Issues

**Issue:** Health check fails
**Solution:**
1. Check Render logs for errors
2. Verify `PORT` environment variable is set
3. Ensure server listens on `0.0.0.0` (not `localhost`)
```typescript
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Issue:** Database connection fails
**Solution:**
1. Verify `DATABASE_URL` is correct (use Pooler URL)
2. Check Supabase project is not paused (auto-pauses after 7 days inactivity on free tier)
3. Test connection locally: `psql $DATABASE_URL`

**Issue:** Puppeteer fails on Render
**Solution:**
1. Use Docker deployment with Puppeteer pre-installed, or
2. Switch to lighter PDF generation library (html-pdf)

---

### Database Issues

**Issue:** Prisma migrations fail
**Solution:**
1. Check migration files for syntax errors
2. Ensure `DATABASE_URL` has correct schema parameter
3. Run migrations manually: `npx prisma migrate deploy`

**Issue:** Connection pool exhausted
**Solution:**
1. Use Supabase Pooler (PgBouncer)
2. Increase connection limit in `DATABASE_URL`:
```
?connection_limit=20&pool_timeout=10
```
3. Optimize queries to reduce connection time

---

### Redis Issues

**Issue:** Bull jobs not processing
**Solution:**
1. Verify Redis connection: `redis-cli -u $REDIS_URL ping`
2. Check Bull queue dashboard: `npm install --save-dev bull-board`
3. Ensure worker process is running

---

## Conclusion

This Deployment Guide provides a complete blueprint for deploying the AI CV & Job Application Assistant platform to production, including infrastructure setup, CI/CD, monitoring, and scaling strategies.

### Key Takeaways

1. **Vercel (Frontend):** Zero-config deployment, global CDN, automatic HTTPS
2. **Render (Backend):** Simple Node.js hosting, automatic deployments, $7/month
3. **Supabase (Database + Storage):** Managed PostgreSQL, EU hosting, GDPR-compliant
4. **Upstash (Redis):** Serverless Redis, free tier sufficient for MVP
5. **CI/CD:** GitHub Actions for automated testing, Vercel/Render auto-deploy
6. **Monitoring:** Sentry for errors, Vercel Analytics for performance
7. **Scaling:** Stateless design, horizontal scaling, connection pooling

### Next Steps

1. **Set up accounts:** Vercel, Render, Supabase, Upstash
2. **Configure environment variables** in each service
3. **Deploy frontend** to Vercel (5 minutes)
4. **Deploy backend** to Render (10 minutes)
5. **Initialize database** with Prisma migrations
6. **Test end-to-end:** Register, login, upload CV, generate application
7. **Configure custom domains** (optional)
8. **Enable monitoring:** Sentry, Vercel Analytics

### Cost Estimate (MVP)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | Free |
| Render | Starter | $7/month |
| Supabase | Free | Free |
| Upstash | Free | Free |
| AI APIs | Pay-as-you-go | $10-50/month |
| Sentry | Developer | Free |
| **Total** | | **$17-57/month** |

---

**Document Status:** ✅ Ready for Implementation
**Last Updated:** 2025-11-24
**Maintainer:** BMM Architect Agent (Winston)
