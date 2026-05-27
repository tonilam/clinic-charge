# MVP Traceability Matrix

**Purpose**: Track completion of all MVP tasks against commits. Every task here maps to the [[MVP Timeline.md]] and will be checked off as completed.

**Target**: ✅ All items checked when MVP is complete and ready to ship.

---

## Phase 1: Foundation & Infrastructure 🔧

**Status**: ✅ Complete  
**Completion**: 6 / 6

| # | Task | Effort | Status | Commit Ref | Notes |
|---|------|--------|--------|-----------|-------|
| 1.1 | PostgreSQL schema design | S | ✅ | 636204f | Create init.sql with [[Database.md]] schema |
| 1.2 | Backend project structure (FastAPI) | S | ✅ | 7f4e6de | app/, models.py, schemas.py, main.py |
| 1.3 | Frontend project structure (Angular 20) | S | ✅ | 0412406 | Angular CLI, AG-Grid, Tailwind setup |
| 1.4 | Docker setup (docker-compose.yml) | M | ✅ | 3fc58b9 | Three containers: postgres, backend, frontend |
| 1.5 | Environment variables & config | XS | ✅ | 729d1e7 | .env.local, connection strings |
| 1.6 | Git repo & .gitignore | XS | ✅ | 8cb0f6d | Exclude node_modules, __pycache__, .env |

**Acceptance Criteria:**
- [x] `docker-compose up` spins up all three services without errors
- [x] Services communicate internally (backend → postgres, frontend → backend)
- [x] Health checks pass; containers are healthy
- [x] PostgreSQL is accessible; schema tables exist

**Go/No-Go**: Must pass before Phase 2 starts

---

## Phase 2: Backend Core 🐍

**Status**: 🟨 In Progress  
**Completion**: 0 / 11

| # | Task | Effort | Status | Commit Ref | Dependencies | Notes |
|---|------|--------|--------|-----------|--------------|-------|
| 2.1 | SQLAlchemy models & ORM setup | S | ✅ | 53f4f1c | 1.1, 1.4 | Charge model, relationships, timestamps |
| 2.2 | Pydantic schemas (request/response) | S | ✅ | 92998d1 | 2.1 | ChargeCreate, ChargeUpdate, ChargeResponse |
| 2.3 | Database connection & async pool | S | ✅ | c2ac015 | 1.4, 2.1 | asyncpg, connection string from env |
| 2.4 | GET /api/charges (paginated endpoint) | M | ✅ | ec7b66e | 2.1, 2.2, 2.3 | LIMIT/OFFSET, startRow/endRow params |
| 2.5 | Filtering logic (charge_type, medical_centre_name) | M | ✅ | ec7b66e | 2.4 | WHERE clauses, query parameters |
| 2.6 | Seed data generation (500 rows) | S | ✅ | ec7b66e | 2.1, 1.1 | Create init.sql or Python seed script |
| 2.7 | POST /api/charges (create new charge) | S | ✅ | ec7b66e | 2.1, 2.2, 2.3 | Input validation, return 201, ID in response |
| 2.8 | PATCH /api/charges/{id} (inline edit) | M | ✅ | ec7b66e | 2.1, 2.2, 2.3 | Partial updates, return 200/404 |
| 2.9 | Error handling & HTTP status codes | M | ✅ | ec7b66e | 2.4-2.8 | 400, 404, 500 with meaningful messages |
| 2.10 | Backend unit tests (pytest) | L | ⬜ | | 2.1-2.9 | Service, schema, endpoint tests; 85%+ coverage |
| 2.11 | Swagger/OpenAPI docs auto-generation | XS | ⬜ | | 2.4-2.8 | `/docs` endpoint; verify with browser |

**Acceptance Criteria:**
- [ ] All endpoints working; test with curl or Postman
- [ ] Pagination works: request rows 0-10, then 10-20; data is different
- [ ] Filtering works: charge_type="Consultation" returns only that type
- [ ] Create endpoint returns new charge with ID
- [ ] Edit endpoint updates specific field, returns updated record
- [ ] 500 seed rows present in database
- [ ] 85%+ test coverage; all tests pass
- [ ] Swagger docs accessible at http://localhost:8000/docs

**Go/No-Go**: Must pass before Phase 3 starts

---

## Phase 3: Frontend Core 🎨

**Status**: ⏳ Waiting on Phase 1 & 2  
**Completion**: 0 / 10

| # | Task | Effort | Status | Commit Ref | Dependencies | Notes |
|---|------|--------|--------|-----------|--------------|-------|
| 3.1 | Angular project structure & modules | S | ⬜ | | 1.3 | HttpClientModule, FormsModule, routing |
| 3.2 | API Service (HTTP client) | M | ⬜ | | 3.1, 2.4-2.8 | GET, POST, PATCH methods; handles pagination params |
| 3.3 | Clinic Charge Service (state/business logic) | M | ⬜ | | 3.2 | Wraps API service, manages filter state |
| 3.4 | Data models/interfaces (TypeScript) | S | ⬜ | | 3.2 | ClinicCharge, GridRequest, GridResponse |
| 3.5 | AG-Grid setup & configuration | M | ⬜ | | 3.1, 3.4 | Server-side pagination, column definitions, theme |
| 3.6 | Grid Component (display & editing) | L | ⬜ | | 3.2, 3.3, 3.5 | Render charges, cellValueChanged events, PATCH on edit |
| 3.7 | Dashboard Page (container) | S | ⬜ | | 3.6 | Orchestrates grid + filter, layout, routing |
| 3.8 | Grid refresh logic (after create/edit) | M | ⬜ | | 3.6, 3.7 | Clear cache, re-request first row |
| 3.9 | Error handling & user feedback | M | ⬜ | | 3.2-3.8 | Toast notifications, disabled state on requests |
| 3.10 | Frontend unit tests (Vitest) | L | ⬜ | | 3.2-3.9 | Service, component, event tests; 80%+ coverage |

**Acceptance Criteria:**
- [ ] Frontend loads at http://localhost:3000
- [ ] Grid displays 10 rows by default
- [ ] Pagination works: scroll down, more rows load
- [ ] Inline edit: click cell, change value, grid updates
- [ ] Filtering works: filter by charge_type, grid refreshes
- [ ] Create: "Add New Charge" button appears, opens form, POST succeeds, grid refreshes
- [ ] Error handling: failed requests show user-friendly messages
- [ ] 80%+ test coverage; all tests pass
- [ ] No console errors or warnings

**Go/No-Go**: MVP is feature-complete at this point

---

## Phase 4: Polish & Refinement 🎯

**Status**: ⏳ Waiting on Phase 3  
**Completion**: 0 / 7
**Priority**: HIGH (can skip if time-constrained)

| # | Task | Effort | Status | Commit Ref | Dependencies | Notes |
|---|------|--------|--------|-----------|--------------|-------|
| 4.1 | Tailwind CSS styling | M | ⬜ | | 3.7 | Grid styling, form styling, responsive design |
| 4.2 | AG-Grid theme & visual customization | M | ⬜ | | 3.5, 4.1 | Custom colors, font sizes, hover effects |
| 4.3 | Loading states & spinners | S | ⬜ | | 3.2, 3.6 | Show spinner during API calls |
| 4.4 | Input validation & constraints | M | ⬜ | | 2.2, 3.9 | Validate amount > 0, required fields |
| 4.5 | API error response formatting | S | ⬜ | | 2.9 | Consistent error JSON, helpful messages |
| 4.6 | Edge case testing (empty results, boundaries) | M | ⬜ | | 2.10, 3.10 | No data available, pagination boundary |
| 4.7 | Documentation (API, components, setup) | S | ⬜ | | 2.11, 3.1 | Update README, code comments, Swagger |

**Acceptance Criteria:**
- [ ] UI looks professional; no broken layouts
- [ ] All interactions have visual feedback (loading, success, error)
- [ ] Edge cases handled: empty grid, 500+ rows, invalid input
- [ ] Documentation is complete and accurate

**Note**: Can be deferred for MVP v1.0 if time-constrained

---

## Phase 5: Integration & Docker Validation 🐳

**Status**: ⏳ Waiting on Phase 3 or 4  
**Completion**: 0 / 7
**Priority**: CRITICAL - Ship Gate

| # | Task | Effort | Status | Commit Ref | Dependencies | Notes |
|---|------|--------|--------|-----------|--------------|-------|
| 5.1 | Docker image builds without errors | S | ⬜ | | 1.4, 2.1-2.11, 3.1-3.10 | `docker-compose build` succeeds |
| 5.2 | Full stack cold start test | M | ⬜ | | 5.1 | `docker-compose down -v && docker-compose up --build` |
| 5.3 | Automated E2E tests with Playwright | L | ⬜ | | 3.10, 2.11 | See [[E2E Testing.md]]; 5+ critical workflows automated |
| 5.4 | Manual end-to-end flow testing | M | ⬜ | | 5.2 | Load frontend → request data → paginate → filter → create → edit → verify in DB |
| 5.5 | Performance check (responsiveness) | M | ⬜ | | 3.6, 2.4 | Pagination under 1s, grid renders 500 rows smoothly |
| 5.6 | Cross-browser testing (Chrome, Firefox, Safari) | M | ⬜ | | 5.3 | E2E tests run on 3 browsers via Playwright; no layout issues |
| 5.7 | Database persistence verification | S | ⬜ | | 1.4 | `docker-compose down` (no -v), restart, data still there |

**Acceptance Criteria:**
- [ ] `docker-compose up --build` starts all services without errors
- [ ] Services healthy, no failed health checks
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend accessible at http://localhost:8000/docs
- [ ] Full user journey works: load → paginate → filter → create → edit → verify
- [ ] 500 seed rows visible in grid
- [ ] Data persists across container restarts
- [ ] No performance issues; grid responsive
- [ ] E2E tests automated: 5+ critical workflows passing
  - [ ] Load dashboard and display grid
  - [ ] Paginate through results
  - [ ] Filter by charge type
  - [ ] Create new charge
  - [ ] Edit inline cell
- [ ] E2E tests run across Chrome, Firefox, WebKit (Playwright)
- [ ] E2E test reports generated; CI/CD integration ready

**Go/No-Go**: MUST pass; this is MVP readiness

---

## Summary Dashboard

### Overall Progress

| Phase | Total Tasks | Completed | % Done | Blocker Status |
|-------|------------|-----------|--------|---|
| Phase 1 | 6 | 6 | 100% | ✅ Complete |
| Phase 2 | 11 | 0 | 0% | 🔴 Waiting on Phase 1 |
| Phase 3 | 10 | 0 | 0% | 🔴 Waiting on Phase 1 & 2 |
| Phase 4 | 7 | 0 | 0% | 🔴 Optional / Waiting on Phase 3 |
| Phase 5 | 7 | 0 | 0% | 🔴 Waiting on Phase 3+ |
| **TOTAL** | **41** | **0** | **0%** | — |

### Critical Path

```
Phase 1 ✅ → Phase 2 & 3 (parallel) ✅ → Phase 4 (optional) ✅ → Phase 5 ✅ → 🚀 MVP READY
```

---

## How to Use This Document

1. **Starting a new task**: Move it from ⬜ to 🟨 (in-progress)
2. **Completing a task**: Mark as ✅ and reference the commit hash in "Commit Ref" column
3. **Blocking issues**: Update task status to 🔴 and add notes
4. **Syncing with commits**: Add commit hash after "Commit Ref" when you complete a task
5. **Acceptance criteria**: Check off criteria as validated

### Status Legend

- ⬜ Not Started
- 🟨 In Progress
- ✅ Completed
- 🔴 Blocked
- ⏳ Waiting on Dependencies

---

## Risk & Mitigation Tracking

| Risk | Impact | Status | Mitigation | Owner |
|------|--------|--------|-----------|-------|
| Docker container won't start | BLOCKER | ⏳ | Test in Phase 1; validate docker-compose.yml early | DevOps |
| Backend API contract changes | HIGH | ⏳ | Define schemas in Phase 2.2 early; frontend mocks | Backend |
| AG-Grid server-side pagination misconfigured | HIGH | ⏳ | Test in Phase 3.8 with real data; use AG-Grid docs | Frontend |
| Database seeding incomplete (< 500 rows) | MEDIUM | ⏳ | Phase 2.6 validation; COUNT(*) query before Phase 3 | Backend |
| Styling doesn't work in Docker | MEDIUM | ⏳ | Phase 4.1 test in Docker container, not local dev | Frontend |
| Performance issues with 500 rows | MEDIUM | ⏳ | Phase 5.4 load test; optimize if necessary | QA |

---

## Related Documentation

- [[MVP.md]] - Overall scope and requirements
- [[MVP Timeline.md]] - Detailed timeline, effort estimates, phases
- [[Backend.md]] - Backend architecture details
- [[Frontend.md]] - Frontend architecture details
- [[Database.md]] - Database design
- [[Docker.md]] - Docker configuration
- [[Backend Testing.md]] - Testing strategy
- [[Frontend Testing.md]] - Testing strategy
- [[E2E Testing.md]] - End-to-end testing setup
