## 27-05-2026

- Added `backend/app/db/init.sql`: PostgreSQL schema for `clinic_charges` table with indexes on `charge_type`, `medical_centre_name`, `created_at`; `updated_at` auto-update trigger; 500-row seed block
