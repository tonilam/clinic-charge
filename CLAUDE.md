# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clinic Charge is a SaaS app for managing GP clinic consultation charges. It exposes a paginated, filterable, inline-editable data grid backed by a REST API and PostgreSQL.

## Development Commands

### Docker (recommended — runs all services together)

```bash
# Copy env and start all services (postgres + backend + frontend)
cp .env.example .env
docker compose up --build

# Stop and clean up
docker compose down -v
```

Services: frontend at http://localhost:3000, backend at http://localhost:8000, Postgres on 5432.

### Backend (standalone)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Run dev server (requires DATABASE_URL env var)
uvicorn app.main:app --reload --port 8000

# Run all tests with coverage
pytest

# Run a single test file
pytest tests/unit/test_charge_service.py

# Run a single test
pytest tests/unit/test_charge_service.py::TestChargeService::test_get_charges
```

Tests use SQLite in-memory (via `aiosqlite`) — no Postgres needed.

### Frontend (standalone)

```bash
cd frontend
npm install

# Dev server at http://localhost:3000 (proxies /api → http://backend:8000)
npm start

# Unit tests (Vitest, watch mode)
npm test

# Unit tests (single run)
npm run test:run

# Unit tests with coverage
npm run test:coverage

# E2E tests (requires running frontend + backend)
npm run e2e

# E2E headed (visible browser)
npm run e2e:headed
```

The Angular dev server proxies `/api/*` to `http://backend:8000` via `proxy.conf.json`. When running standalone, change the proxy target to `http://localhost:8000`.

## Architecture

### Backend (`backend/app/`)

FastAPI app with async SQLAlchemy (asyncpg driver for Postgres, aiosqlite for tests).

**Request flow:** `api/charges.py` (router) → `services/charge_service.py` (business logic) → `db/database.py` (async session) → `models.py` (SQLAlchemy ORM) → `schemas.py` (Pydantic validation/serialization)

- `config.py` — `Settings` (pydantic-settings), reads from `.env`. The `DATABASE_URL` uses the `postgresql+asyncpg://` scheme.
- `db/init.sql` — schema DDL + trigger for `updated_at` + seeds 500 rows on first start (mounted into the Postgres container).
- `db/seed.py` — standalone seed script (not used by Docker init).
- API endpoints: `GET /api/charges` (paginated via `startRow`/`endRow`, filterable by `charge_type` and `medical_centre_name`), `POST /api/charges`, `PATCH /api/charges/{id}`.
- `GET /health` — used by Docker healthcheck and Playwright global setup.

### Frontend (`frontend/src/app/`)

Angular 21 standalone components, no NgModules.

**Layered architecture:**
- `shared/models/` — TypeScript interfaces mirroring backend schemas.
- `core/services/api.service.ts` — raw HTTP calls (the only place that constructs URLs and params).
- `core/services/clinic-charge.service.ts` — stateful service using Angular `signal`s: holds `FilterState` and a `refreshTrigger` counter that `GridComponent` watches via `effect()`.
- `features/clinic-charges/components/grid/` — AG Grid with Infinite Row Model (virtual/lazy pagination via `IDatasource`). Inline cell editing fires `PATCH` on `cellValueChanged`.
- `features/clinic-charges/components/filter/` — filter bar, emits `filterApplied`/`filterCleared` events.
- `features/clinic-charges/pages/dashboard/` — orchestrates filter + grid + create-charge modal.

**Data flow for refresh:** `DashboardComponent.onFilterApplied()` → `ClinicChargeService.setFilters()` + `triggerRefresh()` → `GridComponent` effect fires → `gridApi.purgeInfiniteCache()` → AG Grid re-requests rows via datasource.

### E2E Tests (`frontend/e2e/`)

Playwright tests. `utils/global-setup.ts` polls `GET /health` (up to 60 s) before running. Tests run against `http://localhost:3000` by default (`BASE_URL` env override supported). Three spec files: `clinic-charges.spec.ts`, `create-charge.spec.ts`, `editing.spec.ts`.

### Database

Single table `clinic_charges` with columns: `id`, `medical_centre_name`, `patient_visit_type`, `charge_type`, `amount`, `created_at`, `updated_at`. Indexes on `charge_type`, `medical_centre_name`, `created_at`. Trigger keeps `updated_at` current on updates.
