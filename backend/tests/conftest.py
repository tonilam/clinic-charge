import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.models import Base, ClinicCharge
from app.db.database import get_db

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine):
    session_factory = async_sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def seeded_db(db_session):
    charges = [
        ClinicCharge(
            medical_centre_name="City Medical Centre",
            patient_visit_type="Standard Consultation",
            charge_type="Consultation",
            amount=85.00,
        ),
        ClinicCharge(
            medical_centre_name="Northside Family Practice",
            patient_visit_type="Urgent Care",
            charge_type="Emergency",
            amount=150.00,
        ),
        ClinicCharge(
            medical_centre_name="City Medical Centre",
            patient_visit_type="Telehealth",
            charge_type="Follow-up",
            amount=78.20,
        ),
    ]
    db_session.add_all(charges)
    await db_session.commit()
    for c in charges:
        await db_session.refresh(c)
    return charges
