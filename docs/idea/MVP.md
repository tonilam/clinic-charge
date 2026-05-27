# GP Clinic Charges Dashboard – MVP Specification

## Task Overview

Build a dockerized, full-stack application that displays and manages a dataset of General Practice (GP) clinic consultation charges using Server-Side Pagination in AG-Grid.

---

## Technical Stack

- **Backend:** Python 3.10+ - [FastAPI](Backend) 
- **Database:** [PostgreSQL](Database.md)
- **Frontend:** Angular using AG-Grid (Infinite Row Model) (see [[Frontend]])
- **DevOps:** Docker Compose

---

## Core Requirements

### 1. Database & Seed Data

**Table:** `clinic_charges`

**Fields:**
- `id`
- `medical_centre_name`
- `patient_visit_type`
- `charge_type`
- `amount`

**Seed Data:**
- Provide a script to seed the database with exactly 500 mockup rows
- Simulate a realistic medical directory dataset

---

### 2. Backend API & Pagination

Implement a Python backend API that handles AG-Grid's data requests efficiently.

**Paginated Endpoint:**
- Accept `startRow` and `endRow` parameters
- Use SQL `LIMIT` and `OFFSET` to return only the requested chunk of data
- Return the total row count

**Filtering:**
- Handle server-side filtering for `charge_type` (dropdown/exact match)
- Handle server-side filtering for `medical_centre_name` (text search/contains)

---

### 3. Grid Operations (Inline Editing & Creation)

**Inline Edit:**
- When a user edits a cell in AG-Grid, the frontend triggers a PATCH/PUT request
- Backend must persist this change to the database

**Create Row:**
- Implement an "Add New Charge" endpoint

**Data Refresh:**
- Upon successfully creating a new row, the frontend will trigger a simple grid refresh to reflect the new entry
- No complex WebSocket synchronization required

---

### 4. Dockerization

**Requirement:**
- The entire stack must run seamlessly via Docker
- Running `docker-compose up --build` or equivalent must spin up the backend, frontend, and database on local ports
- No local system dependencies required

---

## Evaluation Criteria

**Query Performance:**
- Does the backend correctly apply LIMIT, OFFSET, and WHERE clauses based on incoming frontend parameters?

**API Design:**
- Is the REST API logically structured with appropriate HTTP status codes and basic error handling?

**Docker Setup:**
- Is the multi-container configuration clean, isolated, and simple to spin up with a single command?
