## 28-05-2026

- Cleanup: removed unused `frontend/src/app/app.css` and `frontend/e2e/utils/api-helper.ts`; removed tracked Playwright report artifacts under `frontend/e2e/test-results/`
- Test code cleanup: removed redundant self-explanatory comments in `frontend/e2e/tests/editing.spec.ts` and `backend/tests/unit/test_schemas.py`

- Frontend UX: added global toast notifications via new `ToastService` and standalone `ToastComponent`; dashboard now renders `<app-toast />` for centralized success/error/info feedback
- Grid inline editing: replaced `errorMessage` UI with toast errors for load/update failures; failed updates now revert safely with guarded `isReverting` flow to prevent recursive cell-change handling
- Charge type consistency: introduced `ChargeType` model typing from `CHARGE_TYPES`; updated `ClinicCharge`, `ChargeCreate`, and `ChargeUpdate` to use typed charge values
- Create modal form state: added `ChargeFormState` with optional empty `charge_type` for form initialization, while preserving strict `ChargeCreate` payload typing on submit
- Grid data validation: `amount` column now uses a `valueSetter` with `hasAtMostTwoDecimalPlaces()` validation and toast feedback; `charge_type` column now uses AG Grid select editor values from `CHARGE_TYPES`
- Frontend tests updated to align with typed charge values, new toast dependency, and refined grid/edit behavior across service, modal, and grid specs

- AG Grid v33 Theming API: dropped legacy `ag-grid.css` / `ag-theme-quartz.css` from `angular.json` and `ag-theme-quartz` wrapper class; grid binds `themeQuartz` via `[theme]` (resolves console error #239 mixed-theming warning)
- AG Grid header tooltips: `enableBrowserTooltips` and `tooltipShowDelay` on grid so drag-to-reorder hint shows on column header hover; unit test asserts `themeQuartz` binding

- E2E tests aligned with 20-row default page size: `clinic-charges.spec.ts` expects 20 visible rows on load and after clearing filters (was 10)
- E2E create flow: `create-charge.spec.ts` scopes form fills to `app-create-charge-modal` so grid inputs are not targeted
- AG Grid column reorder UX: registered `TooltipModule` and `_ColumnMoveModule`; `defaultColDef.headerTooltip` hints drag-to-reorder; unit test added in `grid.component.spec.ts`
- `.gitignore`: exclude Playwright HTML report artifacts under `frontend/e2e/test-results/html/data/` and `trace/`
- E2E suite re-run: 36 tests passing across Chromium, Firefox, WebKit; junit/results/html report updated

- AG Grid: registered `TextEditorModule` and `NumberEditorModule` so inline cell editing works (fixes error #200 in unit tests); Vitest coverage excludes `**/*.html`; Angular CLI analytics disabled

- Create charge modal: charge type field uses `CHARGE_TYPES` dropdown instead of free text; E2E create flow updated for select

- Create charge modal: reject amounts with more than 2 decimal places via `hasAtMostTwoDecimalPlaces()` helper; unit test added

- AG Grid theme: moved `ag-grid.css` and `ag-theme-quartz.css` from `styles.css` `@import` into `angular.json` `styles` array so the quartz theme loads correctly; default grid page size increased from 10 to 20

- Frontend refactor per implement skill (MVC + DRY): moved inline templates to `.html` for dashboard, grid, filter, app root, and new create-charge modal
- Extracted `CreateChargeModalComponent`; dashboard now orchestrates filter, grid, and modal only
- Added `.claude/skills/implement/` skill with MVC and DRY rules; updated `docs/idea/Frontend.md`
- Shared `EMPTY_FILTER_STATE`, `createEmptyCharge()`, `CHARGE_TYPES`, form CSS class constants, and `shared/testing/clinic-charge.testing.ts` fixtures
- `ClinicChargeService`: added `applyFilters()` and `clearFilters()` to consolidate filter + refresh logic
- Frontend unit tests: 47 passed (create-charge modal spec added; dashboard/grid specs use shared mocks)

## 27-05-2026

- Database persistence verified: `docker compose down` (no -v) → `docker compose up --build` → 525 records intact; named volume `postgres_data` survives container restarts

- Cross-browser E2E: 36 tests passing across Chromium (12), Firefox (12), WebKit (12); no layout issues observed

- Performance check: pagination API ~12ms, 500-row fetch ~43ms; Chromium E2E suite 12 tests in 3.6s — all under 1s per-test target; grid renders 524 rows smoothly via AG Grid InfiniteRowModel

- Manual E2E flow verified: load (523 rows, 10/page) → paginate (page 2 IDs differ) → filter (Consultation-only) → create (POST returns new ID) → edit (PATCH updates amount) → DB state confirmed via PATCH response

- E2E test suite: 36 tests passing across Chromium, Firefox, WebKit (Playwright)
  - `clinic-charges.spec.ts`: load, 10-row default, pagination, filter by charge type, clear filters, Add New Charge button
  - `editing.spec.ts`: PATCH amount and charge_type via API, verify grid reflects update after reload
  - `create-charge.spec.ts`: open modal, cancel, validation error, full create flow
  - `e2e/utils/grid-helper.ts`: `GridHelper` utility with `waitForGridReady`, `getCellValue`, `getFirstVisibleCellValue`, `editCell` methods
  - Inline editing tests use direct HTTP PATCH + reload (headless AG Grid focus limitation workaround)
  - Filter test uses Playwright auto-retrying `expect(locator).toContainText()` with 8s timeout

- Fixed `docker-compose.yml`: volume path updated to `/var/lib/postgresql` for postgres:18-alpine; host port changed to 5434; removed obsolete `version` attribute
- Docker cold-start verified: all 3 services healthy, `/health` returns OK, 500 seed rows confirmed

- Verified Tailwind CSS applied throughout dashboard, grid, filter, and modal; `ag-theme-quartz` applied to grid
- Verified loading spinner signal in `grid.component.ts`; form validation (`amount > 0`, required fields) in both Pydantic schemas and Angular dashboard
- Verified consistent `{"detail": "..."}` error JSON from backend; edge case tests for empty results and pagination boundaries in backend integration tests
- Added `CLAUDE.md` with project commands, architecture, and development guide

- Added `frontend/src/app/features/clinic-charges/components/grid/grid.component.spec.ts` and `pages/dashboard/dashboard.component.spec.ts`; frontend tests: 42 passed, 91.88% coverage
- Installed `@vitest/coverage-v8` devDependency for frontend coverage reporting

- Updated `backend/requirements.txt` to Python 3.14-compatible versions (pydantic 2.13.4, fastapi 0.136.3); added `greenlet` dependency for SQLAlchemy async
- Added `backend/.coveragerc` to exclude `seed.py` from coverage reporting; backend tests: 45 passed, 97% coverage

- Added `backend/app/api/charges.py`: GET `/api/charges` with `startRow`/`endRow` pagination params
- Added `backend/app/services/charge_service.py`: filtering by `charge_type` (exact) and `medical_centre_name` (ilike)
- Added POST `/api/charges` returning 201 with created record
- Added PATCH `/api/charges/{id}` returning updated record or 404
- Added global 500 exception handler in `main.py`; 404 raised in charges router

- Added `backend/app/models.py`: SQLAlchemy `ClinicCharge` ORM model with all fields and auto-timestamps
- Added `backend/app/schemas.py`: Pydantic schemas `ChargeCreate`, `ChargeUpdate`, `ChargeResponse`, `ChargesListResponse` with amount validation
- Added `backend/app/db/database.py`: async SQLAlchemy engine, session factory, and `get_db` FastAPI dependency

- Updated `.gitignore` to exclude node_modules, __pycache__, .env, .venv, dist, .angular cache, and IDE files

- Added `docker-compose.yml` with three services (postgres, backend, frontend), shared network, postgres healthcheck, and named volume for persistence
- Added `.env.example` with database, backend, and CORS configuration

- Added Angular 21 frontend project structure: standalone components, AG Grid, Tailwind CSS, Vitest, Playwright E2E configured

- Added FastAPI backend project structure: `app/`, `main.py`, `models.py`, `schemas.py`, `config.py`, `api/charges.py`, `services/charge_service.py`, `db/database.py`

- Added `backend/app/db/init.sql`: PostgreSQL schema for `clinic_charges` table with indexes on `charge_type`, `medical_centre_name`, `created_at`; `updated_at` auto-update trigger; 500-row seed block
