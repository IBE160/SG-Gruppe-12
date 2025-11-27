# Technical Debt Backlog

**Last Updated:** 2025-11-26 (P1 tests completed)
**Project:** AI CV & Job Application Assistant
**Sprint:** Sprint 1 - One Week Emergency Sprint

---

## Sprint 1 - Epic 1 Technical Debt

### P1 - Priority for Sprint 2
**Total Estimated Effort:** ~4-6 hours
**Impact:** Increases coverage from 70-75% to 85%+

#### 1. ✅ Auth Service Unit Tests (2-3 hours) - COMPLETED
**File created:** `src/tests/unit/auth.service.test.ts`

**Completed State:**
- ✅ 16 comprehensive unit tests implemented
- ✅ 100% coverage of `src/services/auth.service.ts`
- ✅ All dependencies mocked (email service, repositories, password util)
- ✅ Test cases implemented:
  - User registration logic (successful & error paths)
  - Email verification flow & token generation
  - Password hashing security
  - Error handling (hash errors, DB errors, email errors)
  - Data validation and sanitization
  - Consent handling (essential, AI training, marketing)

**Status:** ✅ COMPLETE (Nov 26, 2025)
**All tests passing:** 16/16

---

#### 2. ✅ Rate Limiting Integration Test (1 hour) - COMPLETED
**File created:** `src/tests/integration/rate-limiting.test.ts`

**Completed State:**
- ✅ 15 comprehensive integration tests implemented
- ✅ General limiter tested (100 requests/15min)
- ✅ Auth limiter tested (5 requests/15min for brute force protection)
- ✅ AI limiter tested (10 requests/15min for resource protection)
- ✅ Test coverage:
  - Rate limit enforcement (429 status on exceed)
  - Standard RFC 6585 headers (RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset)
  - Different window configurations
  - Concurrent request handling
  - Edge cases and client independence

**Status:** ✅ COMPLETE (Nov 26, 2025)
**All tests passing:** 15/15
**OWASP A07 Compliance:** ✅ Verified

---

#### 3. ✅ SQL Injection Security Test (30 min) - COMPLETED
**File created:** `src/tests/security/sql-injection.test.ts`

**Completed State:**
- ✅ 21 comprehensive security tests implemented
- ✅ Prisma ORM protection verified
- ✅ Test coverage:
  - Email lookup injection (OR-based, UNION, blind, stacked queries)
  - User ID lookup malicious input
  - Update/Create operations with malicious data
  - Prisma raw query protection verification
  - 8 common SQL injection patterns tested
  - NoSQL injection protection
  - Input validation layer documentation

**Test Results:**
- All malicious SQL payloads treated as literal strings
- No raw SQL execution vulnerabilities
- Parameterized queries confirmed throughout codebase

**Status:** ✅ COMPLETE (Nov 26, 2025)
**All tests passing:** 21/21
**OWASP A03 Compliance:** ✅ Verified and Documented

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
| Auth Service Unit Tests | P1 | 2-3h | ✅ **COMPLETE** | Vera | Sprint 1 (Nov 26) |
| Rate Limiting Test | P1 | 1h | ✅ **COMPLETE** | Vera | Sprint 1 (Nov 26) |
| SQL Injection Test | P1 | 30m | ✅ **COMPLETE** | Vera | Sprint 1 (Nov 26) |
| Performance Tests | P2 | 2h | Backlog | TBD | Sprint 2-3 |
| Validator Tests | P2 | 2h | Backlog | TBD | Sprint 2-3 |
| Repository Tests | P2 | 2h | Backlog | TBD | Sprint 2-3 |
| Middleware Tests | P2 | 1-2h | Backlog | TBD | Sprint 3 |
| Security Config Tests | P3 | 1h | Backlog | TBD | Sprint 3 |
| JWT Rotation Tests | P3 | 2-3h | Backlog | TBD | Sprint 3 |
| CI/CD Automation | P3 | 1h | Backlog | TBD | Day 6-7 |

---

**Total P1 Debt:** ✅ 0 hours (COMPLETE - Nov 26, 2025)
**Total P2 Debt:** ~6-8 hours
**Total P3 Debt:** ~3-5 hours
**Grand Total Remaining:** ~9-13 hours (1-1.5 sprints)

**P1 Achievement:**
- ✅ All 52 P1 tests implemented and passing
- ✅ Coverage increased from 70-75% to 85%+
- ✅ OWASP A03 (SQL Injection) compliance verified
- ✅ OWASP A07 (Rate Limiting) compliance verified
- ✅ 100% coverage on auth.service.ts
