# GP Clinic Charges Dashboard – MVP Timeline & Prioritization

## Overview

This timeline uses **T-shirt sizing** (XS, S, M, L, XL) for effort estimation. No actual hours are assigned—sizing is relative to complexity and effort.

**Key Principles:**
- ✅ Prioritized delivery: Core features first, polish later
- ✅ Parallel workstreams: Backend, frontend, database can progress independently
- ✅ MVP Focus: Only essential features; no advanced optimizations
- ✅ Testing integrated: Tests alongside features, not after

---

## T-Shirt Size Reference

| Size | Complexity | Dev Time (Reference) | Example |
|------|-----------|----------------------|---------|
| **XS** | Trivial, well-defined | 1-2 hours | Simple configuration, small fix |
| **S** | Simple, minimal unknowns | 2-4 hours | CRUD endpoint, form component |
| **M** | Moderate, some complexity | 4-8 hours | Complex component, feature integration |
| **L** | Complex, multiple parts | 8-16 hours | Full feature with testing |
| **XL** | Very complex, uncertain | 16+ hours | Major architectural work |

---

## Delivery Phases

### Phase 1: Foundation & Infrastructure 🔧
**Goal**: Set up project structure, database, and containerization
**Priority**: CRITICAL (blocks everything)
**Duration**: XS + S + S + M = **M (4-8 hours total)**

| Task | Size | Owner | Dependencies | Notes |
|------|------|-------|--------------|-------|
| **1.1** PostgreSQL schema design | S | Backend | None | Use [[Database.md]] schema, create init.sql |
| **1.2** Backend project structure (FastAPI) | S | Backend | None | app/, models.py, schemas.py, main.py |
| **1.3** Frontend project structure (Angular 20) | S | Frontend | None | Angular CLI, AG-Grid, Tailwind setup |
| **1.4** Docker setup (docker-compose.yml) | M | DevOps | 1.1, 1.2, 1.3 | Three containers: postgres, backend, frontend |
| **1.5** Environment variables & config | XS | DevOps | 1.4 | .env.local, connection strings |
| **1.6** Git repo & .gitignore | XS | DevOps | None | Exclude node_modules, __pycache__, .env |

**Acceptance Criteria:**
- ✅ `docker-compose up` spins up all three services without errors
- ✅ Services communicate internally (backend → postgres, frontend → backend)
- ✅ Health checks pass; containers are healthy
- ✅ PostgreSQL is accessible; schema tables exist

**Blockers**: None  
**Go/No-Go**: ✅ Must pass before Phase 2 starts

---

### Phase 2: Backend Core 🐍
**Goal**: Build REST API with pagination, filtering, and data persistence
**Priority**: CRITICAL
**Duration**: S + M + M + S + S + L = **L (10-16 hours total)**
**Depends On**: Phase 1 ✅

| Task | Size | Owner | Dependencies | Notes |
|------|------|-------|--------------|-------|
| **2.1** SQLAlchemy models & ORM setup | S | Backend | 1.1, 1.4 | Charge model, relationships, timestamps |
| **2.2** Pydantic schemas (request/response) | S | Backend | 2.1 | ChargeCreate, ChargeUpdate, ChargeResponse |
| **2.3** Database connection & async pool | S | Backend | 1.4, 2.1 | asyncpg, connection string from env |
| **2.4** GET /api/charges (paginated endpoint) | M | Backend | 2.1, 2.2, 2.3 | LIMIT/OFFSET, startRow/endRow params |
| **2.5** Filtering logic (charge_type, medical_centre_name) | M | Backend | 2.4 | WHERE clauses, query parameters |
| **2.6** Seed data generation (500 rows) | S | Backend | 2.1, 1.1 | Create init.sql or Python seed script |
| **2.7** POST /api/charges (create new charge) | S | Backend | 2.1, 2.2, 2.3 | Input validation, return 201, ID in response |
| **2.8** PATCH /api/charges/{id} (inline edit) | M | Backend | 2.1, 2.2, 2.3 | Partial updates, return 200/404 |
| **2.9** Error handling & HTTP status codes | M | Backend | 2.4-2.8 | 400, 404, 500 with meaningful messages |
| **2.10** Backend unit tests (pytest) | L | Backend | 2.1-2.9 | Service, schema, endpoint tests; 85%+ coverage |
| **2.11** Swagger/OpenAPI docs auto-generation | XS | Backend | 2.4-2.8 | `/docs` endpoint; verify with browser |

**Acceptance Criteria:**
- ✅ All endpoints working; test with curl or Postman
- ✅ Pagination works: request rows 0-10, then 10-20; data is different
- ✅ Filtering works: charge_type="Consultation" returns only that type
- ✅ Create endpoint returns new charge with ID
- ✅ Edit endpoint updates specific field, returns updated record
- ✅ 500 seed rows present in database
- ✅ 85%+ test coverage; all tests pass
- ✅ Swagger docs accessible at http://localhost:8000/docs

**Blockers**: 1.4 (Docker must work)  
**Go/No-Go**: ✅ Must pass before Phase 3 starts

---

### Phase 3: Frontend Core 🎨
**Goal**: Build Angular UI with AG-Grid, services, and components
**Priority**: CRITICAL
**Duration**: S + M + M + L + S + M = **L (12-16 hours total)**
**Depends On**: Phase 1 ✅, Phase 2 ✅

| Task | Size | Owner | Dependencies | Notes |
|------|------|-------|--------------|-------|
| **3.1** Angular project structure & modules | S | Frontend | 1.3 | HttpClientModule, FormsModule, routing |
| **3.2** API Service (HTTP client) | M | Frontend | 3.1, 2.4-2.8 | GET, POST, PATCH methods; handles pagination params |
| **3.3** Clinic Charge Service (state/business logic) | M | Frontend | 3.2 | Wraps API service, manages filter state |
| **3.4** Data models/interfaces (TypeScript) | S | Frontend | 3.2 | ClinicCharge, GridRequest, GridResponse |
| **3.5** AG-Grid setup & configuration | M | Frontend | 3.1, 3.4 | Server-side pagination, column definitions, theme |
| **3.6** Grid Component (display & editing) | L | Frontend | 3.2, 3.3, 3.5 | Render charges, cellValueChanged events, PATCH on edit |
| **3.7** Dashboard Page (container) | S | Frontend | 3.6 | Orchestrates grid + filter, layout, routing |
| **3.8** Grid refresh logic (after create/edit) | M | Frontend | 3.6, 3.7 | Clear cache, re-request first row |
| **3.9** Error handling & user feedback | M | Frontend | 3.2-3.8 | Toast notifications, disabled state on requests |
| **3.10** Frontend unit tests (Vitest) | L | Frontend | 3.2-3.9 | Service, component, event tests; 80%+ coverage |

**Acceptance Criteria:**
- ✅ Frontend loads at http://localhost:3000
- ✅ Grid displays 10 rows by default
- ✅ Pagination works: scroll down, more rows load
- ✅ Inline edit: click cell, change value, grid updates
- ✅ Filtering works: filter by charge_type, grid refreshes
- ✅ Create: "Add New Charge" button appears, opens form, POST succeeds, grid refreshes
- ✅ Error handling: failed requests show user-friendly messages
- ✅ 80%+ test coverage; all tests pass
- ✅ No console errors or warnings

**Blockers**: Phase 2 (API must be working)  
**Go/No-Go**: ✅ MVP is feature-complete at this point

---

### Phase 4: Polish & Refinement 🎯
**Goal**: Styling, error handling, edge cases, final testing
**Priority**: HIGH
**Duration**: M + M + M + S + S = **M (8-12 hours total)**
**Depends On**: Phase 3 ✅

| Task | Size | Owner | Dependencies | Notes |
|------|------|-------|--------------|-------|
| **4.1** Tailwind CSS styling | M | Frontend | 3.7 | Grid styling, form styling, responsive design |
| **4.2** AG-Grid theme & visual customization | M | Frontend | 3.5, 4.1 | Custom colors, font sizes, hover effects |
| **4.3** Loading states & spinners | S | Frontend | 3.2, 3.6 | Show spinner during API calls |
| **4.4** Input validation & constraints | M | Backend/Frontend | 2.2, 3.9 | Validate amount > 0, required fields |
| **4.5** API error response formatting | S | Backend | 2.9 | Consistent error JSON, helpful messages |
| **4.6** Edge case testing (empty results, boundaries) | M | Frontend/Backend | 2.10, 3.10 | No data available, pagination boundary |
| **4.7** Documentation (API, components, setup) | S | All | 2.11, 3.1 | Update README, code comments, Swagger |

**Acceptance Criteria:**
- ✅ UI looks professional; no broken layouts
- ✅ All interactions have visual feedback (loading, success, error)
- ✅ Edge cases handled: empty grid, 500+ rows, invalid input
- ✅ Documentation is complete and accurate

**Blockers**: Phase 3 (feature-complete app required)  
**Go/No-Go**: ✅ Nice-to-have; can skip if time-constrained

---

### Phase 5: Integration & Docker Validation 🐳
**Goal**: Full stack testing, Docker Compose verification, deployment readiness
**Priority**: CRITICAL
**Duration**: S + M + L + S = **M (8-12 hours total)**
**Depends On**: Phase 4 ✅ (or Phase 3 if skipping Phase 4)

| Task | Size | Owner | Dependencies | Notes |
|------|------|-------|--------------|-------|
| **5.1** Docker image builds without errors | S | DevOps | 1.4, 2.1-2.11, 3.1-3.10 | `docker-compose build` succeeds |
| **5.2** Full stack cold start test | M | DevOps | 5.1 | `docker-compose down -v && docker-compose up --build` |
| **5.3** Automated E2E tests with Playwright | L | Frontend/QA | 3.10, 2.11 | See [[E2E Testing.md]] for setup; 5+ critical workflows automated |
| **5.4** Manual end-to-end flow testing | M | QA | 5.2 | Load frontend → request data → paginate → filter → create → edit → verify in DB |
| **5.5** Performance check (responsiveness) | M | DevOps | 3.6, 2.4 | Pagination under 1s, grid renders 500 rows smoothly |
| **5.6** Cross-browser testing (Chrome, Firefox, Safari) | M | QA | 5.3 | E2E tests run on 3 browsers via Playwright; no layout issues |
| **5.7** Database persistence verification | S | QA | 1.4 | `docker-compose down` (no -v), restart, data still there |

**Acceptance Criteria:**
- ✅ `docker-compose up --build` starts all services without errors
- ✅ Services healthy, no failed health checks
- ✅ Frontend accessible at http://localhost:3000
- ✅ Backend accessible at http://localhost:8000/docs
- ✅ Full user journey works: load → paginate → filter → create → edit → verify
- ✅ 500 seed rows visible in grid
- ✅ Data persists across container restarts
- ✅ No performance issues; grid responsive
- ✅ **E2E tests automated**: 5+ critical workflows passing (see [[E2E Testing.md]])
  - Load dashboard and display grid
  - Paginate through results
  - Filter by charge type
  - Create new charge
  - Edit inline cell
- ✅ E2E tests run across Chrome, Firefox, WebKit (Playwright)
- ✅ E2E test reports generated; CI/CD integration ready

**Blockers**: Phase 4 or Phase 3 (depending on if polish skipped)  
**Go/No-Go**: ✅ MUST pass; this is MVP readiness

---

## Critical Path & Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Backend) — Phase 3 (Frontend) [can run in parallel]
    ↓                    ↓
Phase 4 (Polish) [optional, can skip]
    ↓
Phase 5 (Integration & Docker)
    ↓
🚀 MVP READY
```

**Parallel Work:**
- Phase 2 (Backend) and Phase 3 (Frontend) can progress simultaneously **after** Phase 1 completes
- Backend team focuses on API endpoints; frontend team builds UI components
- Integration testing happens in Phase 5

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Docker container won't start | BLOCKER | Phase 1 testing; validate docker-compose.yml early |
| Backend API contract changes | HIGH | Define schemas in Phase 2.2 early; frontend mocks API responses |
| AG-Grid server-side pagination misconfigured | HIGH | Test pagination logic in Phase 3.8 with real data; use AG-Grid docs |
| Database seeding incomplete (< 500 rows) | MEDIUM | Phase 2.6 validation; COUNT(*) query before Phase 3 starts |
| Styling doesn't work in Docker | MEDIUM | Phase 4.1 test in Docker container, not local dev |
| Performance issues with 500 rows | MEDIUM | Phase 5.4 load test; optimize if necessary |

---

## Quality Gates

| Gate | When | Owner | Pass Criteria |
|------|------|-------|---------------|
| **Phase 1 Complete** | After 1.6 | DevOps | Services healthy, internal comms work |
| **Phase 2 Complete** | After 2.11 | Backend | 85%+ test coverage, all endpoints working, 500 seed rows |
| **Phase 3 Complete** | After 3.10 | Frontend | 80%+ test coverage, UI functional, no console errors |
| **Phase 4 Complete** | After 4.7 | All | Styling done, docs complete |
| **Phase 5 Complete** | After 5.6 | QA | Full stack tested, ready to ship |

---

## Realistic Timeline Estimate

Using **team size of 2-3 developers** (1 backend, 1-2 frontend, 1 DevOps):

| Phase | Size | Duration | Start Week | End Week |
|-------|------|----------|-----------|----------|
| Phase 1 | M | 1 | Week 1 | Week 1 |
| Phase 2 | L | 1-2 | Week 1 | Week 2 |
| Phase 3 | L | 1-2 | Week 1 | Week 2 |
| Phase 4 | M | 1 | Week 3 | Week 3 |
| Phase 5 | M | 1 | Week 3 | Week 3 |
| **Total** | — | **4-5 weeks** | Week 1 | Week 3 |

**Notes:**
- Phases 2 & 3 run in parallel → total 4-5 weeks, not 8-10
- Phase 4 can be skipped for MVP v1.0 (ship with basic styling)
- Phase 5 is non-negotiable (Docker validation is critical)

---

## MVP v1.0 Scope (What's In)

✅ **Core Features:**
- Server-side pagination (LIMIT/OFFSET)
- Filtering by charge_type and medical_centre_name
- Inline cell editing (PATCH)
- Create new charge (POST)
- 500 seed data rows
- AG-Grid display
- Docker containerization

✅ **Quality:**
- 85%+ backend test coverage
- 80%+ frontend test coverage
- Full end-to-end workflows tested
- Error handling for API failures

---

## Post-MVP Backlog (v1.1, v2.0)

❌ **Not in Scope:**
- User authentication / login
- Row-level security (RLS) per clinic
- Advanced reporting / analytics
- WebSocket real-time sync
- Sorting (backend or frontend)
- Export to CSV/Excel
- Multi-language i18n
- Staging/production CI/CD pipelines
- Database backups & replication
- Performance tuning beyond basics

---

## Success Criteria (MVP Definition of Done)

1. ✅ All Phase 1-5 tasks completed
2. ✅ `docker-compose up --build` works on clean machine
3. ✅ Can load 500 clinic charges in grid
4. ✅ Can paginate, filter, create, and edit charges
5. ✅ All automated tests pass (85%+ coverage)
6. ✅ No console errors or warnings
7. ✅ Data persists; survives container restart
8. ✅ Documented in README and code comments

---

## Prioritization Rationale

**Why Phase 1 First:**
- Containerization is foundational; can't test anything without working Docker
- Blocks all downstream work

**Why Phase 2 & 3 in Parallel:**
- Independent workstreams; API and UI don't have hard dependencies until integration
- Maximizes parallelization; cuts timeline in half

**Why Phase 4 is Optional:**
- Polish (styling, error messages) doesn't affect MVP functionality
- Can ship with minimal Tailwind styling if time-constrained

**Why Phase 5 is Non-Negotiable:**
- Docker validation proves the MVP actually works in production environment
- Full stack testing finds integration bugs that unit tests miss

---

## Next Steps

1. ✅ Assign team members (Backend, Frontend, DevOps)
2. ✅ Start Phase 1 immediately
3. ✅ Once Phase 1 complete → launch Phase 2 & 3 in parallel
4. ✅ Track progress against quality gates
5. ✅ Daily sync to unblock issues early
6. ✅ Phase 5 is ship gate; must pass before v1.0 release

---

## Related Documentation

- [[MVP.md]] - Overall scope and requirements
- [[Backend.md]] - Backend architecture details
- [[Frontend.md]] - Frontend architecture details
- [[Database.md]] - Database design
- [[Docker.md]] - Docker configuration
- [[Backend Testing.md]] - Testing strategy
- [[Frontend Testing.md]] - Testing strategy
