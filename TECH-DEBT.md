# Technical Debt Backlog

**Last Updated:** 2025-11-26
**Project:** AI CV & Job Application Assistant
**Sprint:** Sprint 1 - One Week Emergency Sprint

---

## Sprint 1 - Epic 1 Technical Debt

### P1 - Priority for Sprint 2
**Total Estimated Effort:** ~4-6 hours
**Impact:** Increases coverage from 70-75% to 85%+

#### 1. Auth Service Unit Tests (2-3 hours)
**File to create:** `src/tests/unit/auth.service.test.ts`

**Current State:**
- Auth service tested only via integration tests
- Cannot verify business logic in isolation
- No mocking of dependencies (email service, repositories)

**Target:**
- 90%+ coverage of `src/services/auth.service.ts`
- Mocked dependencies for fast unit testing
- Test cases for:
  - User registration logic
  - Email verification flow
  - Password validation integration
  - Error handling paths

**Priority:** HIGH
**Blockers:** None
**Dependencies:** jest-mock-extended (already installed)

---

#### 2. Rate Limiting Integration Test (1 hour)
**File to create:** `src/tests/integration/rate-limiting.test.ts`

**Current State:**
- Rate limiting middleware exists (`src/middleware/rate-limit.middleware.ts`)
- Configuration verified to exist
- NOT tested: Actual rate limiting behavior

**Target:**
- Verify 5 failed login attempts blocks user for 15 minutes
- Verify `Retry-After` header is set correctly
- Verify rate limit resets after timeout
- Verify successful login resets counter

**Test Scenario:**
```javascript
// Attempt 6 failed logins
for (let i = 0; i < 6; i++) {
  await request(app).post('/api/v1/auth/login')
    .send({ email: 'test@example.com', password: 'Wrong!' });
}

// 6th attempt should be 429 Too Many Requests
// Header: Retry-After: 900 (15 minutes in seconds)
```

**Priority:** HIGH (OWASP A07 compliance)
**Blockers:** None

---

#### 3. SQL Injection Explicit Test (30 min)
**File to create:** `src/tests/security/injection.test.ts`

**Current State:**
- Using Prisma ORM (prevents SQL injection by design)
- No explicit validation that malicious input is blocked

**Target:**
- Attempt SQL injection via email field: `' OR '1'='1`
- Attempt SQL injection via password field
- Verify Prisma parameterizes queries
- Document OWASP A03 compliance

**Test Scenario:**
```javascript
const maliciousEmail = "admin@example.com' OR '1'='1";
const response = await request(app)
  .post('/api/v1/auth/login')
  .send({ email: maliciousEmail, password: 'test' });

// Should NOT bypass authentication
expect(response.status).toBe(401);
```

**Priority:** HIGH (OWASP A03 compliance documentation)
**Blockers:** None

---

### P2 - Sprint 2 or 3 (Nice to Have)
**Total Estimated Effort:** ~6-8 hours

#### 4. Performance Baseline Tests (2 hours)
**File to create:** `src/tests/performance/api.performance.test.ts`

**Target:**
- Registration endpoint: < 500ms
- Login endpoint: < 500ms
- Profile endpoint: < 100ms
- Measure under load (10 concurrent requests)

**Priority:** MEDIUM
**Defer to:** Sprint 2

---

#### 5. Validator Unit Tests (2 hours)
**Files to create:**
- `src/tests/unit/auth.validator.test.ts`
- `src/tests/unit/user.validator.test.ts`

**Target:** 90%+ coverage of Zod validation schemas

**Priority:** MEDIUM
**Defer to:** Sprint 2

---

#### 6. Repository Unit Tests (2 hours)
**File to create:** `src/tests/unit/user.repository.test.ts`

**Target:** 90%+ coverage of database layer with mocked Prisma

**Priority:** MEDIUM
**Defer to:** Sprint 2

---

#### 7. Auth Middleware Unit Tests (1-2 hours)
**File to create:** `src/tests/unit/auth.middleware.test.ts`

**Target:** Isolated middleware testing

**Priority:** LOW
**Defer to:** Sprint 3

---

### P3 - Future Improvements
**Total Estimated Effort:** ~3-5 hours

#### 8. OWASP Security Misconfiguration Tests (A05) (1 hour)
- Test security headers (CSP, X-Frame-Options)
- Test error handling (no stack traces in production)
- Test HTTPS enforcement

**Priority:** LOW
**Defer to:** Sprint 3

---

#### 9. JWT Token Revocation/Rotation Tests (2-3 hours)
- Test token blacklist functionality
- Test replay attack prevention
- Test refresh token rotation

**Priority:** LOW
**Defer to:** Sprint 3 (feature not MVP-critical)

---

#### 10. CI/CD Automated Test Execution (1 hour)
- Update `.github/workflows/ci.yml`
- Add test execution to pipeline
- Add coverage reporting
- Add quality gate (85% threshold)

**Priority:** LOW
**Defer to:** Day 6-7 of current sprint

---

## Sprint 1 - Epic 2 Technical Debt
(To be added during Epic 2 implementation)

---

## How to Address Tech Debt

### Sprint 2 Planning:
1. Allocate 1 day (8 hours) for P1 debt
2. Implement items 1-3 above
3. Achieve 85%+ coverage target
4. Document P2 debt for future sprints

### If Time Permits in Current Sprint:
- Day 6 or 7: Implement P1 items if Epic 2 + testing complete early
- Otherwise: Defer to Sprint 2 as planned

---

## Tracking

| Item | Priority | Effort | Status | Assigned | Target Sprint |
|------|----------|--------|--------|----------|---------------|
| Auth Service Unit Tests | P1 | 2-3h | Backlog | TBD | Sprint 2 |
| Rate Limiting Test | P1 | 1h | Backlog | TBD | Sprint 2 |
| SQL Injection Test | P1 | 30m | Backlog | TBD | Sprint 2 |
| Performance Tests | P2 | 2h | Backlog | TBD | Sprint 2-3 |
| Validator Tests | P2 | 2h | Backlog | TBD | Sprint 2-3 |
| Repository Tests | P2 | 2h | Backlog | TBD | Sprint 2-3 |
| Middleware Tests | P2 | 1-2h | Backlog | TBD | Sprint 3 |
| Security Config Tests | P3 | 1h | Backlog | TBD | Sprint 3 |
| JWT Rotation Tests | P3 | 2-3h | Backlog | TBD | Sprint 3 |
| CI/CD Automation | P3 | 1h | Backlog | TBD | Day 6-7 |

---

**Total P1 Debt:** ~4-6 hours
**Total P2 Debt:** ~6-8 hours
**Total P3 Debt:** ~3-5 hours
**Grand Total:** ~13-19 hours (1.5-2.5 sprints)

**Decision:** Accept P1 debt for MVP, address in Sprint 2.
