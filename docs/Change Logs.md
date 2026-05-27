## 27-05-2026

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

## 27-05-2026

- Added `backend/app/db/init.sql`: PostgreSQL schema for `clinic_charges` table with indexes on `charge_type`, `medical_centre_name`, `created_at`; `updated_at` auto-update trigger; 500-row seed block
