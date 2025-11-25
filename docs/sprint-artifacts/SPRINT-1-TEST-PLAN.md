# Sprint 1 Test Plan & QA Strategy
## AI CV & Job Application Assistant - Epic 1: Platform Foundation

**Project:** IBE160 - AI CV & Job Application Assistant
**Sprint:** Sprint 1 - Epic 1 (Platform Foundation & User Onboarding)
**Test Architect:** Master Test Architect (TEA)
**Date:** 2025-11-25
**Status:** READY FOR IMPLEMENTATION

---

## Executive Summary

This comprehensive test plan provides actionable testing guidance for Sprint 1, covering all four stories (1.1-1.4) with a focus on **risk-based testing**, **automated quality gates**, and **security-first validation**. The plan addresses the 7 critical/high-priority architecture fixes identified in the Architecture Review, ensuring production readiness.

**Testing Philosophy:** Tests mirror usage. Quality gates backed by data. Calculate risk vs. value for every testing decision.

### Test Coverage Goals

| Story | Unit Tests | Integration Tests | E2E Tests | Security Tests | Target Coverage |
|-------|-----------|------------------|-----------|----------------|----------------|
| 1.1: Project Setup | Infrastructure | Database Connectivity | CI/CD Pipeline | Connection Security | 80% |
| 1.2: User Registration | Auth Logic | API + Database | Registration Flow | Password Policy, Input Validation | 90% |
| 1.3: User Login | JWT Generation | Session Management | Login Flow | JWT Security, Rate Limiting | 90% |
| 1.4: Basic Profile | CRUD Operations | Profile API | Profile Update Flow | Input Sanitization | 85% |

**Overall Sprint 1 Target:** 85% code coverage with 100% coverage on critical authentication paths.

---

## 1. Test Strategy for Sprint 1

### 1.1 Testing Pyramid

```
         /\
        /E2E\       (10% - Critical user flows)
       /------\
      / INTEG  \    (30% - API + Database)
     /----------\
    /   UNIT     \  (60% - Business logic)
   /--------------\
```

**Distribution:**
- **Unit Tests (60%):** Fast, isolated tests for business logic, utilities, validators
- **Integration Tests (30%):** API endpoints + database interactions
- **E2E Tests (10%):** Critical user journeys (registration → login → profile update)

### 1.2 Testing Framework Stack

**Backend Testing:**
- **Unit/Integration:** Jest (v29+)
- **API Testing:** Supertest
- **Database:** PostgreSQL test database (Docker container)
- **Mocking:** Jest mocks + `node-pg-mock` for database
- **Code Coverage:** Istanbul (via Jest)

**Frontend Testing:**
- **Unit/Component:** Jest + React Testing Library
- **E2E:** Playwright (recommended) or Cypress
- **Visual Regression:** Percy or Chromatic (optional for Sprint 1)

**CI/CD Integration:**
- **GitHub Actions:** Automated test execution on PR and push
- **Quality Gates:** 85% coverage threshold, zero critical failures

### 1.3 Test Data Strategy

**Test Database:**
- Dedicated PostgreSQL test database (`test_aicv_db`)
- Database reset between test suites
- Seed data for consistent test scenarios

**Test Users:**
```javascript
// Test data fixtures
const TEST_USERS = {
  validUser: {
    email: 'test@example.com',
    password: 'Test@Pass123!',
    firstName: 'Test',
    lastName: 'User'
  },
  weakPasswordUser: {
    email: 'weak@example.com',
    password: 'weak'  // Should fail validation
  },
  duplicateUser: {
    email: 'test@example.com'  // Duplicate for conflict tests
  }
};
```

### 1.4 Test Environment Configuration

**Environments:**
1. **Local Development:** Developer machines with local PostgreSQL
2. **CI Environment:** GitHub Actions with PostgreSQL service container
3. **Staging:** (Future) Pre-production environment

**Environment Variables (.env.test):**
```bash
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=test_aicv_db
DB_USER=test_user
DB_PASSWORD=test_password
JWT_ACCESS_SECRET=test_access_secret_key_minimum_32_chars
JWT_REFRESH_SECRET=test_refresh_secret_key_minimum_32_chars
```

---

## 2. Review of Existing Test Implementation

### 2.1 Analysis: `src/tests/db_connection_test.js`

**Current Implementation:**
```javascript
// Line 1-23: Basic connection test
const { pool } = require('../config/db.config');

async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('Successfully connected to the PostgreSQL database.');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from database:', res.rows[0].now);
    return true;
  } catch (err) {
    console.error('Failed to connect to the PostgreSQL database:', err.stack);
    return false;
  } finally {
    if (client) {
      client.release();
    }
    pool.end();
  }
}

testConnection();
```

**Issues Identified:**

1. **Not a proper test:** Uses `console.log` instead of assertions
2. **No test framework:** Not integrated with Jest
3. **Missing test cases:** Only tests successful connection
4. **Immediate execution:** Runs on import, not via test runner
5. **Pool shutdown:** Calls `pool.end()` which prevents subsequent tests

**Recommendations:**

**Convert to Jest test suite:**
```javascript
// src/tests/db.connection.test.js
const { pool, query } = require('../config/db.config');

describe('Database Connection Tests', () => {
  afterAll(async () => {
    // Only close pool after all tests
    await pool.end();
  });

  describe('Connection Pool', () => {
    test('should successfully connect to PostgreSQL', async () => {
      const client = await pool.connect();
      expect(client).toBeDefined();
      client.release();
    });

    test('should execute simple query', async () => {
      const result = await query('SELECT NOW()');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].now).toBeInstanceOf(Date);
    });

    test('should handle concurrent connections', async () => {
      const connections = Array(5).fill(null).map(() => pool.connect());
      const clients = await Promise.all(connections);

      expect(clients).toHaveLength(5);
      clients.forEach(client => client.release());
    });
  });

  describe('Connection Configuration', () => {
    test('should have correct pool configuration', () => {
      expect(pool.totalCount).toBeDefined();
      expect(pool.idleCount).toBeDefined();
      expect(pool.waitingCount).toBeDefined();
    });

    test('should use connection pooling', async () => {
      const initialIdleCount = pool.idleCount;
      const client = await pool.connect();
      expect(pool.idleCount).toBe(initialIdleCount - 1);

      client.release();
      // Wait for connection to be returned to pool
      await new Promise(resolve => setTimeout(resolve, 10));
      expect(pool.idleCount).toBe(initialIdleCount);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid query gracefully', async () => {
      await expect(query('INVALID SQL SYNTAX')).rejects.toThrow();
    });

    test('should recover from connection failure', async () => {
      // Test connection resilience
      const client = await pool.connect();
      client.release();

      // Should still be able to connect after release
      const client2 = await pool.connect();
      expect(client2).toBeDefined();
      client2.release();
    });
  });
});
```

### 2.2 Additional Database Tests Needed

**Create: `src/tests/db.pool-configuration.test.js`**

Validates Architecture Review fix: **Prisma Connection Pool Configuration (HIGH PRIORITY)**

```javascript
describe('Database Pool Configuration Tests', () => {
  test('should configure connection pool size correctly', () => {
    // ✅ FIXED: Test actual pg Pool configuration (not DATABASE_URL)
    // For Story 1.1 (pg): Check pool.options.max
    const { pool } = require('../config/db.config');
    expect(pool.options.max).toBe(20);
  });

  test('should set pool timeout', () => {
    // ✅ FIXED: Test actual pg Pool configuration
    const { pool } = require('../config/db.config');
    expect(pool.options.connectionTimeoutMillis).toBe(20000); // 20 seconds
  });

  test('should handle connection pool exhaustion', async () => {
    const MAX_CONNECTIONS = 20;
    const connections = [];

    try {
      // Acquire all connections
      for (let i = 0; i < MAX_CONNECTIONS; i++) {
        connections.push(await pool.connect());
      }

      // Next connection should wait or timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 1000)
      );

      await expect(
        Promise.race([pool.connect(), timeoutPromise])
      ).rejects.toThrow('Connection timeout');
    } finally {
      // Release all connections
      connections.forEach(conn => conn.release());
    }
  });
});
```

---

## 2.5 Prisma ORM Testing Strategy (Story 1.2+)

### Overview

Starting with **Story 1.2 (User Registration)**, all database access migrates from `pg` to **Prisma ORM**. This section provides comprehensive testing guidance for Prisma-based code.

**Migration Point:** Story 1.1 → Story 1.2

| Story | Database Access | Testing Approach |
|-------|----------------|------------------|
| 1.1: Project Setup | `pg` driver | Connection tests with pg Pool |
| 1.2+: User Auth & CRUD | **Prisma ORM** | **Type-safe tests with Prisma Client** |

---

### 2.5.1 Why Prisma for Story 1.2+?

**Technical Benefits:**
1. **Type Safety:** Auto-generated TypeScript types for all models
2. **Migration Management:** Schema changes tracked in migration files
3. **Query Builder:** SQL injection prevention built-in
4. **Developer Experience:** Autocomplete for database queries
5. **Testing:** Easy to mock for unit tests

**Example: Type Safety in Action**
```typescript
// ❌ With pg (no type safety):
const result = await query('SELECT * FROM users WHERE email = $1', [email]);
const user = result.rows[0]; // TypeScript doesn't know user structure

// ✅ With Prisma (full type safety):
const user = await prisma.user.findUnique({ where: { email } });
// TypeScript knows: user.id, user.email, user.passwordHash, etc.
```

---

### 2.5.2 Prisma Testing Architecture

**Three Testing Levels:**

```
┌─────────────────────────────────────────┐
│  1. Unit Tests (Mocked Prisma)          │
│     - Services, utilities, business     │
│     - Mock Prisma Client responses      │
│     - Fast, isolated, no database       │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  2. Integration Tests (Real Prisma)     │
│     - API endpoints + database          │
│     - Real Prisma Client with test DB   │
│     - Database reset between tests      │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  3. E2E Tests (Full Stack)              │
│     - User workflows end-to-end         │
│     - Real database, real API calls     │
│     - Registration → Login → Profile    │
└─────────────────────────────────────────┘
```

---

### 2.5.3 Prisma Client Setup for Tests

**Test Environment Configuration:**

**File: `src/tests/helpers/prisma-test-client.js`**

```javascript
const { PrismaClient } = require('@prisma/client');

// Singleton Prisma Client for tests
let prisma;

function getPrismaTestClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
        }
      },
      log: process.env.DEBUG_PRISMA ? ['query', 'info', 'warn', 'error'] : []
    });
  }
  return prisma;
}

async function cleanDatabase() {
  const prisma = getPrismaTestClient();

  // Delete in reverse order of dependencies
  await prisma.application.deleteMany();
  await prisma.generatedOutput.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.cvVersion.deleteMany();
  await prisma.cv.deleteMany();
  await prisma.user.deleteMany();
}

async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

module.exports = {
  getPrismaTestClient,
  cleanDatabase,
  disconnectPrisma
};
```

**Usage in Tests:**

```javascript
const { getPrismaTestClient, cleanDatabase, disconnectPrisma } = require('../helpers/prisma-test-client');

describe('User Registration Tests', () => {
  let prisma;

  beforeAll(() => {
    prisma = getPrismaTestClient();
  });

  beforeEach(async () => {
    await cleanDatabase(); // Reset data before each test
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  test('should create user', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'hashed',
        name: 'Test User'
      }
    });
    expect(user.id).toBeDefined();
  });
});
```

---

### 2.5.4 Mocking Prisma for Unit Tests

**Mock Strategy:**

**File: `src/tests/mocks/prisma.mock.js`**

```javascript
// jest-mock-extended provides type-safe mocks
const { mockDeep, mockReset } = require('jest-mock-extended');
const { PrismaClient } = require('@prisma/client');

const prismaMock = mockDeep(PrismaClient);

beforeEach(() => {
  mockReset(prismaMock);
});

module.exports = prismaMock;
```

**Using Mocked Prisma:**

```javascript
// src/tests/unit/auth.service.test.js
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => require('../mocks/prisma.mock'))
}));

const prismaMock = require('../mocks/prisma.mock');
const authService = require('../../services/auth.service');

describe('Auth Service - Unit Tests', () => {
  test('should register user via service', async () => {
    const mockUser = {
      id: 'uuid-123',
      email: 'test@example.com',
      passwordHash: 'hashed',
      name: 'Test User',
      createdAt: new Date()
    };

    // Mock Prisma's user.create
    prismaMock.user.create.mockResolvedValue(mockUser);

    const result = await authService.register({
      email: 'test@example.com',
      password: 'Test@Pass123!',
      name: 'Test User'
    });

    expect(result.id).toBe('uuid-123');
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'test@example.com'
      })
    });
  });
});
```

---

### 2.5.5 Integration Tests with Real Prisma

**Test Pattern:**

```javascript
const { getPrismaTestClient, cleanDatabase } = require('../helpers/prisma-test-client');
const { hashPassword } = require('../../utils/password.util');

describe('User CRUD Integration Tests', () => {
  let prisma;

  beforeAll(() => {
    prisma = getPrismaTestClient();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('User Creation', () => {
    test('should create user with all required fields', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'john@example.com',
          passwordHash: await hashPassword('Secure@Pass123'),
          name: 'John Doe'
        }
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('john@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.consentEssential).toBe(true); // Default value
    });

    test('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@example.com',
        passwordHash: await hashPassword('Test@Pass123'),
        name: 'Test User'
      };

      await prisma.user.create({ data: userData });

      // Duplicate email should fail
      await expect(
        prisma.user.create({ data: userData })
      ).rejects.toThrow(/Unique constraint.*email/);
    });

    test('should apply default consent values', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'consent@example.com',
          passwordHash: await hashPassword('Test@Pass123')
        }
      });

      // Verify GDPR defaults from schema
      expect(user.consentEssential).toBe(true);
      expect(user.consentAiTraining).toBe(false);
      expect(user.consentMarketing).toBe(false);
    });
  });

  describe('User Querying', () => {
    test('should find user by email', async () => {
      await prisma.user.create({
        data: {
          email: 'find@example.com',
          passwordHash: await hashPassword('Test@Pass123'),
          name: 'Findable User'
        }
      });

      const found = await prisma.user.findUnique({
        where: { email: 'find@example.com' }
      });

      expect(found).toBeDefined();
      expect(found.name).toBe('Findable User');
    });

    test('should return null for non-existent user', async () => {
      const notFound = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' }
      });

      expect(notFound).toBeNull();
    });
  });

  describe('User Updates', () => {
    test('should update user name', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'update@example.com',
          passwordHash: await hashPassword('Test@Pass123'),
          name: 'Old Name'
        }
      });

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { name: 'New Name' }
      });

      expect(updated.name).toBe('New Name');
      expect(updated.updatedAt).not.toEqual(user.updatedAt);
    });
  });

  describe('User Deletion', () => {
    test('should delete user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'delete@example.com',
          passwordHash: await hashPassword('Test@Pass123')
        }
      });

      await prisma.user.delete({ where: { id: user.id } });

      const deleted = await prisma.user.findUnique({
        where: { id: user.id }
      });

      expect(deleted).toBeNull();
    });
  });
});
```

---

### 2.5.6 Schema Validation Tests

**Test: `src/tests/prisma/schema.validation.test.js`**

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Prisma Schema Validation', () => {
  test('should have valid schema format', () => {
    expect(() => {
      execSync('npx prisma validate', {
        cwd: path.join(__dirname, '../..'),
        stdio: 'pipe'
      });
    }).not.toThrow();
  });

  test('should define User model with required fields', () => {
    const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Verify User model exists
    expect(schema).toContain('model User');

    // Verify required fields
    expect(schema).toContain('id');
    expect(schema).toContain('email');
    expect(schema).toContain('passwordHash');

    // Verify GDPR consent fields
    expect(schema).toContain('consentEssential');
    expect(schema).toContain('consentAiTraining');
    expect(schema).toContain('consentMarketing');
  });

  test('should configure connection pool', () => {
    const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Verify connection_limit is set
    expect(schema).toMatch(/connection_limit\s*=\s*20/);
  });
});
```

---

### 2.5.7 Migration Testing

**Test: `src/tests/prisma/migrations.test.js`**

```javascript
describe('Prisma Migrations', () => {
  test('should apply all migrations successfully', () => {
    const { execSync } = require('child_process');

    expect(() => {
      execSync('npx prisma migrate deploy', {
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST },
        stdio: 'pipe'
      });
    }).not.toThrow();
  });

  test('should generate Prisma Client', () => {
    const { execSync } = require('child_process');

    expect(() => {
      execSync('npx prisma generate', { stdio: 'pipe' });
    }).not.toThrow();
  });

  test('should have migration files in prisma/migrations', () => {
    const fs = require('fs');
    const path = require('path');
    const migrationsDir = path.join(__dirname, '../../prisma/migrations');

    expect(fs.existsSync(migrationsDir)).toBe(true);
  });
});
```

---

### 2.5.8 Prisma Testing Checklist

**For Story 1.2+ (User Registration onwards):**

#### Setup (One-time):
- [ ] Prisma installed (`npm install prisma @prisma/client`)
- [ ] Prisma initialized (`npx prisma init`)
- [ ] User schema defined in `prisma/schema.prisma`
- [ ] Connection pool configured (`connection_limit = 20`)
- [ ] Initial migration created (`npx prisma migrate dev`)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Test database URL configured (`.env.test`)

#### Per Story:
- [ ] Prisma Client helper created (`prisma-test-client.js`)
- [ ] Database cleanup function implemented
- [ ] Mock Prisma setup for unit tests
- [ ] Integration tests use real Prisma Client
- [ ] Schema validation tests passing
- [ ] Migration tests passing
- [ ] Unique constraints tested
- [ ] Default values tested
- [ ] Foreign key constraints tested (Epic 2+)

#### Quality Gates:
- [ ] 90%+ test coverage on Prisma-based services
- [ ] All Prisma queries type-safe (no `any` types)
- [ ] Zero N+1 query issues
- [ ] Database cleanup between tests working
- [ ] No test data pollution

---

### 2.5.9 Common Prisma Testing Pitfalls

**Problem 1: Test Data Pollution**
```javascript
// ❌ BAD: Tests depend on order
test('test 1', async () => {
  await prisma.user.create({ data: { email: 'test@example.com' } });
});

test('test 2', async () => {
  const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
  // ❌ Expects user from test 1
});

// ✅ GOOD: Clean database before each test
beforeEach(async () => {
  await cleanDatabase();
});
```

**Problem 2: Prisma Client Not Disconnected**
```javascript
// ❌ BAD: Leaks connections
describe('Tests', () => {
  // No cleanup
});

// ✅ GOOD: Always disconnect
afterAll(async () => {
  await disconnectPrisma();
});
```

**Problem 3: Testing with Production Database**
```javascript
// ❌ BAD: No test-specific DATABASE_URL
const prisma = new PrismaClient();

// ✅ GOOD: Use test database
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL_TEST } }
});
```

---

### 2.5.10 Prisma vs. pg: Testing Decision Matrix

| Scenario | Use pg | Use Prisma | Why |
|----------|--------|------------|-----|
| **Story 1.1: Connection tests** | ✅ | ❌ | Simple validation, no ORM needed |
| **Story 1.2+: User auth** | ❌ | ✅ | Type safety, password hashing, JWT |
| **Raw SQL queries** | ✅ | ✅ | Both support raw SQL |
| **Complex joins** | ❌ | ✅ | Prisma's query builder safer |
| **Migration management** | ❌ | ✅ | Prisma Migrate tracks changes |
| **Unit tests (mocked)** | N/A | ✅ | Easy to mock Prisma Client |
| **Integration tests (real DB)** | ✅ | ✅ | Both work, Prisma adds type safety |

**Recommendation:** Use **pg** for Story 1.1 infrastructure tests, migrate to **Prisma** for Story 1.2+ user authentication and beyond.

---

## 3. Story-by-Story Testing Checklist

### Story 1.1: Project Setup - Core Infrastructure Initialization

**Status:** IN PROGRESS

#### 3.1.1 Infrastructure Tests

**Test Suite: `src/tests/infrastructure.test.js`**

```javascript
describe('Infrastructure Setup Tests', () => {
  describe('Project Structure', () => {
    test('should have required directories', () => {
      const fs = require('fs');
      const requiredDirs = [
        'src',
        'frontend',
        'docs',
        '.github/workflows'
      ];

      requiredDirs.forEach(dir => {
        expect(fs.existsSync(dir)).toBe(true);
      });
    });

    test('should have monorepo configuration', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.workspaces).toBeDefined();
      expect(packageJson.workspaces).toContain('src');
      expect(packageJson.workspaces).toContain('frontend');
    });
  });

  describe('Backend Configuration', () => {
    test('should have required dependencies', () => {
      const packageJson = require('../package.json');
      expect(packageJson.dependencies.express).toBeDefined();
      expect(packageJson.dependencies.pg).toBeDefined();
      expect(packageJson.dependencies.dotenv).toBeDefined();
    });

    test('should have development scripts', () => {
      const packageJson = require('../package.json');
      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
    });
  });

  describe('Database Configuration', () => {
    test('should load database configuration', () => {
      require('dotenv').config();
      expect(process.env.DB_HOST).toBeDefined();
      expect(process.env.DB_DATABASE).toBeDefined();
      expect(process.env.DB_USER).toBeDefined();
    });

    test('should export database query function', () => {
      const { query } = require('../config/db.config');
      expect(typeof query).toBe('function');
    });

    test('should export pool object', () => {
      const { pool } = require('../config/db.config');
      expect(pool).toBeDefined();
      expect(pool.connect).toBeDefined();
    });
  });
});
```

#### 3.1.2 CI/CD Pipeline Tests

**Current State:** Basic CI workflow exists (`.github/workflows/ci.yml`)

**Required Enhancements:**
```yaml
name: Sprint 1 CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_aicv_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install backend dependencies
        working-directory: ./src
        run: npm ci

      - name: Run database migrations
        working-directory: ./src
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_aicv_db

      - name: Run backend tests
        working-directory: ./src
        run: npm test -- --coverage
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_aicv_db
          NODE_ENV: test

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          directory: ./src/coverage
          flags: backend

      - name: Check coverage thresholds
        working-directory: ./src
        run: |
          COVERAGE=$(grep -o '"lines":{"total":[0-9.]*' coverage/coverage-summary.json | grep -o '[0-9.]*$')
          if (( $(echo "$COVERAGE < 85" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 85% threshold"
            exit 1
          fi

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run frontend tests
        working-directory: ./frontend
        run: npm test -- --coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          directory: ./frontend/coverage
          flags: frontend

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Lint backend
        working-directory: ./src
        run: |
          npm ci
          npm run lint

      - name: Lint frontend
        working-directory: ./frontend
        run: |
          npm ci
          npm run lint

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: |
          cd src && npm audit --audit-level=high
          cd ../frontend && npm audit --audit-level=high

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
```

**Quality Gates:**
- All tests must pass (zero failures)
- Code coverage ≥ 85%
- No high/critical security vulnerabilities
- Linting passes with zero errors

---

### Story 1.2: User Registration - Account Creation

**Status:** READY FOR DEV

#### 3.2.1 Unit Tests

**Test Suite: `src/tests/unit/auth.service.test.js`**

```javascript
const authService = require('../../services/auth.service');
const userRepository = require('../../repositories/user.repository');
const passwordUtil = require('../../utils/password.util');

jest.mock('../../repositories/user.repository');
jest.mock('../../utils/password.util');

describe('Auth Service - Registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register()', () => {
    test('should successfully register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test@Pass123!',
        firstName: 'Test',
        lastName: 'User'
      };

      passwordUtil.hashPassword.mockResolvedValue('hashed_password');
      userRepository.create.mockResolvedValue({
        id: 'uuid-123',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName
      });

      const result = await authService.register(userData);

      expect(passwordUtil.hashPassword).toHaveBeenCalledWith(userData.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: userData.email,
        passwordHash: 'hashed_password',
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      expect(result.id).toBe('uuid-123');
      expect(result.password).toBeUndefined(); // Password should not be returned
    });

    test('should throw error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'Test@Pass123!'
      };

      userRepository.create.mockRejectedValue(
        new Error('duplicate key value violates unique constraint')
      );

      await expect(authService.register(userData)).rejects.toThrow(
        'Email already registered'
      );
    });

    test('should throw error for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak'
      };

      await expect(authService.register(userData)).rejects.toThrow(
        'Password does not meet security requirements'
      );
    });
  });
});
```

**Test Suite: `src/tests/unit/password.util.test.js`**

Validates Architecture Review fix: **Weak Password Policy (HIGH PRIORITY)**

```javascript
const { hashPassword, validatePassword } = require('../../utils/password.util');
const bcrypt = require('bcrypt');

describe('Password Utility', () => {
  describe('validatePassword()', () => {
    test('should accept strong password', () => {
      const strongPasswords = [
        'Test@Pass123!',
        'MyS3cur3!Passw0rd',
        'C0mplex#Password$2024'
      ];

      strongPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    test('should reject password < 12 characters', () => {
      expect(validatePassword('Short1!')).toBe(false);
    });

    test('should reject password without uppercase', () => {
      expect(validatePassword('nouppercas3!')).toBe(false);
    });

    test('should reject password without lowercase', () => {
      expect(validatePassword('NOLOWERCASE3!')).toBe(false);
    });

    test('should reject password without number', () => {
      expect(validatePassword('NoNumbers!')).toBe(false);
    });

    test('should reject password without special character', () => {
      expect(validatePassword('NoSpecialChar123')).toBe(false);
    });

    test('should provide detailed validation errors', () => {
      const result = validatePassword('weak', { detailed: true });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Minimum 12 characters required');
      expect(result.errors).toContain('Must contain uppercase letter');
      expect(result.errors).toContain('Must contain special character');
    });
  });

  describe('hashPassword()', () => {
    test('should hash password using bcrypt', async () => {
      const password = 'Test@Pass123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are ~60 chars
    });

    test('should use salt rounds of 12', async () => {
      const password = 'Test@Pass123!';
      const hash = await hashPassword(password);

      // bcrypt hash format: $2b$12$...
      expect(hash.startsWith('$2b$12$')).toBe(true);
    });

    test('should generate unique hashes for same password', async () => {
      const password = 'Test@Pass123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe('comparePassword()', () => {
    test('should return true for matching password', async () => {
      const password = 'Test@Pass123!';
      const hash = await bcrypt.hash(password, 12);

      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    test('should return false for non-matching password', async () => {
      const password = 'Test@Pass123!';
      const wrongPassword = 'Wrong@Pass456!';
      const hash = await bcrypt.hash(password, 12);

      const result = await comparePassword(wrongPassword, hash);
      expect(result).toBe(false);
    });
  });
});
```

#### 3.2.2 Integration Tests

**Test Suite: `src/tests/integration/auth.registration.test.js`**

```javascript
const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/db.config');

describe('POST /api/v1/auth/register', () => {
  beforeEach(async () => {
    // Clean database before each test
    await pool.query('DELETE FROM users');
  });

  afterAll(async () => {
    await pool.end();
  });

  test('should register new user successfully', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'Secure@Pass123!',
        firstName: 'New',
        lastName: 'User'
      })
      .expect(201);

    expect(response.body).toMatchObject({
      message: 'User registered successfully',
      userId: expect.any(String)
    });

    // Verify user in database
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['newuser@example.com']
    );
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].email).toBe('newuser@example.com');
    expect(result.rows[0].password_hash).toBeDefined();
    expect(result.rows[0].password_hash).not.toBe('Secure@Pass123!'); // Hashed
  });

  test('should return 409 for duplicate email', async () => {
    // Register first user
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'Secure@Pass123!'
      });

    // Attempt duplicate registration
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'Different@Pass456!'
      })
      .expect(409);

    expect(response.body.message).toBe('Email already registered');
  });

  test('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email',
        password: 'Secure@Pass123!'
      })
      .expect(400);

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        field: 'email',
        message: expect.stringContaining('Invalid email format')
      })
    );
  });

  test('should return 400 for weak password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'weak'
      })
      .expect(400);

    expect(response.body.errors).toContainEqual(
      expect.objectContaining({
        field: 'password',
        message: expect.stringContaining('Password must be at least 12 characters')
      })
    );
  });

  test('should enforce rate limiting', async () => {
    const userData = {
      email: 'ratelimit@example.com',
      password: 'Secure@Pass123!'
    };

    // Make 5 requests (rate limit)
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...userData,
          email: `user${i}@example.com`
        });
    }

    // 6th request should be rate limited
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'user6@example.com',
        password: 'Secure@Pass123!'
      })
      .expect(429);

    expect(response.body.message).toMatch(/Too many requests/i);
  });

  test('should sanitize input to prevent SQL injection', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: "test@example.com'; DROP TABLE users;--",
        password: 'Secure@Pass123!'
      })
      .expect(400); // Should fail validation

    // Verify users table still exists
    const result = await pool.query('SELECT COUNT(*) FROM users');
    expect(result.rows[0].count).toBeDefined();
  });
});
```

#### 3.2.3 Security Tests

**Test Suite: `src/tests/security/auth.security.test.js`**

Validates Architecture Review fixes: **Password Policy, Input Sanitization, Rate Limiting**

```javascript
describe('Authentication Security Tests', () => {
  describe('Password Security', () => {
    test('should not log plain-text passwords', async () => {
      const consoleSpy = jest.spyOn(console, 'log');

      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'MySecret@Pass123!'
        });

      const logs = consoleSpy.mock.calls.flat().join(' ');
      expect(logs).not.toContain('MySecret@Pass123!');

      consoleSpy.mockRestore();
    });

    test('should not return password hash in response', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Secure@Pass123!'
        })
        .expect(201);

      expect(response.body.passwordHash).toBeUndefined();
      expect(response.body.password).toBeUndefined();
    });
  });

  describe('XSS Protection', () => {
    test('should sanitize HTML in input fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Secure@Pass123!',
          firstName: '<script>alert("XSS")</script>'
        })
        .expect(201);

      // Verify sanitization in database
      const result = await pool.query(
        'SELECT first_name FROM users WHERE email = $1',
        ['test@example.com']
      );
      expect(result.rows[0].first_name).not.toContain('<script>');
    });
  });

  describe('Rate Limiting', () => {
    test('should implement exponential backoff', async () => {
      const startTime = Date.now();

      // Exceed rate limit
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/v1/auth/register')
          .send({
            email: `user${i}@example.com`,
            password: 'Secure@Pass123!'
          });
      }

      // Subsequent requests should have retry-after header
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'blocked@example.com',
          password: 'Secure@Pass123!'
        })
        .expect(429);

      expect(response.headers['retry-after']).toBeDefined();
    });
  });
});
```

---

### Story 1.3: User Login - Session Management

**Status:** READY FOR DEV

#### 3.3.1 Unit Tests

**Test Suite: `src/tests/unit/jwt.util.test.js`**

Validates Architecture Review fix: **JWT Refresh Token Rotation (HIGH PRIORITY)**

```javascript
const { generateTokens, verifyAccessToken, verifyRefreshToken, rotateRefreshToken } = require('../../utils/jwt.util');
const jwt = require('jsonwebtoken');

describe('JWT Utility', () => {
  const userId = 'test-user-id';

  describe('generateTokens()', () => {
    test('should generate access and refresh tokens', () => {
      const tokens = generateTokens(userId);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();

      // Verify token structure
      const accessDecoded = jwt.decode(tokens.accessToken);
      const refreshDecoded = jwt.decode(tokens.refreshToken);

      expect(accessDecoded.userId).toBe(userId);
      expect(refreshDecoded.userId).toBe(userId);
    });

    test('access token should expire in 15 minutes', () => {
      const tokens = generateTokens(userId);
      const decoded = jwt.decode(tokens.accessToken);

      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(15 * 60); // 15 minutes in seconds
    });

    test('refresh token should expire in 7 days', () => {
      const tokens = generateTokens(userId);
      const decoded = jwt.decode(tokens.refreshToken);

      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(7 * 24 * 60 * 60); // 7 days in seconds
    });
  });

  describe('verifyAccessToken()', () => {
    test('should verify valid access token', () => {
      const tokens = generateTokens(userId);
      const decoded = verifyAccessToken(tokens.accessToken);

      expect(decoded.userId).toBe(userId);
    });

    test('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        { userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '1ms' }
      );

      // Wait for token to expire
      setTimeout(() => {
        expect(() => verifyAccessToken(expiredToken)).toThrow('Token expired');
      }, 10);
    });

    test('should throw error for invalid signature', () => {
      const tamperedToken = jwt.sign({ userId }, 'wrong-secret');

      expect(() => verifyAccessToken(tamperedToken)).toThrow('Invalid token');
    });
  });

  describe('rotateRefreshToken()', () => {
    test('should generate new refresh token and blacklist old one', async () => {
      const tokens = generateTokens(userId);
      const oldRefreshToken = tokens.refreshToken;

      const newRefreshToken = await rotateRefreshToken(oldRefreshToken);

      expect(newRefreshToken).toBeDefined();
      expect(newRefreshToken).not.toBe(oldRefreshToken);

      // Verify old token is blacklisted
      const isBlacklisted = await isTokenBlacklisted(oldRefreshToken);
      expect(isBlacklisted).toBe(true);
    });

    test('should reject blacklisted token', async () => {
      const tokens = generateTokens(userId);
      await rotateRefreshToken(tokens.refreshToken);

      // Attempt to use old token again
      await expect(rotateRefreshToken(tokens.refreshToken)).rejects.toThrow(
        'Token has been revoked'
      );
    });
  });
});
```

#### 3.3.2 Integration Tests

**Test Suite: `src/tests/integration/auth.login.test.js`**

```javascript
describe('POST /api/v1/auth/login', () => {
  const testUser = {
    email: 'logintest@example.com',
    password: 'Login@Pass123!'
  };

  beforeEach(async () => {
    // Create test user
    await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);
  });

  test('should login successfully with correct credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      userId: expect.any(String)
    });

    // Verify refresh token in HTTP-only cookie
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(cookie => cookie.startsWith('refresh-token='))).toBe(true);
    expect(cookies.some(cookie => cookie.includes('HttpOnly'))).toBe(true);
    expect(cookies.some(cookie => cookie.includes('Secure'))).toBe(true);
  });

  test('should return 401 for incorrect password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!'
      })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or password');
    expect(response.body.message).not.toContain('password'); // Don't reveal which field is wrong
  });

  test('should return 401 for non-existent email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: testUser.password
      })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or password');
  });

  test('should enforce rate limiting on failed attempts', async () => {
    // Make 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword!'
        })
        .expect(401);
    }

    // 6th attempt should be rate limited
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(429);

    expect(response.body.message).toMatch(/Too many login attempts/i);
  });

  test('should log login attempts', async () => {
    const logSpy = jest.spyOn(console, 'info');

    await request(app)
      .post('/api/v1/auth/login')
      .send(testUser);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Login attempt'),
      expect.objectContaining({
        email: testUser.email,
        success: true
      })
    );

    logSpy.mockRestore();
  });
});

describe('POST /api/v1/auth/refresh', () => {
  let refreshToken;

  beforeEach(async () => {
    // Login to get refresh token
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test@Pass123!'
      });

    const cookies = response.headers['set-cookie'];
    refreshToken = cookies
      .find(cookie => cookie.startsWith('refresh-token='))
      .split(';')[0]
      .split('=')[1];
  });

  test('should refresh access token with valid refresh token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refresh-token=${refreshToken}`)
      .expect(200);

    expect(response.body.accessToken).toBeDefined();

    // Verify new refresh token is issued (rotation)
    const cookies = response.headers['set-cookie'];
    const newRefreshToken = cookies
      .find(cookie => cookie.startsWith('refresh-token='))
      .split(';')[0]
      .split('=')[1];

    expect(newRefreshToken).not.toBe(refreshToken);
  });

  test('should reject expired refresh token', async () => {
    // Generate expired token
    const expiredToken = jwt.sign(
      { userId: 'test-user' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '1ms' }
    );

    await new Promise(resolve => setTimeout(resolve, 10));

    await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refresh-token=${expiredToken}`)
      .expect(401);
  });

  test('should reject blacklisted refresh token', async () => {
    // Use token once
    await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refresh-token=${refreshToken}`);

    // Try to use same token again (should be blacklisted)
    await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refresh-token=${refreshToken}`)
      .expect(401);
  });
});

describe('POST /api/v1/auth/logout', () => {
  test('should clear refresh token cookie on logout', async () => {
    // Login first
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test@Pass123!'
      });

    const refreshToken = loginResponse.headers['set-cookie']
      .find(cookie => cookie.startsWith('refresh-token='))
      .split(';')[0]
      .split('=')[1];

    // Logout
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', `refresh-token=${refreshToken}`)
      .expect(200);

    // Verify cookie is cleared
    const cookies = response.headers['set-cookie'];
    expect(cookies.some(cookie =>
      cookie.startsWith('refresh-token=;') && cookie.includes('Max-Age=0')
    )).toBe(true);
  });
});
```

#### 3.3.3 Security Tests

**Test Suite: `src/tests/security/session.security.test.js`**

```javascript
describe('Session Security Tests', () => {
  describe('JWT Token Security', () => {
    test('should use strong JWT secrets (min 32 characters)', () => {
      expect(process.env.JWT_ACCESS_SECRET.length).toBeGreaterThanOrEqual(32);
      expect(process.env.JWT_REFRESH_SECRET.length).toBeGreaterThanOrEqual(32);
    });

    test('should not accept tokens signed with different secret', async () => {
      const maliciousToken = jwt.sign(
        { userId: 'attacker' },
        'different-secret',
        { expiresIn: '15m' }
      );

      await request(app)
        .get('/api/v1/protected-route')
        .set('Authorization', `Bearer ${maliciousToken}`)
        .expect(401);
    });

    test('should not accept tokens with tampered payload', async () => {
      const tokens = generateTokens('user-123');
      const [header, payload, signature] = tokens.accessToken.split('.');

      // Tamper with payload
      const tamperedPayload = Buffer.from(
        JSON.stringify({ userId: 'attacker', role: 'admin' })
      ).toString('base64url');

      const tamperedToken = `${header}.${tamperedPayload}.${signature}`;

      await request(app)
        .get('/api/v1/protected-route')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);
    });
  });

  describe('Cookie Security', () => {
    test('should set HttpOnly flag on refresh token cookie', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@Pass123!'
        });

      const cookies = response.headers['set-cookie'];
      const refreshCookie = cookies.find(c => c.startsWith('refresh-token='));

      expect(refreshCookie).toContain('HttpOnly');
    });

    test('should set Secure flag on refresh token cookie', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@Pass123!'
        });

      const cookies = response.headers['set-cookie'];
      const refreshCookie = cookies.find(c => c.startsWith('refresh-token='));

      expect(refreshCookie).toContain('Secure');
    });

    test('should set SameSite=Strict on refresh token cookie', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test@Pass123!'
        });

      const cookies = response.headers['set-cookie'];
      const refreshCookie = cookies.find(c => c.startsWith('refresh-token='));

      expect(refreshCookie).toContain('SameSite=Strict');
    });
  });

  describe('Brute Force Protection', () => {
    test('should implement progressive delays after failed attempts', async () => {
      const attempts = [];

      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'test@example.com',
            password: 'WrongPassword!'
          });
        attempts.push(Date.now() - start);
      }

      // Later attempts should take longer (progressive delay)
      expect(attempts[4]).toBeGreaterThan(attempts[0]);
    });
  });
});
```

---

### Story 1.4: Basic Profile Creation

**Status:** READY FOR DEV

#### 3.4.1 Unit Tests

**Test Suite: `src/tests/unit/profile.service.test.js`**

```javascript
const profileService = require('../../services/profile.service');
const userRepository = require('../../repositories/user.repository');

jest.mock('../../repositories/user.repository');

describe('Profile Service', () => {
  describe('updateProfile()', () => {
    test('should update user profile successfully', async () => {
      const userId = 'user-123';
      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890'
      };

      userRepository.updateProfile.mockResolvedValue({
        id: userId,
        ...profileData
      });

      const result = await profileService.updateProfile(userId, profileData);

      expect(userRepository.updateProfile).toHaveBeenCalledWith(userId, profileData);
      expect(result).toMatchObject(profileData);
    });

    test('should sanitize phone number', async () => {
      const userId = 'user-123';
      const profileData = {
        phoneNumber: '(123) 456-7890'
      };

      await profileService.updateProfile(userId, profileData);

      expect(userRepository.updateProfile).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          phoneNumber: '+11234567890'
        })
      );
    });

    test('should throw error for invalid phone number format', async () => {
      const userId = 'user-123';
      const profileData = {
        phoneNumber: 'invalid-phone'
      };

      await expect(
        profileService.updateProfile(userId, profileData)
      ).rejects.toThrow('Invalid phone number format');
    });
  });

  describe('getProfile()', () => {
    test('should retrieve user profile', async () => {
      const userId = 'user-123';
      const mockProfile = {
        id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890'
      };

      userRepository.findById.mockResolvedValue(mockProfile);

      const result = await profileService.getProfile(userId);

      expect(result).toMatchObject(mockProfile);
      expect(result.passwordHash).toBeUndefined(); // Should not return password
    });

    test('should throw error for non-existent user', async () => {
      const userId = 'non-existent';
      userRepository.findById.mockResolvedValue(null);

      await expect(profileService.getProfile(userId)).rejects.toThrow(
        'User not found'
      );
    });
  });
});
```

#### 3.4.2 Integration Tests

**Test Suite: `src/tests/integration/profile.test.js`**

```javascript
describe('Profile API Tests', () => {
  let accessToken;
  let userId;

  beforeEach(async () => {
    // Register and login to get access token
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'profile@example.com',
        password: 'Profile@Pass123!'
      });

    userId = registerResponse.body.userId;

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'profile@example.com',
        password: 'Profile@Pass123!'
      });

    accessToken = loginResponse.body.accessToken;
  });

  describe('POST /api/v1/profile', () => {
    test('should update profile with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Profile updated successfully',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890'
        }
      });
    });

    test('should require authentication', async () => {
      await request(app)
        .post('/api/v1/profile')
        .send({
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(401);
    });

    test('should validate phone number format', async () => {
      const response = await request(app)
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          phoneNumber: 'invalid'
        })
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'phoneNumber',
          message: expect.stringContaining('Invalid phone number')
        })
      );
    });

    test('should sanitize HTML in name fields', async () => {
      await request(app)
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: '<script>alert("XSS")</script>',
          lastName: '<b>Doe</b>'
        })
        .expect(200);

      // Verify sanitization
      const result = await pool.query(
        'SELECT first_name, last_name FROM users WHERE id = $1',
        [userId]
      );

      expect(result.rows[0].first_name).not.toContain('<script>');
      expect(result.rows[0].last_name).not.toContain('<b>');
    });
  });

  describe('GET /api/v1/profile', () => {
    test('should retrieve user profile', async () => {
      // Update profile first
      await request(app)
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe'
        });

      // Retrieve profile
      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        email: 'profile@example.com'
      });

      expect(response.body.passwordHash).toBeUndefined();
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/v1/profile')
        .expect(401);
    });
  });
});
```

---

## 4. Security Testing Requirements

### 4.1 OWASP Top 10 Validation

**Test Suite: `src/tests/security/owasp.test.js`**

```javascript
describe('OWASP Top 10 Security Tests', () => {
  describe('A01:2021 - Broken Access Control', () => {
    test('should prevent access to other users\' profiles', async () => {
      // Create two users
      const user1Token = await createUserAndLogin('user1@example.com');
      const user2Token = await createUserAndLogin('user2@example.com');

      // User 1 updates their profile
      await request(app)
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ firstName: 'User1' });

      // User 2 tries to access User 1's profile by manipulating userId
      await request(app)
        .get('/api/v1/profile?userId=user1-id')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403); // Should be forbidden
    });
  });

  describe('A02:2021 - Cryptographic Failures', () => {
    test('should enforce HTTPS in production', () => {
      if (process.env.NODE_ENV === 'production') {
        expect(process.env.FORCE_HTTPS).toBe('true');
      }
    });

    test('should use strong password hashing', async () => {
      const password = 'Test@Pass123!';
      const hash = await hashPassword(password);

      // Verify bcrypt format with cost factor 12
      expect(hash).toMatch(/^\$2[aby]\$12\$/);
    });
  });

  describe('A03:2021 - Injection', () => {
    test('should prevent SQL injection in email field', async () => {
      const maliciousEmail = "test@example.com' OR '1'='1";

      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: maliciousEmail,
          password: 'Test@Pass123!'
        })
        .expect(401);

      // Verify no SQL error
      const result = await pool.query('SELECT COUNT(*) FROM users');
      expect(result.rows[0].count).toBeDefined();
    });

    test('should prevent NoSQL injection (if using MongoDB)', () => {
      // Placeholder for NoSQL injection tests if MongoDB is added
    });
  });

  describe('A05:2021 - Security Misconfiguration', () => {
    test('should not expose stack traces in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/api/v1/non-existent-route')
        .expect(404);

      expect(response.body.stack).toBeUndefined();
      expect(response.body.message).not.toContain('Error:');

      process.env.NODE_ENV = originalEnv;
    });

    test('should set security headers', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
  });

  describe('A07:2021 - Identification and Authentication Failures', () => {
    test('should enforce strong password policy', async () => {
      const weakPasswords = [
        'password',
        '12345678',
        'qwerty',
        'Password1' // Missing special char
      ];

      for (const password of weakPasswords) {
        await request(app)
          .post('/api/v1/auth/register')
          .send({
            email: 'test@example.com',
            password
          })
          .expect(400);
      }
    });

    test('should implement rate limiting on auth endpoints', async () => {
      // Already covered in integration tests
    });
  });
});
```

### 4.2 JWT Security Tests

**Test Suite: `src/tests/security/jwt.security.test.js`**

```javascript
describe('JWT Security Tests', () => {
  describe('Token Expiration', () => {
    test('should reject expired access token', async () => {
      const expiredToken = jwt.sign(
        { userId: 'test-user' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '1ms' }
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('Token Revocation', () => {
    test('should maintain blacklist of revoked tokens', async () => {
      const tokens = generateTokens('user-123');

      // Logout (revokes refresh token)
      await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', `refresh-token=${tokens.refreshToken}`)
        .expect(200);

      // Try to use revoked token
      await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refresh-token=${tokens.refreshToken}`)
        .expect(401);
    });
  });

  describe('Token Rotation', () => {
    test('should detect token replay attacks', async () => {
      const tokens = generateTokens('user-123');

      // Use refresh token once
      const response1 = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refresh-token=${tokens.refreshToken}`)
        .expect(200);

      const newRefreshToken = response1.headers['set-cookie']
        .find(c => c.startsWith('refresh-token='))
        .split(';')[0]
        .split('=')[1];

      // Attempt replay attack with old token
      await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refresh-token=${tokens.refreshToken}`)
        .expect(401);

      // New token should still work
      await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refresh-token=${newRefreshToken}`)
        .expect(200);
    });
  });
});
```

---

## 5. Performance Testing Requirements

### 5.1 API Response Time Benchmarks

**Test Suite: `src/tests/performance/api.performance.test.js`**

```javascript
describe('API Performance Tests', () => {
  describe('Authentication Endpoints', () => {
    test('registration should complete in < 500ms', async () => {
      const start = Date.now();

      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'perf@example.com',
          password: 'Perf@Pass123!'
        })
        .expect(201);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });

    test('login should complete in < 500ms', async () => {
      // Create user first
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'perf@example.com',
          password: 'Perf@Pass123!'
        });

      const start = Date.now();

      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'perf@example.com',
          password: 'Perf@Pass123!'
        })
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });

    test('session verification should complete in < 100ms', async () => {
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'perf@example.com',
          password: 'Perf@Pass123!'
        });

      const accessToken = loginResponse.body.accessToken;

      const start = Date.now();

      await request(app)
        .get('/api/v1/auth/verify-session')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Profile Endpoints', () => {
    test('profile update should complete in < 300ms', async () => {
      const { accessToken } = await createUserAndLogin('perf@example.com');

      const start = Date.now();

      await request(app)
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(300);
    });
  });
});
```

### 5.2 Database Connection Pool Performance

**Test Suite: `src/tests/performance/db.pool.test.js`**

Validates Architecture Review fix: **Prisma Connection Pool Configuration**

```javascript
describe('Database Connection Pool Performance', () => {
  test('should handle 100 concurrent queries', async () => {
    const queries = Array(100).fill(null).map(() =>
      pool.query('SELECT NOW()')
    );

    const start = Date.now();
    const results = await Promise.all(queries);
    const duration = Date.now() - start;

    expect(results).toHaveLength(100);
    expect(duration).toBeLessThan(2000); // Should complete in < 2 seconds
  });

  test('should reuse connections efficiently', async () => {
    const initialIdleCount = pool.idleCount;

    // Execute 10 sequential queries
    for (let i = 0; i < 10; i++) {
      await pool.query('SELECT NOW()');
    }

    // Wait for connections to return to pool
    await new Promise(resolve => setTimeout(resolve, 100));

    // Idle count should be back to initial (connection reuse)
    expect(pool.idleCount).toBeGreaterThanOrEqual(initialIdleCount - 1);
  });

  test('should not exceed connection limit', async () => {
    const MAX_CONNECTIONS = 20;

    // Acquire all connections
    const connections = [];
    for (let i = 0; i < MAX_CONNECTIONS; i++) {
      connections.push(await pool.connect());
    }

    expect(pool.totalCount).toBeLessThanOrEqual(MAX_CONNECTIONS);

    // Release connections
    connections.forEach(conn => conn.release());
  });
});
```

### 5.3 Load Testing Strategy

**Tool:** Artillery or k6

**Load Test Configuration (artillery.yml):**
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10  # 10 users per second
      name: "Warm-up"
    - duration: 300
      arrivalRate: 50  # 50 users per second
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100  # 100 users per second
      name: "Peak load"

scenarios:
  - name: "User Registration and Login Flow"
    flow:
      - post:
          url: "/api/v1/auth/register"
          json:
            email: "user-{{ $randomString() }}@example.com"
            password: "Test@Pass123!"
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "{{ email }}"
            password: "Test@Pass123!"
      - get:
          url: "/api/v1/profile"
          headers:
            Authorization: "Bearer {{ accessToken }}"
```

**Run Load Tests:**
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run artillery.yml

# Generate report
artillery run --output report.json artillery.yml
artillery report report.json
```

**Acceptance Criteria:**
- P95 response time < 1 second for all endpoints
- Zero errors under 50 requests/second
- < 1% error rate under 100 requests/second

---

## 6. CI/CD Testing Integration

### 6.1 GitHub Actions Workflow

**File: `.github/workflows/sprint1-tests.yml`**

```yaml
name: Sprint 1 Test Suite

on:
  push:
    branches: [ main, develop, feature/* ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        working-directory: ./src
        run: npm ci

      - name: Run unit tests
        working-directory: ./src
        run: npm test -- --coverage --testPathPattern=unit

      - name: Upload unit test coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./src/coverage
          flags: unit-tests

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_aicv_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        working-directory: ./src
        run: npm ci

      - name: Setup test database
        working-directory: ./src
        run: npm run db:test-setup
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_aicv_db

      - name: Run integration tests
        working-directory: ./src
        run: npm test -- --coverage --testPathPattern=integration
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_aicv_db
          JWT_ACCESS_SECRET: test_access_secret_key_minimum_32_characters_long
          JWT_REFRESH_SECRET: test_refresh_secret_key_minimum_32_characters_long
          NODE_ENV: test

      - name: Upload integration test coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./src/coverage
          flags: integration-tests

  security-tests:
    name: Security Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_aicv_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./src
        run: npm ci

      - name: Run security tests
        working-directory: ./src
        run: npm test -- --testPathPattern=security
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_aicv_db
          NODE_ENV: test

      - name: Run npm audit
        working-directory: ./src
        run: npm audit --audit-level=high

      - name: Run OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'AI-CV-Assistant'
          path: '.'
          format: 'HTML'

      - name: Upload OWASP report
        uses: actions/upload-artifact@v3
        with:
          name: dependency-check-report
          path: reports

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: test_aicv_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install backend dependencies
        working-directory: ./src
        run: npm ci

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Install Playwright
        working-directory: ./frontend
        run: npx playwright install --with-deps

      - name: Start backend server
        working-directory: ./src
        run: npm run dev &
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_aicv_db
          PORT: 3001

      - name: Start frontend server
        working-directory: ./frontend
        run: npm run dev &
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3001

      - name: Wait for servers
        run: |
          npx wait-on http://localhost:3001/health
          npx wait-on http://localhost:3000

      - name: Run Playwright tests
        working-directory: ./frontend
        run: npx playwright test

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30

  coverage-check:
    name: Coverage Check
    needs: [unit-tests, integration-tests]
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Download coverage reports
        uses: actions/download-artifact@v3

      - name: Check coverage threshold
        run: |
          COVERAGE=$(grep -o '"lines":{"total":[0-9.]*' src/coverage/coverage-summary.json | grep -o '[0-9.]*$')
          echo "Current coverage: $COVERAGE%"
          if (( $(echo "$COVERAGE < 85" | bc -l) )); then
            echo "❌ Coverage $COVERAGE% is below 85% threshold"
            exit 1
          else
            echo "✅ Coverage $COVERAGE% meets threshold"
          fi

  quality-gate:
    name: Quality Gate
    needs: [unit-tests, integration-tests, security-tests, e2e-tests, coverage-check]
    runs-on: ubuntu-latest

    steps:
      - name: Quality Gate Check
        run: |
          echo "✅ All tests passed"
          echo "✅ Security checks passed"
          echo "✅ Coverage threshold met"
          echo "🎉 Quality gate passed!"
```

### 6.2 Pre-commit Hooks

**File: `.husky/pre-commit`**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🧪 Running pre-commit tests..."

# Run unit tests for changed files only
npm --prefix src test -- --onlyChanged --bail

# Run linting
npm --prefix src run lint
npm --prefix frontend run lint

# Run security check
npm --prefix src audit --audit-level=high

echo "✅ Pre-commit checks passed!"
```

**Installation:**
```bash
# Install Husky
npm install --save-dev husky

# Initialize Husky
npx husky install

# Create pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

---

## 7. Architecture Fix Validation Tests

This section provides specific tests to validate the 7 critical/high-priority fixes from the Architecture Review.

### 7.1 Prisma Connection Pool Configuration

**Test: `src/tests/architecture-fixes/connection-pool.test.js`**

```javascript
describe('Architecture Fix: Connection Pool Configuration', () => {
  test('should configure 20 connections (pg for Story 1.1)', () => {
    // ✅ FIXED: For Story 1.1, test pg Pool directly
    const { pool } = require('../config/db.config');
    expect(pool.options.max).toBe(20);
  });

  test('should set pool timeout to 20 seconds (pg for Story 1.1)', () => {
    // ✅ FIXED: For Story 1.1, test pg Pool directly
    const { pool } = require('../config/db.config');
    expect(pool.options.connectionTimeoutMillis).toBe(20000);
  });

  // Note: For Story 1.2+ with Prisma, connection pooling is configured in:
  // prisma/schema.prisma: connection_limit = 20

  test('should handle concurrent connections up to limit', async () => {
    const connections = Array(20).fill(null).map(() => pool.connect());
    const clients = await Promise.all(connections);

    expect(clients).toHaveLength(20);
    clients.forEach(client => client.release());
  });
});
```

### 7.2 Password Policy Enforcement

**Test: `src/tests/architecture-fixes/password-policy.test.js`**

```javascript
describe('Architecture Fix: Strong Password Policy', () => {
  test('should enforce 12 character minimum', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Short1!'
      })
      .expect(400);
  });

  test('should require special character', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'NoSpecialChar123'
      })
      .expect(400);
  });

  test('should accept policy-compliant password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Compliant@Pass123!'
      })
      .expect(201);
  });
});
```

### 7.3 JWT Refresh Token Rotation

**Test: `src/tests/architecture-fixes/jwt-rotation.test.js`**

```javascript
describe('Architecture Fix: JWT Refresh Token Rotation', () => {
  test('should issue new refresh token on refresh', async () => {
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test@Pass123!'
      });

    const oldRefreshToken = extractRefreshToken(loginResponse);

    const refreshResponse = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refresh-token=${oldRefreshToken}`)
      .expect(200);

    const newRefreshToken = extractRefreshToken(refreshResponse);

    expect(newRefreshToken).not.toBe(oldRefreshToken);
  });

  test('should blacklist old refresh token', async () => {
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test@Pass123!'
      });

    const oldRefreshToken = extractRefreshToken(loginResponse);

    // Refresh once
    await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refresh-token=${oldRefreshToken}`);

    // Try to use old token again
    await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', `refresh-token=${oldRefreshToken}`)
      .expect(401);
  });
});
```

### 7.4 Rate Limiting Tests

**Test: `src/tests/architecture-fixes/rate-limiting.test.js`**

```javascript
describe('Architecture Fix: Rate Limiting', () => {
  test('should limit registration to 5 requests per 15 minutes', async () => {
    // Make 5 registration attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `user${i}@example.com`,
          password: 'Test@Pass123!'
        });
    }

    // 6th attempt should be rate limited
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'user6@example.com',
        password: 'Test@Pass123!'
      })
      .expect(429);
  });

  test('should limit login to 5 attempts per 15 minutes', async () => {
    // Create user
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ratelimit@example.com',
        password: 'Test@Pass123!'
      });

    // Make 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'ratelimit@example.com',
          password: 'WrongPassword!'
        })
        .expect(401);
    }

    // 6th attempt should be rate limited (even with correct password)
    await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'ratelimit@example.com',
        password: 'Test@Pass123!'
      })
      .expect(429);
  });

  test('should return Retry-After header', async () => {
    // Exceed rate limit
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `user${i}@example.com`,
          password: 'Test@Pass123!'
        });
    }

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'blocked@example.com',
        password: 'Test@Pass123!'
      })
      .expect(429);

    expect(response.headers['retry-after']).toBeDefined();
    expect(parseInt(response.headers['retry-after'])).toBeGreaterThan(0);
  });
});
```

### 7.5 Input Validation & Sanitization

**Test: `src/tests/architecture-fixes/input-validation.test.js`**

```javascript
describe('Architecture Fix: Input Validation & Sanitization', () => {
  describe('XSS Prevention', () => {
    test('should sanitize HTML in firstName', async () => {
      const { accessToken } = await createUserAndLogin('test@example.com');

      await request(app)
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: '<script>alert("XSS")</script>'
        })
        .expect(200);

      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.body.firstName).not.toContain('<script>');
    });

    test('should sanitize HTML in lastName', async () => {
      const { accessToken } = await createUserAndLogin('test@example.com');

      await request(app)
        .post('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          lastName: '<img src=x onerror=alert("XSS")>'
        })
        .expect(200);

      const response = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.body.lastName).not.toContain('<img');
    });
  });

  describe('SQL Injection Prevention', () => {
    test('should use parameterized queries', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: "test@example.com' OR '1'='1",
          password: "password' OR '1'='1"
        })
        .expect(401);

      // Verify database integrity
      const result = await pool.query('SELECT COUNT(*) FROM users');
      expect(result.rows[0].count).toBeDefined();
    });
  });
});
```

### 7.6 Content Security Policy (CSP)

**Test: `src/tests/architecture-fixes/csp-headers.test.js`**

```javascript
describe('Architecture Fix: Content Security Policy', () => {
  test('should set CSP headers', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
  });

  test('should set X-Content-Type-Options', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  test('should set X-Frame-Options', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.headers['x-frame-options']).toBe('DENY');
  });

  test('should set X-XSS-Protection', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.headers['x-xss-protection']).toBe('1; mode=block');
  });
});
```

### 7.7 HTTPS/TLS Enforcement

**Test: `src/tests/architecture-fixes/https-enforcement.test.js`**

```javascript
describe('Architecture Fix: HTTPS Enforcement', () => {
  test('should redirect HTTP to HTTPS in production', () => {
    if (process.env.NODE_ENV === 'production') {
      const app = require('../../app');
      const middleware = app._router.stack.find(
        layer => layer.name === 'ensureSecure'
      );
      expect(middleware).toBeDefined();
    }
  });

  test('should set Secure flag on cookies in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test@Pass123!'
      });

    const cookies = response.headers['set-cookie'];
    const refreshCookie = cookies.find(c => c.startsWith('refresh-token='));

    expect(refreshCookie).toContain('Secure');

    process.env.NODE_ENV = originalEnv;
  });
});
```

---

## 8. Definition of Done (Testing Criteria)

### 8.1 Story-Level Definition of Done

A story is considered "done" when:

**Code Quality:**
- [ ] All unit tests pass (100% of critical paths)
- [ ] All integration tests pass
- [ ] Code coverage ≥ 85% (≥ 90% for auth-related code)
- [ ] No linting errors
- [ ] Code review approved by at least one peer

**Functionality:**
- [ ] All acceptance criteria met
- [ ] Manual testing completed (smoke test)
- [ ] No known critical or high-priority bugs

**Security:**
- [ ] Security tests pass
- [ ] No high/critical vulnerabilities in dependencies
- [ ] OWASP Top 10 checks pass
- [ ] Input validation and sanitization verified

**Performance:**
- [ ] API response time meets NFR requirements
- [ ] Database queries optimized (no N+1 queries)
- [ ] Performance tests pass

**Documentation:**
- [ ] API endpoints documented (if applicable)
- [ ] Code comments for complex logic
- [ ] README updated (if needed)

**CI/CD:**
- [ ] All CI/CD pipeline stages pass
- [ ] Quality gate approved
- [ ] Deployment to staging successful (if applicable)

### 8.2 Sprint-Level Definition of Done

Sprint 1 is complete when:

- [ ] All 4 stories (1.1-1.4) meet individual DoD
- [ ] Integration testing across all stories passes
- [ ] E2E user journeys work (registration → login → profile update)
- [ ] Architecture fixes validated (7 high-priority items)
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Sprint demo completed
- [ ] Sprint retrospective conducted
- [ ] Documentation updated

### 8.3 Test Coverage Requirements

**Minimum Coverage by Category:**

| Category | Minimum Coverage | Rationale |
|----------|-----------------|-----------|
| **Authentication Logic** | 95% | Critical security path |
| **Password Utilities** | 100% | Critical security path |
| **JWT Utilities** | 95% | Critical security path |
| **User Repository** | 90% | Core data layer |
| **Auth Service** | 90% | Core business logic |
| **Profile Service** | 85% | Standard business logic |
| **API Controllers** | 85% | Standard request handling |
| **Validators** | 90% | Critical input validation |
| **Middleware** | 85% | Cross-cutting concerns |
| **Overall Backend** | 85% | Aggregate requirement |

**Coverage Exemptions:**
- Configuration files (db.config.js)
- Server bootstrap (server.js)
- Database migration scripts
- Test utilities and fixtures

### 8.4 Quality Gates

**Automated Quality Gates (CI/CD):**

1. **Unit Test Gate**
   - ✅ All unit tests pass
   - ✅ Coverage ≥ 85%
   - ⏱️ Test execution < 2 minutes

2. **Integration Test Gate**
   - ✅ All integration tests pass
   - ✅ Database connectivity verified
   - ⏱️ Test execution < 5 minutes

3. **Security Test Gate**
   - ✅ All security tests pass
   - ✅ No high/critical npm audit findings
   - ✅ OWASP checks pass

4. **E2E Test Gate**
   - ✅ Critical user journeys pass
   - ⏱️ Test execution < 10 minutes

5. **Performance Test Gate**
   - ✅ API response times meet NFRs
   - ✅ No performance regressions

6. **Code Quality Gate**
   - ✅ Zero linting errors
   - ✅ Code complexity < threshold
   - ✅ No code smells (SonarQube, if integrated)

**Manual Quality Gates:**

1. **Code Review**
   - Peer review completed
   - Architecture review (for significant changes)
   - Security review (for auth-related changes)

2. **Exploratory Testing**
   - Happy path manual testing
   - Edge case testing
   - Usability testing

---

## 9. Test Data Management

### 9.1 Test Database Setup

**Database Initialization Script: `src/scripts/test-db-setup.sql`**

```sql
-- Drop test database if exists
DROP DATABASE IF EXISTS test_aicv_db;

-- Create test database
CREATE DATABASE test_aicv_db;

-- Connect to test database
\c test_aicv_db;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Create test user (for quick testing)
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES (
  'test@example.com',
  '$2b$10$ABCDEFGHIJKLMNOPQRSTUV.ABCDEFGHIJKLMNOPQRSTUV',
  'Test',
  'User'
);
```

**Setup Script: `src/scripts/setup-test-db.js`**

```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupTestDatabase() {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    port: 5432
  });

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'test-db-setup.sql'),
      'utf8'
    );

    await pool.query(sql);
    console.log('✅ Test database setup complete');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  setupTestDatabase();
}

module.exports = setupTestDatabase;
```

**Add to package.json:**
```json
{
  "scripts": {
    "db:test-setup": "node scripts/setup-test-db.js",
    "db:test-reset": "node scripts/setup-test-db.js && npm run db:migrate",
    "test": "jest --config jest.config.js",
    "test:unit": "jest --config jest.config.js --testPathPattern=unit",
    "test:integration": "jest --config jest.config.js --testPathPattern=integration",
    "test:security": "jest --config jest.config.js --testPathPattern=security",
    "test:coverage": "jest --config jest.config.js --coverage"
  }
}
```

### 9.2 Test Fixtures

**File: `src/tests/fixtures/users.fixture.js`**

```javascript
const bcrypt = require('bcrypt');

const TEST_USERS = {
  validUser: {
    email: 'valid@example.com',
    password: 'Valid@Pass123!',
    passwordHash: null, // Computed on demand
    firstName: 'Valid',
    lastName: 'User',
    phoneNumber: '+1234567890'
  },

  adminUser: {
    email: 'admin@example.com',
    password: 'Admin@Pass123!',
    passwordHash: null,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin'
  },

  unverifiedUser: {
    email: 'unverified@example.com',
    password: 'Unverified@Pass123!',
    passwordHash: null,
    emailVerified: false
  },

  weakPasswordUser: {
    email: 'weak@example.com',
    password: 'weak'
  },

  invalidEmailUser: {
    email: 'invalid-email',
    password: 'Invalid@Pass123!'
  }
};

async function hashUserPasswords() {
  for (const user of Object.values(TEST_USERS)) {
    if (user.password && !user.passwordHash) {
      user.passwordHash = await bcrypt.hash(user.password, 12);
    }
  }
}

async function createTestUser(userData) {
  const { pool } = require('../../config/db.config');

  const passwordHash = await bcrypt.hash(userData.password, 12);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone_number, email_verified)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userData.email,
      passwordHash,
      userData.firstName,
      userData.lastName,
      userData.phoneNumber,
      userData.emailVerified ?? true
    ]
  );

  return result.rows[0];
}

async function cleanupTestUsers() {
  const { pool } = require('../../config/db.config');
  const emails = Object.values(TEST_USERS).map(u => u.email);

  await pool.query(
    'DELETE FROM users WHERE email = ANY($1)',
    [emails]
  );
}

module.exports = {
  TEST_USERS,
  hashUserPasswords,
  createTestUser,
  cleanupTestUsers
};
```

### 9.3 Test Helpers

**File: `src/tests/helpers/auth.helper.js`**

```javascript
const request = require('supertest');
const app = require('../../app');

async function registerUser(userData) {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send(userData);

  return response.body;
}

async function loginUser(email, password) {
  const response = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });

  return {
    accessToken: response.body.accessToken,
    userId: response.body.userId,
    refreshToken: extractRefreshToken(response)
  };
}

async function createUserAndLogin(email, password = 'Test@Pass123!') {
  await registerUser({ email, password });
  return loginUser(email, password);
}

function extractRefreshToken(response) {
  const cookies = response.headers['set-cookie'];
  if (!cookies) return null;

  const refreshCookie = cookies.find(c => c.startsWith('refresh-token='));
  if (!refreshCookie) return null;

  return refreshCookie.split(';')[0].split('=')[1];
}

function generateAuthHeader(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

module.exports = {
  registerUser,
  loginUser,
  createUserAndLogin,
  extractRefreshToken,
  generateAuthHeader
};
```

---

## 10. Regression Testing Strategy

### 10.1 Regression Test Suite

**Scope:** Tests that must pass after every change to prevent regressions

**Categories:**

1. **Critical Path Tests (P0 - Must Always Pass)**
   - User registration
   - User login
   - Session verification
   - Password hashing
   - JWT generation and verification

2. **High Priority Tests (P1 - Should Always Pass)**
   - Profile creation/update
   - Rate limiting
   - Input validation
   - Security headers
   - CORS configuration

3. **Medium Priority Tests (P2 - May Fail with Known Issues)**
   - Edge cases
   - Error messages
   - Logging
   - Performance benchmarks

**Regression Suite Configuration:**

```javascript
// jest.config.regression.js
module.exports = {
  ...require('./jest.config.js'),
  testMatch: [
    '<rootDir>/tests/regression/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/integration/',
    '/tests/unit/'
  ]
};
```

**Run Regression Tests:**
```bash
npm test -- --config jest.config.regression.js
```

### 10.2 Smoke Tests

**Purpose:** Quick validation that core functionality works after deployment

**Smoke Test Suite: `src/tests/smoke/smoke.test.js`**

```javascript
describe('Smoke Tests - Critical Functionality', () => {
  test('Database connection works', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toHaveLength(1);
  });

  test('Server is running', async () => {
    await request(app)
      .get('/health')
      .expect(200);
  });

  test('Registration endpoint works', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `smoke-${Date.now()}@example.com`,
        password: 'Smoke@Test123!'
      })
      .expect(201);
  });

  test('Login endpoint works', async () => {
    const email = `smoke-${Date.now()}@example.com`;

    // Register
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'Smoke@Test123!'
      });

    // Login
    await request(app)
      .post('/api/v1/auth/login')
      .send({
        email,
        password: 'Smoke@Test123!'
      })
      .expect(200);
  });
});
```

**Run Smoke Tests:**
```bash
npm test -- --testPathPattern=smoke
```

---

## 11. Test Reporting & Metrics

### 11.1 Coverage Reports

**Generate Coverage Report:**
```bash
npm test -- --coverage
```

**Coverage Report Location:**
- HTML Report: `src/coverage/lcov-report/index.html`
- JSON Summary: `src/coverage/coverage-summary.json`
- LCOV: `src/coverage/lcov.info` (for CI tools)

**Jest Coverage Configuration:**

```javascript
// jest.config.js
module.exports = {
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'lcov', 'json-summary'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/scripts/**',
    '!src/config/db.config.js',
    '!src/server.js'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/services/auth.service.js': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/utils/password.util.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
```

### 11.2 Test Metrics Dashboard

**Metrics to Track:**

1. **Test Execution Metrics**
   - Total tests run
   - Pass rate (target: 100%)
   - Execution time (target: < 5 minutes)
   - Flaky tests (target: 0)

2. **Coverage Metrics**
   - Line coverage (target: ≥ 85%)
   - Branch coverage (target: ≥ 85%)
   - Function coverage (target: ≥ 85%)
   - Coverage trend (should increase over time)

3. **Quality Metrics**
   - Bugs found in testing (categorized by severity)
   - Bugs escaped to production (target: 0 critical/high)
   - Test automation ratio (target: ≥ 90%)

4. **Performance Metrics**
   - API response times (P50, P95, P99)
   - Database query performance
   - Test execution time trends

### 11.3 Test Results Visualization

**Recommended Tools:**

1. **Jest HTML Reporter**
```bash
npm install --save-dev jest-html-reporter
```

```javascript
// jest.config.js
module.exports = {
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'Sprint 1 Test Results',
        outputPath: 'test-results/index.html',
        includeFailureMsg: true,
        includeConsoleLog: true
      }
    ]
  ]
};
```

2. **Codecov Integration** (for coverage visualization)
```yaml
# .github/workflows/ci.yml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    flags: backend
    name: backend-coverage
```

3. **Allure Reports** (for detailed test reporting)
```bash
npm install --save-dev jest-allure
```

---

## 12. Summary & Next Steps

### 12.1 Implementation Checklist

**Phase 1: Setup Testing Infrastructure (Week 1)**
- [ ] Install testing dependencies (Jest, Supertest, Playwright)
- [ ] Configure Jest (jest.config.js)
- [ ] Set up test database (PostgreSQL container)
- [ ] Create test fixtures and helpers
- [ ] Configure CI/CD pipeline (GitHub Actions)

**Phase 2: Story 1.1 Tests (Week 1)**
- [ ] Write infrastructure tests
- [ ] Write database connection tests
- [ ] Enhance CI/CD workflow with test stages
- [ ] Validate connection pool configuration

**Phase 3: Story 1.2 Tests (Week 2)**
- [ ] Write password utility tests (unit)
- [ ] Write auth service tests (unit)
- [ ] Write registration API tests (integration)
- [ ] Write security tests (password policy, XSS, SQL injection)
- [ ] Validate password policy enforcement

**Phase 4: Story 1.3 Tests (Week 2-3)**
- [ ] Write JWT utility tests (unit)
- [ ] Write login service tests (unit)
- [ ] Write login API tests (integration)
- [ ] Write session management tests (integration)
- [ ] Write JWT security tests (rotation, blacklisting)
- [ ] Validate rate limiting

**Phase 5: Story 1.4 Tests (Week 3)**
- [ ] Write profile service tests (unit)
- [ ] Write profile API tests (integration)
- [ ] Write input validation tests
- [ ] Write E2E tests (registration → login → profile update)

**Phase 6: Quality Assurance (Week 4)**
- [ ] Run full regression suite
- [ ] Perform security audit
- [ ] Execute performance tests
- [ ] Generate coverage reports
- [ ] Fix any failing tests
- [ ] Document test results

### 12.2 Test Execution Schedule

**Daily:**
- Run unit tests on developer machines
- Pre-commit hook tests

**On Every Pull Request:**
- Full test suite (unit + integration + security)
- Coverage check
- Linting

**On Merge to Main:**
- Full test suite
- E2E tests
- Performance tests
- Security scans
- Deploy to staging

**Weekly:**
- Regression test suite
- Performance benchmarking
- Security audit
- Test metrics review

### 12.3 Risk Mitigation

**High-Risk Areas:**

1. **JWT Security**
   - **Risk:** Token theft, replay attacks
   - **Mitigation:** Comprehensive JWT security tests, refresh token rotation validation

2. **Password Security**
   - **Risk:** Weak passwords, brute force attacks
   - **Mitigation:** Strong password policy tests, rate limiting validation

3. **Database Connection Pool**
   - **Risk:** Connection exhaustion under load
   - **Mitigation:** Connection pool performance tests, load testing

4. **API Security**
   - **Risk:** XSS, SQL injection, CSRF
   - **Mitigation:** OWASP Top 10 security test suite

### 12.4 Success Criteria

Sprint 1 testing is successful when:

- ✅ All 4 stories have 85%+ test coverage
- ✅ Zero critical or high-priority bugs
- ✅ All security tests pass
- ✅ Performance benchmarks met
- ✅ CI/CD pipeline fully automated
- ✅ Architecture fixes validated
- ✅ Regression suite established
- ✅ Test documentation complete

---

## Appendix A: Testing Tools Reference

### A.1 Backend Testing Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Jest | ^29.7.0 | Test framework |
| Supertest | ^6.3.3 | HTTP assertion library |
| node-pg-mock | ^1.5.0 | PostgreSQL mocking |
| bcrypt | ^5.1.1 | Password hashing (also used in tests) |
| jsonwebtoken | ^9.0.2 | JWT generation/verification |

**Installation:**
```bash
cd src
npm install --save-dev jest supertest @types/jest node-pg-mock
```

### A.2 Frontend Testing Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Jest | ^29.7.0 | Test framework |
| React Testing Library | ^14.0.0 | React component testing |
| Playwright | ^1.40.0 | E2E testing |
| MSW | ^2.0.0 | API mocking |

**Installation:**
```bash
cd frontend
npm install --save-dev @playwright/test playwright
npx playwright install
```

### A.3 CI/CD Tools

| Tool | Purpose |
|------|---------|
| GitHub Actions | CI/CD orchestration |
| Codecov | Coverage reporting |
| Dependabot | Dependency updates |
| Husky | Git hooks |

---

## Appendix B: Test Configuration Files

### B.1 Jest Configuration

**File: `src/jest.config.js`**

```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/scripts/**',
    '!src/server.js',
    '!src/config/db.config.js'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text', 'lcov', 'json-summary'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  verbose: true,
  maxWorkers: '50%'
};
```

### B.2 Playwright Configuration

**File: `frontend/playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Appendix C: Quick Reference Commands

**Run All Tests:**
```bash
npm test
```

**Run Specific Test Category:**
```bash
npm test -- --testPathPattern=unit
npm test -- --testPathPattern=integration
npm test -- --testPathPattern=security
```

**Run Tests with Coverage:**
```bash
npm test -- --coverage
```

**Run Tests in Watch Mode:**
```bash
npm test -- --watch
```

**Run Tests for Changed Files Only:**
```bash
npm test -- --onlyChanged
```

**Debug Tests:**
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

**Run E2E Tests:**
```bash
cd frontend
npx playwright test
```

**View E2E Test Report:**
```bash
cd frontend
npx playwright show-report
```

**Run Performance Tests:**
```bash
artillery run artillery.yml
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-25
**Test Architect:** Master Test Architect (TEA)
**Status:** READY FOR SPRINT 1 IMPLEMENTATION

**Next Review Date:** End of Sprint 1 (Week 4)

---

END OF DOCUMENT
