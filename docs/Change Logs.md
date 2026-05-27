## 27-05-2026

- Added `docker-compose.yml` with three services (postgres, backend, frontend), shared network, postgres healthcheck, and named volume for persistence
- Added `.env.example` with database, backend, and CORS configuration

- Added Angular 21 frontend project structure: standalone components, AG Grid, Tailwind CSS, Vitest, Playwright E2E configured

- Added FastAPI backend project structure: `app/`, `main.py`, `models.py`, `schemas.py`, `config.py`, `api/charges.py`, `services/charge_service.py`, `db/database.py`

## 27-05-2026

- Added `backend/app/db/init.sql`: PostgreSQL schema for `clinic_charges` table with indexes on `charge_type`, `medical_centre_name`, `created_at`; `updated_at` auto-update trigger; 500-row seed block
