# Docker Implementation – Local Development Environment

## Overview

The GP Clinic Charges Dashboard is a **three-tier, fully containerized** application for local development using Docker Compose. This document covers the local dev setup only; staging and production environments are out of scope.

**Architecture:**
- **Backend**: FastAPI service (Python 3.10+)
- **Frontend**: Angular 20 with Node.js 24.x
- **Database**: PostgreSQL 18 (Alpine)
- **Network**: Internal Docker network with service-to-service communication

---

## Prerequisites

### Local System Requirements
- **Docker Desktop** (or Docker Engine + Docker Compose v2+)
  - macOS/Windows: [Docker Desktop](https://www.docker.com/products/docker-desktop)
  - Linux: `apt-get install docker.io docker-compose` (or equivalent)
- **Git** (to clone the repo)
- **Text Editor/IDE** (for development)

### Supported Platforms
- ✅ macOS (Intel & Apple Silicon)
- ✅ Windows (with WSL 2)
- ✅ Linux (Ubuntu, Debian, etc.)

---

## Container Services

### 1. PostgreSQL Database
**Image**: `postgres:18-alpine`
**Port**: `5432` (exposed to localhost for development)
**Purpose**: Persistent data storage for clinic charges

- Pre-initialized with schema and 500 seed rows
- Health checks every 10 seconds
- Data persists via Docker volume (`postgres_data`)

### 2. FastAPI Backend
**Image**: Built from `./backend/Dockerfile`
**Port**: `8000` (exposed to localhost and frontend)
**Purpose**: REST API for CRUD operations, pagination, filtering

- Async Python application using Uvicorn
- Connects to PostgreSQL via asyncpg
- Auto-reload on file changes (for development)
- Environment-based configuration

### 3. Angular Frontend
**Image**: Built from `./frontend/Dockerfile`
**Port**: `3000` (exposed to localhost)
**Purpose**: Web UI for clinic charges dashboard

- Development server with hot reload
- Static file serving in production mode
- HTTP requests to backend via `http://backend:8000/api`

---

## Docker Compose Configuration

### File Structure
```
clinic-charge/
├── docker-compose.yml          # Main orchestration
├── .env.local                  # Local environment variables (git-ignored)
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── api/
│   │   │   └── charges.py
│   │   ├── services/
│   │   └── db/
│   │       ├── database.py
│   │       └── seed.py
│   └── .dockerignore
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── angular.json
    ├── src/
    └── .dockerignore
```

### docker-compose.yml (Local Dev)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:18-alpine
    container_name: clinic-charge-postgres
    environment:
      POSTGRES_USER: ${DB_USER:-clinic_admin}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secure_password_dev}
      POSTGRES_DB: ${DB_NAME:-clinic_charges_db}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/app/db/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-clinic_admin}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - clinic-network
    restart: unless-stopped

  # FastAPI Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: clinic-charge-backend
    environment:
      DATABASE_URL: postgresql+asyncpg://${DB_USER:-clinic_admin}:${DB_PASSWORD:-secure_password_dev}@postgres:5432/${DB_NAME:-clinic_charges_db}
      ENVIRONMENT: local
      DEBUG: "true"
      RELOAD: "true"
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend/app:/app/app
    networks:
      - clinic-network
    restart: unless-stopped
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Angular Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    container_name: clinic-charge-frontend
    environment:
      NODE_ENV: development
      API_BASE_URL: http://backend:8000/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/package.json:/app/package.json
      - ./frontend/angular.json:/app/angular.json
    networks:
      - clinic-network
    restart: unless-stopped
    command: npm start

volumes:
  postgres_data:
    driver: local

networks:
  clinic-network:
    driver: bridge
```

---

## Environment Variables

### .env.local (Local Development)
Create `.env.local` in the project root (excluded from git):

```env
# Database Configuration
DB_USER=clinic_admin
DB_PASSWORD=secure_password_dev
DB_NAME=clinic_charges_db
DB_HOST=postgres
DB_PORT=5432

# Backend Configuration
ENVIRONMENT=local
DEBUG=true
RELOAD=true

# Frontend Configuration
NODE_ENV=development
API_BASE_URL=http://backend:8000/api

# CORS Settings (Backend)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4200
```

**Note**: These are intentionally simple for local development. Change `DB_PASSWORD` if desired, but ensure consistency across `docker-compose.yml` and `.env.local`.

---

## Quick Start

### 1. Clone & Setup
```bash
git clone <repo-url>
cd clinic-charge

# Create local env file
cp .env.example .env.local  # or create manually as shown above
```

### 2. Build Images (First Time Only)
```bash
docker-compose build
```

### 3. Start Services
```bash
docker-compose up
```

**Expected Output:**
```
clinic-charge-postgres    | database system is ready to accept connections
clinic-charge-backend     | INFO:     Application startup complete
clinic-charge-frontend    | ✔ Compiled successfully
```

### 4. Access Services

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Angular UI |
| **Backend API** | http://localhost:8000 | FastAPI REST endpoints |
| **API Docs** | http://localhost:8000/docs | Swagger UI |
| **Database** | localhost:5432 | PostgreSQL (with client tools) |

### 5. Stop Services
```bash
docker-compose down
```

---

## Development Workflow

### Hot Reload
Both backend and frontend support live reloading:

**Backend (FastAPI):**
- Edit files in `./backend/app/`
- Changes auto-reload via `--reload` flag
- Uvicorn restarts automatically

**Frontend (Angular):**
- Edit files in `./frontend/src/`
- Changes auto-rebuild via `npm start`
- Browser hot-reloads via Angular CLI

### Database Access

#### Via Docker CLI
```bash
# Interactive PostgreSQL shell
docker-compose exec postgres psql -U clinic_admin -d clinic_charges_db
```

#### Via psql (Local Machine)
```bash
# Install psql locally, then:
psql -h localhost -U clinic_admin -d clinic_charges_db
```

#### Sample Queries
```sql
-- Check seed data
SELECT COUNT(*) FROM clinic_charges;  -- Should show 500

-- List medical centres
SELECT DISTINCT medical_centre_name FROM clinic_charges LIMIT 5;

-- Check charges by type
SELECT charge_type, COUNT(*) FROM clinic_charges GROUP BY charge_type;
```

### Viewing Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f backend
```

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `docker-compose up` | Start all services (attach logs) |
| `docker-compose up -d` | Start in background (detached) |
| `docker-compose down` | Stop and remove containers |
| `docker-compose down -v` | Stop and remove containers + volumes (clears DB) |
| `docker-compose build` | Build/rebuild images |
| `docker-compose build --no-cache` | Rebuild without cache (fresh install) |
| `docker-compose logs -f` | Follow logs from all services |
| `docker-compose exec backend bash` | Open shell in backend container |
| `docker-compose ps` | List running containers |
| `docker-compose restart backend` | Restart specific service |

---

## Troubleshooting

### Port Already in Use
If ports 3000, 5432, or 8000 are already in use:

```bash
# Option 1: Change port in docker-compose.yml
# Change "3000:3000" to "3001:3000"

# Option 2: Kill process using the port (macOS/Linux)
lsof -i :3000
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check if postgres service is healthy
docker-compose ps

# If unhealthy, check logs
docker-compose logs postgres

# Rebuild with fresh database
docker-compose down -v
docker-compose up --build
```

### Backend Won't Start
```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend image
docker-compose build --no-cache backend
docker-compose up backend
```

### Frontend Shows Blank Page
```bash
# Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
# Check frontend logs
docker-compose logs frontend

# If npm issues, rebuild frontend
docker-compose build --no-cache frontend
```

### Database Seed Data Missing
```bash
# Check if init.sql exists and is mounted
docker-compose exec postgres psql -U clinic_admin -d clinic_charges_db -c "SELECT COUNT(*) FROM clinic_charges;"

# If count is 0, re-seed:
docker-compose exec backend python app/db/seed.py
```

---

## Dockerfile Specifications

### Backend Dockerfile
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ app/

# Expose port
EXPOSE 8000

# Run with auto-reload for development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

**Base Image**: `python:3.10-slim` (minimal footprint, ~150MB)
**Port**: 8000
**Dependencies**: FastAPI, SQLAlchemy, asyncpg, Pydantic (from requirements.txt)

### Frontend Dockerfile
```dockerfile
# Development stage
FROM node:24-alpine as development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**Base Image**: `node:24-alpine` (lightweight, ~200MB)
**Port**: 3000
**Development**: Runs `ng serve` with auto-reload

---

## Network Architecture

### Service-to-Service Communication
Services communicate via Docker's internal network (`clinic-network`):

- **Frontend** → **Backend**: `http://backend:8000/api`
  - Uses container name as hostname
  - No external routing needed

- **Backend** → **Database**: `postgresql://postgres:5432/clinic_charges_db`
  - Connection string uses service name
  - Encrypted connection optional (not configured for local dev)

### Localhost Access (From Host Machine)
```
localhost:3000   → Frontend (Angular)
localhost:8000   → Backend (FastAPI)
localhost:5432   → Database (PostgreSQL)
```

---

## Data Persistence

### Database Volume
- **Volume Name**: `postgres_data`
- **Mount Point**: `/var/lib/postgresql/data`
- **Behavior**: Data persists across `docker-compose down` (unless `-v` flag used)

### Seed Data
- **Init Script**: `./backend/app/db/init.sql` (500 mockup rows)
- **Timing**: Runs automatically on first PostgreSQL startup
- **Idempotency**: Script should handle existing tables (re-running is safe)

### Clearing Data
```bash
# Remove volume and start fresh
docker-compose down -v
docker-compose up --build
```

---

## Performance Considerations (Local Dev)

### Resource Allocation
- **Backend**: ~250MB RAM
- **Frontend**: ~300MB RAM
- **PostgreSQL**: ~200MB RAM
- **Total**: ~750MB+ (adjust Docker Desktop memory allocation as needed)

### Optimization Tips
1. **Use named volumes** for data (faster than bind mounts on macOS/Windows)
2. **Exclude node_modules** from bind mount (use `.dockerignore`)
3. **Use Alpine base images** (smaller, faster startup)
4. **Limit logging** if debugging performance

### Docker Desktop Settings (macOS/Windows)
- **Memory**: Allocate 2GB+ (Docker Desktop preferences)
- **Disk**: 10GB+ free space
- **CPU**: 2+ cores

---

## Git Ignore

Add to `.gitignore`:
```gitignore
# Environment variables
.env.local
.env

# Docker volumes
postgres_data/

# Node modules (if using bind mount)
frontend/node_modules/

# Python cache
backend/__pycache__/
backend/*.pyc
backend/.venv/

# IDE
.vscode/
.idea/
*.swp
```

---

## Next Steps

1. ✅ Create `docker-compose.yml` in project root
2. ✅ Create `.env.local` with database credentials
3. ✅ Verify `backend/app/db/init.sql` exists (500 seed rows)
4. ✅ Test `docker-compose build`
5. ✅ Test `docker-compose up` and verify all services healthy
6. ✅ Access http://localhost:3000 and verify frontend loads
7. ✅ Test backend API at http://localhost:8000/docs
8. ✅ Verify database seeding: `SELECT COUNT(*) FROM clinic_charges;`

---

## Related Documentation

- [[Backend.md]] - FastAPI architecture and endpoints
- [[Frontend.md]] - Angular setup and AG-Grid configuration
- [[Database.md]] - PostgreSQL schema and RLS policies
- [[MVP.md]] - Overall project specification

---

## Notes

- **No External Dependencies**: Everything runs in Docker; no local Python/Node/PostgreSQL required
- **Single Command Startup**: `docker-compose up` spins up the entire stack
- **Development Focus**: All configurations prioritize developer experience (hot reload, detailed logs)
- **Local Only**: Staging/production environments will require separate Docker Compose files with different configurations
