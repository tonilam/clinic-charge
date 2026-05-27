# Backend Testing Strategy

Based on [[Backend.md]], our FastAPI MVP requires comprehensive testing for REST API endpoints, database operations, and business logic.

---

## Testing Framework & Tools

### Recommended Stack

| Tool | Purpose | Why |
|------|---------|-----|
| **pytest** | Test framework | Industry standard, excellent FastAPI support |
| **pytest-asyncio** | Async test support | Tests async endpoints and db operations |
| **httpx** | HTTP client | FastAPI test client (TestClient uses httpx) |
| **SQLAlchemy test utilities** | Database testing | Fixtures for test DB isolation |
| **pytest-cov** | Coverage reporting | Track test coverage % |
| **factory-boy** | Test data generation | Clean, readable test fixtures |

### Installation
```bash
pip install pytest pytest-asyncio httpx pytest-cov factory-boy
```

---

## Test Structure

### Directory Layout
```
backend/
├── app/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── api/
│   │   └── charges.py
│   └── services/
│       └── charge_service.py
├── tests/
│   ├── conftest.py              # Shared fixtures & config
│   ├── __init__.py
│   ├── unit/
│   │   ├── test_charge_service.py
│   │   ├── test_models.py
│   │   └── test_schemas.py
│   └── integration/
│       ├── test_charges_endpoints.py
│       └── test_pagination_filtering.py
├── pytest.ini                   # pytest configuration
└── requirements.txt
```

### pytest.ini Configuration
```ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = --cov=app --cov-report=html --cov-report=term-missing
```

---

## Unit Tests

Unit tests focus on **isolated business logic** without external dependencies (database, HTTP).

### 1. Service Layer Tests

**File:** `tests/unit/test_charge_service.py`

```python
import pytest
from app.services.charge_service import ChargeService
from unittest.mock import AsyncMock, patch

class TestChargeService:
    """Test business logic for charges"""
    
    @pytest.fixture
    def charge_service(self):
        return ChargeService()
    
    @pytest.mark.asyncio
    async def test_calculate_pagination_offset(self, charge_service):
        """Verify LIMIT/OFFSET calculation"""
        limit = 100
        offset = charge_service.calculate_offset(start_row=0, end_row=100)
        assert offset == 0
        
        offset = charge_service.calculate_offset(start_row=100, end_row=200)
        assert offset == 100
    
    @pytest.mark.asyncio
    async def test_filter_by_charge_type(self, charge_service):
        """Test filtering logic"""
        mock_charges = [
            {"id": 1, "charge_type": "Consultation"},
            {"id": 2, "charge_type": "Surgery"},
            {"id": 3, "charge_type": "Consultation"},
        ]
        
        filtered = charge_service.filter_charges(
            charges=mock_charges, 
            charge_type="Consultation"
        )
        
        assert len(filtered) == 2
        assert all(c["charge_type"] == "Consultation" for c in filtered)
    
    @pytest.mark.asyncio
    async def test_search_medical_centre_name(self, charge_service):
        """Test text search"""
        mock_charges = [
            {"id": 1, "medical_centre_name": "City Medical"},
            {"id": 2, "medical_centre_name": "Rural Health"},
        ]
        
        results = charge_service.search_by_centre(
            charges=mock_charges, 
            search_term="City"
        )
        
        assert len(results) == 1
        assert results[0]["medical_centre_name"] == "City Medical"
```

### 2. Schema Validation Tests

**File:** `tests/unit/test_schemas.py`

```python
import pytest
from pydantic import ValidationError
from app.schemas import ChargeCreate, ChargeUpdate

class TestChargeSchema:
    """Test Pydantic schema validation"""
    
    def test_charge_create_valid(self):
        """Valid charge creation"""
        data = {
            "charge_type": "Consultation",
            "medical_centre_name": "City Medical",
            "amount": 150.00
        }
        charge = ChargeCreate(**data)
        assert charge.charge_type == "Consultation"
    
    def test_charge_create_invalid_missing_field(self):
        """Missing required field raises error"""
        data = {
            "charge_type": "Consultation",
            # missing medical_centre_name
        }
        with pytest.raises(ValidationError):
            ChargeCreate(**data)
    
    def test_charge_create_invalid_amount(self):
        """Invalid amount type raises error"""
        data = {
            "charge_type": "Consultation",
            "medical_centre_name": "City Medical",
            "amount": "not_a_number"  # Should be float
        }
        with pytest.raises(ValidationError):
            ChargeCreate(**data)
    
    def test_charge_update_partial(self):
        """Partial updates allowed"""
        data = {"amount": 200.00}  # Only update amount
        charge = ChargeUpdate(**data)
        assert charge.amount == 200.00
        assert charge.charge_type is None  # Optional fields
```

### 3. Model Tests

**File:** `tests/unit/test_models.py`

```python
import pytest
from app.models import Charge
from datetime import datetime

class TestChargeModel:
    """Test SQLAlchemy ORM models"""
    
    def test_charge_creation(self):
        """Verify model instantiation"""
        charge = Charge(
            id=1,
            charge_type="Consultation",
            medical_centre_name="City Medical",
            amount=150.00,
            created_at=datetime.now()
        )
        assert charge.id == 1
        assert charge.charge_type == "Consultation"
    
    def test_charge_repr(self):
        """Verify string representation"""
        charge = Charge(id=1, charge_type="Consultation")
        assert "Charge" in repr(charge)
```

---

## Integration Tests

Integration tests verify **full workflows** including database, API endpoints, and business logic together.

### 1. Database Integration Tests

**File:** `tests/integration/test_charges_endpoints.py`

```python
import pytest
from httpx import AsyncClient
from app.main import app
from app.db.database import get_db

class TestChargesEndpoints:
    """Test FastAPI endpoints with real database"""
    
    @pytest.fixture
    async def client(self):
        """Create test client"""
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client
    
    @pytest.fixture
    async def db_session(self):
        """Database session for test data"""
        # Use test database (separate from production)
        # Rollback after test
        pass
    
    @pytest.mark.asyncio
    async def test_get_charges_basic(self, client, db_session):
        """GET /api/charges returns paginated list"""
        response = await client.get("/api/charges?startRow=0&endRow=10")
        
        assert response.status_code == 200
        data = response.json()
        assert "rows" in data
        assert "totalRecords" in data
        assert len(data["rows"]) <= 10
    
    @pytest.mark.asyncio
    async def test_get_charges_with_pagination(self, client, db_session):
        """Pagination parameters work correctly"""
        # Page 1: rows 0-10
        response1 = await client.get("/api/charges?startRow=0&endRow=10")
        data1 = response1.json()
        
        # Page 2: rows 10-20
        response2 = await client.get("/api/charges?startRow=10&endRow=20")
        data2 = response2.json()
        
        # Verify different data
        assert data1["rows"][0]["id"] != data2["rows"][0]["id"]
    
    @pytest.mark.asyncio
    async def test_get_charges_filter_by_type(self, client, db_session):
        """Filter by charge_type parameter"""
        response = await client.get(
            "/api/charges?startRow=0&endRow=100&charge_type=Consultation"
        )
        
        assert response.status_code == 200
        data = response.json()
        # All returned rows should match filter
        assert all(r["charge_type"] == "Consultation" for r in data["rows"])
    
    @pytest.mark.asyncio
    async def test_get_charges_search_medical_centre(self, client, db_session):
        """Search by medical_centre_name"""
        response = await client.get(
            "/api/charges?startRow=0&endRow=100&medical_centre_name=City"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert all("City" in r["medical_centre_name"] for r in data["rows"])
```

### 2. CRUD Operations Tests

**File:** `tests/integration/test_charges_endpoints.py` (continued)

```python
    @pytest.mark.asyncio
    async def test_create_charge(self, client, db_session):
        """POST /api/charges creates new charge"""
        payload = {
            "charge_type": "Surgery",
            "medical_centre_name": "Metro Hospital",
            "amount": 5000.00
        }
        response = await client.post("/api/charges", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert data["id"] is not None
        assert data["charge_type"] == "Surgery"
    
    @pytest.mark.asyncio
    async def test_create_charge_invalid_data(self, client):
        """POST with invalid data returns 422"""
        payload = {
            "charge_type": "Surgery",
            # missing medical_centre_name
        }
        response = await client.post("/api/charges", json=payload)
        
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_update_charge_patch(self, client, db_session):
        """PATCH /api/charges/{id} updates single field"""
        charge_id = 1  # Assume seeded data
        payload = {"amount": 200.00}
        response = await client.patch(f"/api/charges/{charge_id}", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["amount"] == 200.00
    
    @pytest.mark.asyncio
    async def test_update_charge_not_found(self, client):
        """PATCH non-existent charge returns 404"""
        response = await client.patch("/api/charges/99999", json={"amount": 100})
        
        assert response.status_code == 404
```

### 3. Filtering & Pagination Integration Tests

**File:** `tests/integration/test_pagination_filtering.py`

```python
import pytest
from httpx import AsyncClient
from app.main import app

class TestPaginationFiltering:
    """Test pagination and filtering edge cases"""
    
    @pytest.fixture
    async def client(self):
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client
    
    @pytest.mark.asyncio
    async def test_pagination_boundary(self, client):
        """Test pagination at dataset boundaries"""
        # Get total count
        response = await client.get("/api/charges?startRow=0&endRow=1")
        total = response.json()["totalRecords"]
        
        # Request beyond total
        response = await client.get(
            f"/api/charges?startRow={total}&endRow={total + 100}"
        )
        assert response.status_code == 200
        assert len(response.json()["rows"]) == 0
    
    @pytest.mark.asyncio
    async def test_combined_filters(self, client):
        """Multiple filters work together"""
        response = await client.get(
            "/api/charges?startRow=0&endRow=100&charge_type=Consultation&medical_centre_name=City"
        )
        
        assert response.status_code == 200
        data = response.json()
        for row in data["rows"]:
            assert row["charge_type"] == "Consultation"
            assert "City" in row["medical_centre_name"]
    
    @pytest.mark.asyncio
    async def test_empty_filter_result(self, client):
        """Filter with no matches returns empty array"""
        response = await client.get(
            "/api/charges?startRow=0&endRow=100&charge_type=NonExistentType"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["rows"]) == 0
        assert data["totalRecords"] == 0
```

---

## Test Fixtures & Factories

### conftest.py - Shared Setup

**File:** `tests/conftest.py`

```python
import pytest
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Database fixture (test database)
@pytest.fixture(scope="function")
async def test_db():
    """Create test database session"""
    # Use SQLite in-memory or separate test database
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with SessionLocal() as session:
        yield session
    
    await engine.dispose()

@pytest.fixture
def event_loop():
    """Event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Factory for test data (using factory-boy)
from factory import Factory, Faker
from factory.alchemy import SQLAlchemyModelFactory

class ChargeFactory(SQLAlchemyModelFactory):
    """Factory for creating test Charge objects"""
    class Meta:
        model = Charge
        sqlalchemy_session_persistence = "create"
    
    charge_type = Faker("word")
    medical_centre_name = Faker("company")
    amount = Faker("pydecimal", left_digits=5, right_digits=2, positive=True)
    created_at = Faker("date_time")

@pytest.fixture
def charge_factory():
    """Provide factory for creating charges"""
    return ChargeFactory
```

---

## Running Tests

### Command Examples

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# Run only unit tests
pytest tests/unit/

# Run only integration tests
pytest tests/integration/

# Run specific test
pytest tests/unit/test_charge_service.py::TestChargeService::test_filter_by_charge_type

# Run with verbose output
pytest -v

# Run and stop on first failure
pytest -x

# Run tests matching pattern
pytest -k "pagination"
```

### Coverage Goals

```
Targets for MVP:
- Services: 90%+ coverage
- API endpoints: 85%+ coverage
- Models: 80%+ coverage
- Overall: 85%+ minimum
```

---

## CI/CD Integration

### GitHub Actions Example

**File:** `.github/workflows/tests.yml`

```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-asyncio pytest-cov
      
      - name: Run tests
        run: pytest --cov=app --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Testing Best Practices

### ✅ DO
- **Test behavior, not implementation** - Focus on "what does it do?" not "how does it do it?"
- **Use descriptive test names** - `test_create_charge_with_valid_data` > `test_create`
- **One assertion per unit test** - Makes failures clear
- **Mock external dependencies** - Don't hit real databases in unit tests
- **Isolate tests** - Each test should be independent
- **Use fixtures** - DRY principle for test setup

### ❌ DON'T
- **Test third-party libraries** - Assume SQLAlchemy, Pydantic work correctly
- **Create brittle tests** - Avoid testing internal implementation details
- **Skip async tests** - Always test async code with `@pytest.mark.asyncio`
- **Commit without coverage** - Check coverage report before merging
- **Mix unit & integration tests** - Keep layers separate

---

## Test Data Strategy

### Seeding (Production-like Data)
```python
# Before integration tests run, seed test DB with 500 rows
# Use same seed script as production setup (app/db/seed.py)
@pytest.fixture(scope="session", autouse=True)
async def seed_test_database():
    """Seed test database with realistic charge data"""
    await seed_charges(db, count=500)
```

### Factories (Test-Specific Data)
```python
# For unit tests, use factories for specific edge cases
charge = ChargeFactory.create(charge_type="Surgery", amount=10000)
```

---

## Next Steps

1. ✅ Create `tests/` directory structure
2. ✅ Set up `conftest.py` with fixtures
3. ✅ Write unit tests for services (80% of code)
4. ✅ Write integration tests for endpoints (100% coverage)
5. ✅ Add CI/CD workflow for automatic test runs
6. ✅ Target 85%+ coverage before production
7. ✅ Run tests locally before every commit
