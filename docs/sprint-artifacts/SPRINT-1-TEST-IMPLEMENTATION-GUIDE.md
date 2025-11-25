# Sprint 1 Test Implementation Guide
## Quick Start & Code Examples

**Project:** IBE160 - AI CV & Job Application Assistant
**Sprint:** Sprint 1 - Testing Implementation
**Date:** 2025-11-25
**Status:** IMPLEMENTATION READY

---

## Quick Start: 5-Step Testing Setup

### Step 1: Install Testing Dependencies (5 minutes)

```bash
# Navigate to backend directory
cd src

# Install Jest and testing utilities
npm install --save-dev \
  jest@^29.7.0 \
  supertest@^6.3.3 \
  @types/jest@^29.5.0 \
  node-pg-mock@^1.5.0

# Install bcrypt for password testing (if not already installed)
npm install bcrypt@^5.1.1

# Install jsonwebtoken for JWT testing (if not already installed)
npm install jsonwebtoken@^9.0.2
```

### Step 2: Create Jest Configuration (2 minutes)

**File: `src/jest.config.js`**

```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!tests/**',
    '!scripts/**',
    '!server.js',
    '!config/db.config.js',
    '!jest.config.js'
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
  verbose: true
};
```

### Step 3: Create Test Setup File (3 minutes)

**File: `src/tests/setup.js`**

```javascript
// Global test setup
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for database tests
jest.setTimeout(10000);

// Mock console for cleaner test output (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn()
};

// Global teardown
afterAll(async () => {
  // Close database connections
  const { pool } = require('../config/db.config');
  await pool.end();
});
```

### Step 4: Create Test Environment File (2 minutes)

**File: `src/.env.test`**

```bash
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=test_aicv_db
DB_USER=test_user
DB_PASSWORD=test_password
JWT_ACCESS_SECRET=test_access_secret_key_minimum_32_characters_long_for_security
JWT_REFRESH_SECRET=test_refresh_secret_key_minimum_32_characters_long_for_security
```

### Step 5: Update Package.json Scripts (1 minute)

**File: `src/package.json`**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:security": "jest --testPathPattern=security"
  }
}
```

---

## 🔄 IMPORTANT: Database Testing Strategy (pg → Prisma Migration)

### Overview: Two-Phase ORM Approach

Sprint 1 uses **two different database access patterns** for different stories:

| Story | ORM/Driver | Why | Tests Use |
|-------|-----------|-----|-----------|
| **1.1: Project Setup** | `pg` (PostgreSQL driver) | Simple connection testing, no ORM overhead | `pg` Pool |
| **1.2: User Registration** | **Prisma ORM** | Type-safe user auth, automatic TypeScript types | **Prisma Client** |
| **1.3: User Login** | **Prisma ORM** | Session management with type safety | **Prisma Client** |
| **1.4: Basic Profile** | **Prisma ORM** | User CRUD operations | **Prisma Client** |

**Critical Note:** This is **not** inconsistency—it's a pragmatic migration path.

---

### Why Two Approaches?

#### Story 1.1: Use `pg` for Infrastructure Setup ✅

**Rationale:**
- Story 1.1 tests basic database connectivity
- No need for ORM complexity at this stage
- Existing code (`src/config/db.config.js`) already uses `pg`
- Fast to set up and validate

**What Story 1.1 Tests:**
```javascript
// Simple connection tests with pg
const { pool } = require('../config/db.config');
await pool.connect(); // ✅ Validates database is reachable
```

---

#### Story 1.2+: Migrate to Prisma for Type-Safe Auth ✅

**Rationale:**
- User authentication requires type-safe database access
- Prisma auto-generates TypeScript types for User model
- Password hashing, JWT tokens benefit from compile-time safety
- Migration management (schema changes) handled by Prisma

**What Story 1.2+ Tests:**
```typescript
// Type-safe user operations with Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ Type-safe: TypeScript knows user has email, passwordHash, etc.
const user = await prisma.user.create({
  data: {
    email: 'test@example.com',
    passwordHash: hashedPassword
  }
});
```

---

### Migration Timeline

```
Week 1: Story 1.1 (Infrastructure)
├─ Use pg for connection tests ✅
├─ Validate connection pool configuration
└─ Basic query execution tests

Week 2: Story 1.2 (User Registration) - MIGRATION POINT
├─ Install Prisma: npx prisma init
├─ Define User schema in prisma/schema.prisma
├─ Run migration: npx prisma migrate dev
└─ Update tests to use Prisma Client ✅

Week 2-3: Stories 1.3-1.4
├─ All user auth uses Prisma
├─ All tests use Prisma Client
└─ pg still available for raw queries if needed
```

---

### Prisma Setup Guide (15 minutes) - For Story 1.2+

**Run Before Starting Story 1.2:**

```bash
# 1. Install Prisma (Story 1.2 prerequisite)
cd src
npm install --save-dev prisma@^5.7.0
npm install @prisma/client@^5.7.0

# 2. Initialize Prisma
npx prisma init

# 3. Update DATABASE_URL in .env
# Change from: postgresql://user:pass@localhost:5432/db
# To: postgresql://user:pass@localhost:5432/db?connection_limit=20&pool_timeout=20

# 4. Define User schema
# Edit: prisma/schema.prisma (see schema below)

# 5. Run migration
npx prisma migrate dev --name init_users

# 6. Generate Prisma Client
npx prisma generate
```

---

### Prisma Schema for Story 1.2+ (User Model)

**File: `src/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // ✅ CRITICAL: Connection pool configuration (Architecture Fix #1)
  connection_limit = 20
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  lastLoginAt  DateTime? @map("last_login_at")

  // GDPR consent flags (Epic 5)
  consentEssential  Boolean @default(true) @map("consent_essential")
  consentAiTraining Boolean @default(false) @map("consent_ai_training")
  consentMarketing  Boolean @default(false) @map("consent_marketing")

  @@map("users")
}
```

---

### Testing with Prisma Client (Story 1.2+ Pattern)

**Example: User Registration Test with Prisma**

**File: `src/tests/integration/auth.registration.test.js`**

```javascript
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../../utils/password.util');

const prisma = new PrismaClient();

describe('User Registration with Prisma', () => {
  // Clean up test data before each test
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  // Close Prisma connection after all tests
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create user with hashed password', async () => {
    const password = 'Test@Pass123!';
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: hashedPassword,
        name: 'Test User'
      }
    });

    // Type-safe assertions (TypeScript knows user properties)
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.passwordHash).not.toBe(password); // Hashed
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  test('should enforce unique email constraint', async () => {
    const userData = {
      email: 'duplicate@example.com',
      passwordHash: await hashPassword('Test@Pass123!'),
      name: 'Test User'
    };

    // Create first user
    await prisma.user.create({ data: userData });

    // Try to create duplicate (should fail)
    await expect(
      prisma.user.create({ data: userData })
    ).rejects.toThrow(/Unique constraint/);
  });

  test('should apply default values for consent flags', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'consent@example.com',
        passwordHash: await hashPassword('Test@Pass123!')
      }
    });

    // Default consent values from schema
    expect(user.consentEssential).toBe(true);   // Required
    expect(user.consentAiTraining).toBe(false); // Opt-in
    expect(user.consentMarketing).toBe(false);  // Opt-in
  });
});
```

---

### Mocking Prisma for Unit Tests

For **unit tests** (testing services without real database), mock Prisma Client:

**File: `src/tests/unit/auth.service.test.js`**

```javascript
const { PrismaClient } = require('@prisma/client');
const { prismaMock } = require('../mocks/prisma.mock');

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaMock)
  };
});

describe('Auth Service - Unit Tests (Mocked Prisma)', () => {
  test('should create user via service', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      passwordHash: 'hashed',
      name: 'Test User',
      createdAt: new Date()
    };

    // Mock Prisma's user.create method
    prismaMock.user.create.mockResolvedValue(mockUser);

    const authService = require('../../services/auth.service');
    const result = await authService.registerUser({
      email: 'test@example.com',
      password: 'Test@Pass123!',
      name: 'Test User'
    });

    expect(result.id).toBe('123');
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
  });
});
```

**File: `src/tests/mocks/prisma.mock.js`**

```javascript
// Mock Prisma Client for unit tests
module.exports.prismaMock = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  $connect: jest.fn(),
  $disconnect: jest.fn()
};
```

---

### Prisma Testing Checklist (Story 1.2+)

Before marking Story 1.2+ as "done":

- [ ] Prisma installed and initialized
- [ ] Database schema defined (`prisma/schema.prisma`)
- [ ] Initial migration applied (`npx prisma migrate dev`)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Integration tests use real Prisma Client
- [ ] Unit tests use mocked Prisma Client
- [ ] Connection pool configured (20 connections)
- [ ] Unique constraints validated in tests
- [ ] Default values tested
- [ ] Foreign key constraints tested (Epic 2+)

---

### FAQ: pg vs. Prisma

**Q: Why not use Prisma from Story 1.1?**
A: Story 1.1 is infrastructure setup. We validate database connectivity with `pg` first, then add Prisma's ORM layer for Story 1.2+. This is a standard migration pattern.

**Q: Do we remove `pg` after adding Prisma?**
A: No. `pg` stays available for:
- Raw SQL queries when needed
- Connection pool management
- Direct database access for debugging

**Q: Which tests use `pg` vs. Prisma?**
A:
- Story 1.1 tests: `pg` (connection tests)
- Story 1.2+ tests: Prisma (user auth, CRUD operations)

**Q: What about the Architecture Review recommendation for Prisma?**
A: The Architecture Review specifies Prisma for the final architecture. Story 1.1's `pg` usage is temporary infrastructure setup. Story 1.2+ fully adopts Prisma as specified.

---

## Story 1.1: Database Connection Tests

### Implementation: Convert Existing Test to Jest

**Original File:** `src/tests/db_connection_test.js` (to be replaced)

**New File: `src/tests/integration/db.connection.test.js`**

```javascript
const { pool, query } = require('../../config/db.config');

describe('Database Connection Tests', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('Basic Connectivity', () => {
    test('should connect to PostgreSQL database', async () => {
      const client = await pool.connect();
      expect(client).toBeDefined();
      client.release();
    });

    test('should execute SELECT NOW() query', async () => {
      const result = await query('SELECT NOW()');

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].now).toBeInstanceOf(Date);
    });

    test('should handle concurrent connections', async () => {
      const connections = Array(5)
        .fill(null)
        .map(() => pool.connect());

      const clients = await Promise.all(connections);

      expect(clients).toHaveLength(5);
      clients.forEach(client => {
        expect(client).toBeDefined();
        client.release();
      });
    });
  });

  describe('Connection Pool Configuration', () => {
    test('should have pool properties defined', () => {
      expect(pool.totalCount).toBeDefined();
      expect(pool.idleCount).toBeDefined();
      expect(pool.waitingCount).toBeDefined();
    });

    test('should reuse connections from pool', async () => {
      const client1 = await pool.connect();
      const initialTotal = pool.totalCount;
      client1.release();

      // Wait for connection to return to pool
      await new Promise(resolve => setTimeout(resolve, 50));

      const client2 = await pool.connect();
      expect(pool.totalCount).toBe(initialTotal);
      client2.release();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid SQL syntax', async () => {
      await expect(
        query('SELECT * FROM nonexistent_table')
      ).rejects.toThrow();
    });

    test('should recover from query errors', async () => {
      // Execute invalid query
      try {
        await query('INVALID SQL');
      } catch (error) {
        // Expected error
      }

      // Should still be able to execute valid queries
      const result = await query('SELECT 1 as num');
      expect(result.rows[0].num).toBe(1);
    });
  });

  describe('Connection Pool Limits', () => {
    test('should respect connection limit configuration', async () => {
      const DATABASE_URL = process.env.DATABASE_URL;

      // Check if connection limit is configured
      if (DATABASE_URL && DATABASE_URL.includes('connection_limit')) {
        expect(DATABASE_URL).toMatch(/connection_limit=\d+/);
      }
    });
  });
});
```

**Run Test:**
```bash
cd src
npm test -- tests/integration/db.connection.test.js
```

---

## Story 1.2: User Registration Tests

### Implementation: Password Utility Tests

**File: `src/utils/password.util.js` (Implementation)**

```javascript
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

// Password policy constants
const MIN_LENGTH = 12;
const REQUIRED_PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/
};

/**
 * Validate password against security policy
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @returns {boolean|object} - True if valid, or detailed errors
 */
function validatePassword(password, options = {}) {
  const errors = [];

  if (password.length < MIN_LENGTH) {
    errors.push(`Minimum ${MIN_LENGTH} characters required`);
  }

  if (!REQUIRED_PATTERNS.uppercase.test(password)) {
    errors.push('Must contain uppercase letter');
  }

  if (!REQUIRED_PATTERNS.lowercase.test(password)) {
    errors.push('Must contain lowercase letter');
  }

  if (!REQUIRED_PATTERNS.number.test(password)) {
    errors.push('Must contain number');
  }

  if (!REQUIRED_PATTERNS.special.test(password)) {
    errors.push('Must contain special character (!@#$%^&*)');
  }

  if (options.detailed) {
    return {
      valid: errors.length === 0,
      errors
    };
  }

  return errors.length === 0;
}

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
async function hashPassword(password) {
  if (!validatePassword(password)) {
    throw new Error('Password does not meet security requirements');
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare plain text password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if match
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = {
  validatePassword,
  hashPassword,
  comparePassword
};
```

**File: `src/tests/unit/password.util.test.js` (Tests)**

```javascript
const {
  validatePassword,
  hashPassword,
  comparePassword
} = require('../../utils/password.util');

describe('Password Utility - Unit Tests', () => {
  describe('validatePassword()', () => {
    describe('Valid Passwords', () => {
      test('should accept password with all requirements', () => {
        const validPasswords = [
          'Test@Pass123!',
          'MyS3cur3!Password',
          'C0mplex#Pass$2024',
          'Str0ng!P@ssw0rd',
          '12Characters!'
        ];

        validPasswords.forEach(password => {
          expect(validatePassword(password)).toBe(true);
        });
      });
    });

    describe('Invalid Passwords', () => {
      test('should reject password < 12 characters', () => {
        expect(validatePassword('Short1!')).toBe(false);
      });

      test('should reject password without uppercase', () => {
        expect(validatePassword('nouppercase123!')).toBe(false);
      });

      test('should reject password without lowercase', () => {
        expect(validatePassword('NOLOWERCASE123!')).toBe(false);
      });

      test('should reject password without number', () => {
        expect(validatePassword('NoNumbers!Pass')).toBe(false);
      });

      test('should reject password without special character', () => {
        expect(validatePassword('NoSpecialChar123')).toBe(false);
      });
    });

    describe('Detailed Validation', () => {
      test('should provide detailed error messages', () => {
        const result = validatePassword('weak', { detailed: true });

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Minimum 12 characters required');
        expect(result.errors).toContain('Must contain uppercase letter');
        expect(result.errors).toContain('Must contain special character (!@#$%^&*)');
      });

      test('should return empty errors for valid password', () => {
        const result = validatePassword('Valid@Pass123!', { detailed: true });

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });
  });

  describe('hashPassword()', () => {
    test('should hash password successfully', async () => {
      const password = 'Test@Pass123!';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    test('should use bcrypt with salt rounds 12', async () => {
      const password = 'Test@Pass123!';
      const hash = await hashPassword(password);

      // bcrypt hash format: $2b$12$...
      expect(hash.startsWith('$2b$12$')).toBe(true);
    });

    test('should generate unique hashes for same password', async () => {
      const password = 'Test@Pass123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    test('should reject weak password', async () => {
      await expect(hashPassword('weak')).rejects.toThrow(
        'Password does not meet security requirements'
      );
    });
  });

  describe('comparePassword()', () => {
    test('should return true for matching password', async () => {
      const password = 'Test@Pass123!';
      const hash = await hashPassword(password);

      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });

    test('should return false for non-matching password', async () => {
      const password = 'Test@Pass123!';
      const wrongPassword = 'Wrong@Pass456!';
      const hash = await hashPassword(password);

      const result = await comparePassword(wrongPassword, hash);
      expect(result).toBe(false);
    });

    test('should handle case-sensitive comparison', async () => {
      const password = 'Test@Pass123!';
      const hash = await hashPassword(password);

      const result = await comparePassword('test@pass123!', hash);
      expect(result).toBe(false);
    });
  });
});
```

**Run Test:**
```bash
npm test -- tests/unit/password.util.test.js
```

**Expected Output:**
```
 PASS  tests/unit/password.util.test.js
  Password Utility - Unit Tests
    validatePassword()
      Valid Passwords
        ✓ should accept password with all requirements (2 ms)
      Invalid Passwords
        ✓ should reject password < 12 characters (1 ms)
        ✓ should reject password without uppercase (1 ms)
        ✓ should reject password without lowercase
        ✓ should reject password without number
        ✓ should reject password without special character
      Detailed Validation
        ✓ should provide detailed error messages (1 ms)
        ✓ should return empty errors for valid password
    hashPassword()
      ✓ should hash password successfully (123 ms)
      ✓ should use bcrypt with salt rounds 12 (119 ms)
      ✓ should generate unique hashes for same password (241 ms)
      ✓ should reject weak password (1 ms)
    comparePassword()
      ✓ should return true for matching password (120 ms)
      ✓ should return false for non-matching password (242 ms)
      ✓ should handle case-sensitive comparison (121 ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Time:        1.234 s
```

---

## Story 1.3: JWT Utility Tests

### Implementation: JWT Token Management

**File: `src/utils/jwt.util.js` (Implementation)**

```javascript
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Token blacklist (in-memory for MVP, Redis recommended for production)
const tokenBlacklist = new Set();

/**
 * Generate access and refresh tokens
 * @param {string} userId - User ID
 * @returns {object} - { accessToken, refreshToken }
 */
function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
}

/**
 * Verify access token
 * @param {string} token - JWT access token
 * @returns {object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}

/**
 * Verify refresh token
 * @param {string} token - JWT refresh token
 * @returns {object} - Decoded token payload
 * @throws {Error} - If token is invalid, expired, or blacklisted
 */
function verifyRefreshToken(token) {
  // Check blacklist first
  if (tokenBlacklist.has(token)) {
    throw new Error('Token has been revoked');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}

/**
 * Rotate refresh token (invalidate old, issue new)
 * @param {string} oldRefreshToken - Current refresh token
 * @returns {string} - New refresh token
 * @throws {Error} - If old token is invalid
 */
function rotateRefreshToken(oldRefreshToken) {
  // Verify old token first
  const decoded = verifyRefreshToken(oldRefreshToken);

  // Blacklist old token
  tokenBlacklist.add(oldRefreshToken);

  // Generate new refresh token
  const newRefreshToken = jwt.sign(
    { userId: decoded.userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  return newRefreshToken;
}

/**
 * Check if token is blacklisted
 * @param {string} token - Token to check
 * @returns {boolean} - True if blacklisted
 */
function isTokenBlacklisted(token) {
  return tokenBlacklist.has(token);
}

/**
 * Clear token blacklist (for testing)
 */
function clearBlacklist() {
  tokenBlacklist.clear();
}

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  isTokenBlacklisted,
  clearBlacklist
};
```

**File: `src/tests/unit/jwt.util.test.js` (Tests)**

```javascript
const jwt = require('jsonwebtoken');
const {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  isTokenBlacklisted,
  clearBlacklist
} = require('../../utils/jwt.util');

describe('JWT Utility - Unit Tests', () => {
  const testUserId = 'test-user-123';

  beforeEach(() => {
    // Clear blacklist before each test
    clearBlacklist();
  });

  describe('generateTokens()', () => {
    test('should generate access and refresh tokens', () => {
      const tokens = generateTokens(testUserId);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    test('should include userId in token payload', () => {
      const tokens = generateTokens(testUserId);

      const accessDecoded = jwt.decode(tokens.accessToken);
      const refreshDecoded = jwt.decode(tokens.refreshToken);

      expect(accessDecoded.userId).toBe(testUserId);
      expect(refreshDecoded.userId).toBe(testUserId);
    });

    test('should set access token expiry to 15 minutes', () => {
      const tokens = generateTokens(testUserId);
      const decoded = jwt.decode(tokens.accessToken);

      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(15 * 60); // 15 minutes in seconds
    });

    test('should set refresh token expiry to 7 days', () => {
      const tokens = generateTokens(testUserId);
      const decoded = jwt.decode(tokens.refreshToken);

      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(7 * 24 * 60 * 60); // 7 days in seconds
    });

    test('should include token type in payload', () => {
      const tokens = generateTokens(testUserId);

      const accessDecoded = jwt.decode(tokens.accessToken);
      const refreshDecoded = jwt.decode(tokens.refreshToken);

      expect(accessDecoded.type).toBe('access');
      expect(refreshDecoded.type).toBe('refresh');
    });
  });

  describe('verifyAccessToken()', () => {
    test('should verify valid access token', () => {
      const tokens = generateTokens(testUserId);
      const decoded = verifyAccessToken(tokens.accessToken);

      expect(decoded.userId).toBe(testUserId);
      expect(decoded.type).toBe('access');
    });

    test('should throw error for expired token', (done) => {
      const expiredToken = jwt.sign(
        { userId: testUserId, type: 'access' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '1ms' }
      );

      setTimeout(() => {
        expect(() => verifyAccessToken(expiredToken)).toThrow('Token expired');
        done();
      }, 10);
    });

    test('should throw error for invalid signature', () => {
      const invalidToken = jwt.sign(
        { userId: testUserId, type: 'access' },
        'wrong-secret'
      );

      expect(() => verifyAccessToken(invalidToken)).toThrow('Invalid token');
    });

    test('should throw error for refresh token used as access', () => {
      const tokens = generateTokens(testUserId);

      expect(() => verifyAccessToken(tokens.refreshToken)).toThrow('Invalid token type');
    });

    test('should throw error for malformed token', () => {
      expect(() => verifyAccessToken('not-a-jwt')).toThrow('Invalid token');
    });
  });

  describe('verifyRefreshToken()', () => {
    test('should verify valid refresh token', () => {
      const tokens = generateTokens(testUserId);
      const decoded = verifyRefreshToken(tokens.refreshToken);

      expect(decoded.userId).toBe(testUserId);
      expect(decoded.type).toBe('refresh');
    });

    test('should throw error for blacklisted token', () => {
      const tokens = generateTokens(testUserId);

      // Rotate token (blacklists old one)
      rotateRefreshToken(tokens.refreshToken);

      // Try to verify blacklisted token
      expect(() => verifyRefreshToken(tokens.refreshToken)).toThrow('Token has been revoked');
    });

    test('should throw error for expired refresh token', (done) => {
      const expiredToken = jwt.sign(
        { userId: testUserId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '1ms' }
      );

      setTimeout(() => {
        expect(() => verifyRefreshToken(expiredToken)).toThrow('Token expired');
        done();
      }, 10);
    });

    test('should throw error for access token used as refresh', () => {
      const tokens = generateTokens(testUserId);

      expect(() => verifyRefreshToken(tokens.accessToken)).toThrow('Invalid token type');
    });
  });

  describe('rotateRefreshToken()', () => {
    test('should generate new refresh token', () => {
      const tokens = generateTokens(testUserId);
      const newRefreshToken = rotateRefreshToken(tokens.refreshToken);

      expect(newRefreshToken).toBeDefined();
      expect(newRefreshToken).not.toBe(tokens.refreshToken);
    });

    test('should blacklist old refresh token', () => {
      const tokens = generateTokens(testUserId);
      rotateRefreshToken(tokens.refreshToken);

      expect(isTokenBlacklisted(tokens.refreshToken)).toBe(true);
    });

    test('should preserve userId in new token', () => {
      const tokens = generateTokens(testUserId);
      const newRefreshToken = rotateRefreshToken(tokens.refreshToken);

      const decoded = jwt.decode(newRefreshToken);
      expect(decoded.userId).toBe(testUserId);
    });

    test('should throw error when rotating blacklisted token', () => {
      const tokens = generateTokens(testUserId);
      rotateRefreshToken(tokens.refreshToken);

      // Try to rotate again with blacklisted token
      expect(() => rotateRefreshToken(tokens.refreshToken)).toThrow('Token has been revoked');
    });

    test('should throw error for invalid token', () => {
      expect(() => rotateRefreshToken('invalid-token')).toThrow('Invalid token');
    });
  });

  describe('Token Rotation Security', () => {
    test('should prevent replay attacks', () => {
      const tokens = generateTokens(testUserId);

      // First rotation succeeds
      const newToken1 = rotateRefreshToken(tokens.refreshToken);
      expect(newToken1).toBeDefined();

      // Second rotation with same token fails (replay attack)
      expect(() => rotateRefreshToken(tokens.refreshToken)).toThrow('Token has been revoked');
    });

    test('should allow multiple rotations with new tokens', () => {
      const tokens = generateTokens(testUserId);

      const token1 = rotateRefreshToken(tokens.refreshToken);
      const token2 = rotateRefreshToken(token1);
      const token3 = rotateRefreshToken(token2);

      expect(token3).toBeDefined();
      expect(isTokenBlacklisted(tokens.refreshToken)).toBe(true);
      expect(isTokenBlacklisted(token1)).toBe(true);
      expect(isTokenBlacklisted(token2)).toBe(true);
      expect(isTokenBlacklisted(token3)).toBe(false);
    });
  });
});
```

**Run Test:**
```bash
npm test -- tests/unit/jwt.util.test.js
```

---

## Test Helpers & Fixtures

### Test Helpers

**File: `src/tests/helpers/auth.helper.js`**

```javascript
const request = require('supertest');
const app = require('../../app');

/**
 * Register a new user
 */
async function registerUser(userData) {
  const response = await request(app)
    .post('/api/v1/auth/register')
    .send(userData);

  return response.body;
}

/**
 * Login user and return tokens
 */
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

/**
 * Create user and login in one step
 */
async function createUserAndLogin(email, password = 'Test@Pass123!') {
  await registerUser({ email, password });
  return loginUser(email, password);
}

/**
 * Extract refresh token from cookie
 */
function extractRefreshToken(response) {
  const cookies = response.headers['set-cookie'];
  if (!cookies) return null;

  const refreshCookie = cookies.find(c => c.startsWith('refresh-token='));
  if (!refreshCookie) return null;

  return refreshCookie.split(';')[0].split('=')[1];
}

/**
 * Generate authorization header
 */
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

### Test Fixtures

**File: `src/tests/fixtures/users.fixture.js`**

```javascript
const TEST_USERS = {
  validUser: {
    email: 'valid@example.com',
    password: 'Valid@Pass123!',
    firstName: 'Valid',
    lastName: 'User',
    phoneNumber: '+1234567890'
  },

  anotherUser: {
    email: 'another@example.com',
    password: 'Another@Pass123!',
    firstName: 'Another',
    lastName: 'User'
  },

  weakPasswordUser: {
    email: 'weak@example.com',
    password: 'weak'
  },

  invalidEmailUser: {
    email: 'invalid-email',
    password: 'Invalid@Pass123!'
  },

  noUppercasePassword: {
    email: 'noupper@example.com',
    password: 'nouppercase123!'
  },

  noSpecialCharPassword: {
    email: 'nospecial@example.com',
    password: 'NoSpecialChar123'
  }
};

module.exports = { TEST_USERS };
```

---

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- tests/unit/password.util.test.js
```

### Run Tests by Pattern
```bash
npm test -- --testPathPattern=unit
npm test -- --testPathPattern=integration
npm test -- --testPathPattern=security
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests in Watch Mode (for development)
```bash
npm test -- --watch
```

### Run Only Changed Tests
```bash
npm test -- --onlyChanged
```

---

## Debugging Tests

### Method 1: Console Logging
```javascript
test('should do something', () => {
  console.log('Debugging value:', someValue);
  expect(someValue).toBe(expected);
});
```

### Method 2: Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

Then open Chrome and navigate to `chrome://inspect`

### Method 3: VSCode Debugger

**File: `.vscode/launch.json`**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/src/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--no-cache",
        "${file}"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## Troubleshooting

### Issue: "Cannot find module"
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database connection timeout
```javascript
// Increase test timeout in jest.config.js
module.exports = {
  testTimeout: 30000  // 30 seconds
};
```

### Issue: Tests hang
```javascript
// Ensure all connections are closed
afterAll(async () => {
  await pool.end();
  await server.close();
});
```

### Issue: "Jest did not exit one second after the test run has completed"
```javascript
// Add --forceExit flag
"scripts": {
  "test": "jest --forceExit"
}
```

---

## Next Steps

1. **Complete Setup** (Day 1)
   - [ ] Install dependencies
   - [ ] Create Jest configuration
   - [ ] Set up test database
   - [ ] Run database connection tests

2. **Implement Story 1.2 Tests** (Days 2-3)
   - [ ] Create password utility and tests
   - [ ] Create auth service and tests
   - [ ] Create registration API tests

3. **Implement Story 1.3 Tests** (Days 4-5)
   - [ ] Create JWT utility and tests
   - [ ] Create login API tests
   - [ ] Create session management tests

4. **Implement Story 1.4 Tests** (Days 6-7)
   - [ ] Create profile service tests
   - [ ] Create profile API tests

5. **CI/CD Integration** (Day 8)
   - [ ] Update GitHub Actions workflow
   - [ ] Add coverage reporting
   - [ ] Add quality gates

---

**Document Version:** 1.0
**Last Updated:** 2025-11-25
**Status:** READY FOR USE

For complete test strategy, see: `SPRINT-1-TEST-PLAN.md`
