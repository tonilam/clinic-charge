# E2E Testing Strategy for GP Clinic Charges Dashboard

## Overview

End-to-end (E2E) testing validates the **complete user workflows** across the full stack: frontend UI → backend API → database. This document outlines an automated E2E testing strategy using **Playwright**, the modern gold standard for web automation.

---

## Why Playwright?

| Criterion | Playwright | Cypress | Selenium |
|-----------|-----------|---------|----------|
| **Multi-Browser** | ✅ Chromium, Firefox, WebKit | ⚠️ Chromium only | ✅ All browsers |
| **Speed** | ✅ Very fast (~100ms per action) | ⚠️ Slower (~500ms) | ❌ Slow (1-2s) |
| **AG-Grid Support** | ✅ Excellent (network waiting) | ✅ Good | ⚠️ Fragile |
| **Parallel Execution** | ✅ Built-in (sharding) | ❌ Limited | ❌ Complex |
| **Docker Integration** | ✅ Native | ⚠️ Possible | ✅ Yes |
| **CI/CD Integration** | ✅ Seamless | ✅ Good | ✅ Yes |
| **Debugging** | ✅ Trace, screenshots, videos | ✅✅ Best UI | ⚠️ Complex |
| **Learning Curve** | ✅ Easy (similar to Cypress) | ✅✅ Easiest | ❌ Steep |

**Decision: Playwright** ✅

---

## Setup & Installation

### Prerequisites
- Node.js 24.x (already available)
- npm 10.x+
- Running Docker containers (backend, frontend, postgres)

### Directory Structure
```
frontend/
├── e2e/
│   ├── tests/                   # Test specifications
│   │   ├── clinic-charges.spec.ts       
│   │   ├── pagination.spec.ts           
│   │   ├── filtering.spec.ts            
│   │   ├── editing.spec.ts              
│   │   └── create-charge.spec.ts        
│   ├── fixtures/                # Test setup/teardown
│   ├── utils/                   # Helper functions
│   ├── playwright.config.ts     
│   └── test-results/            # Generated reports
├── src/
├── package.json
└── angular.json
```

### Installation Steps
1. Install Playwright and dependencies
2. Initialize Playwright configuration
3. Create test directories as above
4. Set up global setup/teardown files for backend health checks

---

## Playwright Configuration

### Key Configuration Areas (playwright.config.ts)

**Core Settings:**
- Test directory: `./e2e/tests`
- Timeouts: 30s per test, 10s per action
- Parallel execution: 4 workers locally, 2 in CI
- Retries: 2 retries in CI, 0 locally

**Reporters:**
- HTML report for visualization
- JSON for programmatic access
- JUnit XML for CI integration

**Multi-browser Support:**
- Chromium, Firefox, WebKit

**Debugging Features:**
- Trace recording on first retry
- Screenshots on failure
- Video capture on failure

**Global Setup/Teardown:**
- Backend health check before tests
- Database connectivity verification
- Browser cleanup after tests

---

## Test Helpers & Utilities

### Helper Classes Structure

**GridHelper** - Abstracts AG-Grid interactions:
- Wait for grid to be ready (network idle)
- Extract visible row data
- Handle pagination scroll
- Perform inline cell edits
- Get/set cell values

**ApiHelper** - Direct API access for test setup/teardown:
- Create charges (seed test data)
- Update charges
- Delete charges (cleanup)
- Get charges (verification)

**Global Setup/Teardown**:
- Backend health check (poll until ready)
- Database connectivity verification
- Browser cleanup and resource management

---

## Test Examples (High-Level)

### Test Organization

**clinic-charges.spec.ts** - Happy path workflows:
- Load dashboard and verify grid appears
- Verify default pagination (10 rows)
- Scroll to load next page
- Filter by charge type
- Search by medical centre name
- Clear filters and verify all rows return

**editing.spec.ts** - Inline editing workflows:
- Edit cell value and verify UI update
- Verify change persists to database (via API)
- Show error on invalid input
- Verify cell reverts on error

**create-charge.spec.ts** - Create workflows:
- Open create form, fill fields
- Submit form and verify new row in grid
- Verify data persists in database
- Show validation error on missing fields
- Cancel form without saving

### General Test Pattern
```
Setup:
  1. Initialize GridHelper + ApiHelper
  2. Navigate to page
  3. Wait for grid ready

Test:
  1. Perform user action (click, type, filter)
  2. Wait for network idle
  3. Verify UI state
  4. Verify database state (optional, via API)

Cleanup:
  Implicit (each test independent)
```

---

## Running Tests

### Common Commands
- `npm run e2e` - Run all tests headless
- `npm run e2e -- --headed` - Run with browser visible
- `npm run e2e -- --debug` - Interactive debugger
- `npm run e2e -- --ui` - UI test runner
- `npx playwright show-report` - View HTML report

### npm Scripts to Add
- `e2e` - Run all tests
- `e2e:headed` - See browser during execution
- `e2e:debug` - Step-through debugger
- `e2e:ui` - Interactive test UI
- `e2e:chromium|firefox|webkit` - Test on specific browser
- `e2e:report` - View test results

---

## Docker Integration

### Docker Strategy: E2E Service in docker-compose.yml

**Approach**:
- Add `e2e` service to existing `docker-compose.yml`
- Service depends on: frontend, backend, postgres
- Built from official Playwright Docker image

**Configuration**:
- Environment variables: `BASE_URL`, `BACKEND_URL`, database credentials
- Volume mounts: test results, videos, reports
- Network: same as other services (clinic-network)
- Conditional execution: manual `docker-compose run` or automated `up`

**Key Points**:
- Runs after other services are healthy
- Isolated from CI/CD (no separate Dockerfile)
- Results persist in mounted volumes
- Simplifies deployment: single compose file

**Execution**:
- Manual: `docker-compose run --rm e2e npm run e2e`
- Or add to orchestration: `docker-compose up e2e`

---

## CI/CD Integration (GitHub Actions)

### GitHub Actions Workflow Structure

**Trigger**: Push to main/develop or pull requests

**Jobs**:
1. **Setup Services**
   - PostgreSQL service container
   - Node.js environment

2. **Install & Build**
   - Backend dependencies (pip)
   - Frontend dependencies (npm ci)
   - Build frontend for production
   - Install Playwright browsers

3. **Run Tests**
   - Start backend service
   - Run E2E tests with 2 workers
   - Set environment: `BASE_URL`, `BACKEND_URL`

4. **Artifacts**
   - HTML test report (retain 30 days)
   - Test videos on failure (retain 7 days)
   - JUnit XML for integration with other tools

**Key Points**:
- Use health checks for service readiness
- Run with 2 workers in CI (vs. 4 locally)
- Capture videos only on failure (save space)

---

## Test Execution Flow (Phase 5 Gate)

```
1. Global Setup (global-setup.ts)
   └─ Wait for backend health
   └─ Verify DB connectivity

2. Test Execution (parallel across 4 workers)
   ├─ clinic-charges.spec.ts (happy path)
   ├─ pagination.spec.ts (pagination workflows)
   ├─ filtering.spec.ts (filter scenarios)
   ├─ editing.spec.ts (inline editing)
   └─ create-charge.spec.ts (create workflows)

3. Generate Reports
   ├─ HTML report (e2e/test-results/html)
   ├─ JSON results (e2e/test-results/results.json)
   ├─ JUnit XML (e2e/test-results/junit.xml)
   └─ Screenshots/videos (on failure)

4. Cleanup (global-teardown.ts)
   └─ Close browsers, cleanup test data
```

---

## Best Practices

### ✅ DO

- **Test user workflows, not implementation** - Click, type, verify visible results
- **Use semantic locators** - `page.locator('button:has-text("Save")')`
- **Wait for network idle** - After pagination, filtering, creating
- **Isolate test data** - Use API helpers to seed/cleanup per test
- **Parallel execution** - Run tests across multiple workers
- **Capture traces & videos** - For debugging failures
- **Keep tests DRY** - Use helpers and fixtures
- **Run in CI before shipping** - Catch integration bugs early

### ❌ DON'T

- **Test third-party libraries** - Trust AG-Grid, Angular, Playwright
- **Use hard sleeps** - `await page.waitForTimeout(1000)` is brittle
- **Click by position** - Click by text or role; layout changes break tests
- **Share state between tests** - Each test should be independent
- **Skip E2E in CI** - E2E is the safety net before production

---

## Expected Execution Time

| Scenario | Tests | Duration |
|----------|-------|----------|
| Local (headed, single worker) | 20 | 5-10 min |
| Local (headless, 4 workers) | 20 | 2-3 min |
| CI (2 workers, retries) | 20 | 5-8 min |

---

## Troubleshooting

**Tests Timeout**
- Increase `timeout` in playwright.config.ts (default 30s)
- Use `test.setTimeout()` for specific tests
- Check if backend/database is slow

**AG-Grid Elements Not Found**
- Use GridHelper methods (handle ARIA roles properly)
- Explicitly wait for `[role="row"]` selectors
- Verify AG-Grid is fully rendered before interaction

**Network Requests Not Completing**
- Always call `page.waitForLoadState('networkidle')` after actions
- Important for server-side pagination
- Check backend response times

**Database State Issues**
- Use API helpers to cleanup test data in `beforeEach`/`afterEach`
- Each test should start with clean state
- Verify migrations are applied before running tests

---

## Coverage Goals

| Layer | Coverage | Examples |
|-------|----------|----------|
| **Happy Path** | 100% | Load → filter → paginate → create → edit |
| **Pagination** | 100% | First page, middle page, last page, boundary |
| **Filtering** | 100% | By type, by name, combined filters, clear |
| **Editing** | 100% | Edit cell, invalid input, revert, persist |
| **Error Paths** | 70% | API errors, validation failures |

---

## Roadmap (Post-MVP)

- [ ] Add visual regression testing (Percy, Playwright visual comparisons)
- [ ] Add performance testing (Lighthouse in E2E)
- [ ] Add accessibility testing (axe-core integration)
- [ ] Add load testing (large dataset pagination performance)
- [ ] Add mobile/responsive testing (different viewports)
- [ ] Add API contract testing (backend schema changes)

---

## Related Documentation

- [[MVP Timeline.md]] - Phase 5 includes E2E integration testing
- [[Frontend Testing.md]] - Unit test strategy (Vitest)
- [[Backend Testing.md]] - Unit test strategy (pytest)
- [[Docker.md]] - Container architecture for test execution

---

## Implementation Steps

1. Install Playwright and dependencies
2. Create `playwright.config.ts` with multi-browser setup
3. Create directory structure: `e2e/tests/`, `e2e/utils/`, `e2e/fixtures/`
4. Implement helper classes (GridHelper, ApiHelper)
5. Write test specs (clinic-charges, editing, create, etc.)
6. Test locally with `npm run e2e`
7. Integrate into CI/CD (GitHub Actions workflow)
8. Establish baseline: run all tests before first commit
