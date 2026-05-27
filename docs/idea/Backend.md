# Backend Architecture Analysis & Framework Selection

## Decision Framework

### MVP Requirements Analysis
Based on [[MVP.md]], our key requirements are:

1. **Server-Side Pagination** with AG-Grid (LIMIT/OFFSET pattern)
2. **REST API Endpoints** for CRUD operations
3. **Database**: PostgreSQL with 500 seed rows
4. **Filtering**: charge_type (exact match), medical_centre_name (text search)
5. **Inline Editing**: PATCH/PUT for cell updates
6. **Simple Data Refresh**: POST for new charges
7. **Dockerization**: Full containerization
8. **Time to Market**: MVP scope (not enterprise-grade)

---

## Framework Comparison

### FastAPI ✅ **RECOMMENDED**

| Aspect | Rating | Notes |
|--------|--------|-------|
| **REST API Design** | ⭐⭐⭐⭐⭐ | Built for APIs; clean endpoint definitions |
| **Query Parameters** | ⭐⭐⭐⭐⭐ | Native support for `startRow`, `endRow`, filters |
| **Async Support** | ⭐⭐⭐⭐⭐ | Native async/await for DB queries |
| **Request Validation** | ⭐⭐⭐⭐⭐ | Pydantic models (automatic input validation) |
| **Documentation** | ⭐⭐⭐⭐⭐ | Auto-generated Swagger/OpenAPI docs |
| **Performance** | ⭐⭐⭐⭐⭐ | Uvicorn (one of the fastest) |
| **Docker Footprint** | ⭐⭐⭐⭐⭐ | Smallest image size (~300MB) |
| **Developer Velocity** | ⭐⭐⭐⭐ | Minimal boilerplate for CRUD |
| **Learning Curve** | ⭐⭐⭐ | Modern Python (async/await) |
| **Community** | ⭐⭐⭐⭐ | Growing, active, well-documented |

**Pros:**
- Natural fit for REST pagination (query params: `?startRow=0&endRow=100`)
- Pydantic validation catches bugs early
- Automatic OpenAPI docs for frontend team
- Async database operations are cleaner
- Minimal dependencies = smaller Docker image
- SQLAlchemy integration is seamless

**Cons:**
- Requires manual async/await handling (minor for this scope)
- Smaller community than Django (still mature)

---

### Django + Django REST Framework

| Aspect | Rating | Notes |
|--------|--------|-------|
| **REST API Design** | ⭐⭐⭐⭐ | DRF provides structure (can feel verbose) |
| **Query Parameters** | ⭐⭐⭐⭐ | Handled by ViewSets/filters (more setup) |
| **Async Support** | ⭐⭐⭐ | Async support (but sync-first design) |
| **Request Validation** | ⭐⭐⭐⭐ | Serializers (powerful but more boilerplate) |
| **Documentation** | ⭐⭐⭐⭐ | DRF browsable API (manual doc writing) |
| **Performance** | ⭐⭐⭐ | Good, but heavier than FastAPI |
| **Docker Footprint** | ⭐⭐⭐ | Larger image (~500MB+) |
| **Developer Velocity** | ⭐⭐ | Heavy setup for simple CRUD |
| **Learning Curve** | ⭐⭐⭐ | Many concepts to learn |
| **Community** | ⭐⭐⭐⭐⭐ | Largest Python web community |

**Pros:**
- Batteries included (ORM, migrations, admin panel)
- Django ORM is intuitive
- Extensive ecosystem & third-party packages
- Great for long-term maintenance

**Cons:**
- **Overkill for MVP**: Monolithic design adds complexity
- More boilerplate for simple endpoints
- Slower startup time (not ideal for Docker scaling)
- Heavier resource usage
- DRF learning curve is steep for simple APIs

**Verdict:** Better for large applications with complex business logic, not MVPs.

---

### Flask

| Aspect | Rating | Notes |
|--------|--------|-------|
| **REST API Design** | ⭐⭐⭐ | Flexible but manual setup |
| **Query Parameters** | ⭐⭐⭐⭐ | Easy with request.args parsing |
| **Async Support** | ⭐⭐⭐ | Added in Flask 2.0 (less natural) |
| **Request Validation** | ⭐⭐ | No built-in validation |
| **Documentation** | ⭐⭐ | Manual OpenAPI setup |
| **Performance** | ⭐⭐⭐⭐ | Good, but heavier than FastAPI |
| **Docker Footprint** | ⭐⭐⭐⭐ | Lighter than Django (~350MB) |
| **Developer Velocity** | ⭐⭐⭐ | More code to write & maintain |
| **Learning Curve** | ⭐⭐⭐⭐ | Easy to learn, but scattered ecosystem |
| **Community** | ⭐⭐⭐⭐ | Mature, large community |

**Pros:**
- Lightweight and minimal
- Flexible - you choose your tools
- Good for simple APIs

**Cons:**
- No built-in request validation (manual error-checking)
- Async support feels tacked-on
- Need to manually integrate ORM, validation, docs
- More boilerplate than FastAPI for same functionality
- Fragmented ecosystem (many choices, harder to decide)

**Verdict:** Better than Django for MVPs, but FastAPI is cleaner.

---

## Decision: FastAPI

### Why FastAPI Wins for This MVP

**1. Perfect Use Case Match**
- REST API with pagination = FastAPI's bread and butter
- Query parameters (`?startRow=0&endRow=100`) are first-class citizens
- Minimal setup required

**2. Developer Productivity**
```python
# FastAPI - 10 lines to pagination endpoint
@app.get("/charges")
async def get_charges(startRow: int, endRow: int, charge_type: str = None):
    limit = endRow - startRow
    offset = startRow
    return await db.fetch_charges(limit, offset, charge_type)
```

vs.

```python
# Django - 30+ lines with ViewSets + Serializers + Configuration
class ChargeViewSet(viewsets.ModelViewSet):
    queryset = Charge.objects.all()
    serializer_class = ChargeSerializer
    pagination_class = CustomPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['charge_type']
```

**3. API Documentation**
- Auto-generated Swagger UI at `/docs`
- Frontend team gets real-time API spec
- No manual OpenAPI writing

**4. Data Validation**
- Pydantic models catch invalid input before database
- Type hints improve code clarity
- Reduces bugs

**5. Deployment Efficiency**
- Smaller Docker image
- Lower memory usage
- Faster startup (important for scaling)

**6. Modern Python**
- Async/await is more natural in FastAPI
- Better for I/O-bound operations (database queries)
- Future-proof technology

---

## Implementation Plan

### Tech Stack
- **Framework:** FastAPI
- **ORM:** SQLAlchemy 2.0 (async support)
- **Database Driver:** asyncpg (async PostgreSQL)
- **Server:** Uvicorn
- **Validation:** Pydantic
- **Migration:** Alembic

### Core Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/charges` | Paginated list with filters |
| `PATCH` | `/api/charges/{id}` | Update single charge |
| `POST` | `/api/charges` | Create new charge |

### Directory Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── config.py            # Database & env config
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response models
│   ├── api/
│   │   └── charges.py       # Charges endpoints
│   ├── services/
│   │   └── charge_service.py # Business logic
│   └── db/
│       ├── database.py      # Database connection
│       └── seed.py          # 500 row seed script
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

---

## Why NOT Others?

**Django:**
- Over-engineered for a simple CRUD + pagination MVP
- Startup overhead not justified
- Better for large monolithic apps with complex auth/permissions

**Flask:**
- Requires more manual boilerplate
- No built-in validation (we'd add it anyway)
- Async support feels unnatural
- Better for tiny projects, not scalable MVPs

---

## Related Documentation

- [[Backend Testing.md]] - Unit tests, integration tests, and testing strategy for FastAPI endpoints

---

## Next Steps

1. ✅ Set up FastAPI project structure
2. ✅ Define Pydantic schemas for requests/responses
3. ✅ Implement SQLAlchemy ORM models
4. ✅ Build `/api/charges` endpoint with pagination
5. ✅ Implement filtering logic (charge_type, medical_centre_name)
6. ✅ Add PATCH endpoint for inline edits
7. ✅ Add POST endpoint for new charges
8. ✅ Create seed data script (500 rows)
9. ✅ Dockerize with Dockerfile + docker-compose.yml
10. ✅ Test pagination & filtering
