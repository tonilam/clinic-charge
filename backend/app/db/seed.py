"""Run this script to seed the database with 500 clinic charge records."""

import asyncio
import random
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, func
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from app.models import Base, ClinicCharge
from app.config import settings

MEDICAL_CENTRES = [
    "City Medical Centre", "Northside Family Practice", "Southgate GP Clinic",
    "Eastside Health Centre", "Westfield Medical", "Central Health Hub",
    "Riverside Medical Practice", "Bayside Family Health", "Greenfields Medical",
    "Hillcrest General Practice",
]
VISIT_TYPES = [
    "Standard Consultation", "Urgent Care", "Bulk Billed Visit",
    "Private Patient", "Telehealth", "After Hours",
]
CHARGE_TYPES = [
    "Consultation", "Procedure", "Follow-up", "Emergency", "Specialist Referral",
    "Pathology", "Radiology", "Vaccination", "Health Assessment", "Mental Health",
]
AMOUNTS = [
    39.10, 78.20, 85.00, 90.00, 92.50, 105.00, 115.00, 125.00,
    150.00, 175.00, 195.00, 210.00, 250.00, 280.00, 320.00,
]


async def seed(count: int = 500) -> None:
    engine = create_async_engine(settings.database_url, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        existing = await session.execute(select(func.count()).select_from(ClinicCharge))
        if existing.scalar_one() >= count:
            print(f"Database already has {count}+ rows; skipping seed.")
            return

        charges = [
            ClinicCharge(
                medical_centre_name=random.choice(MEDICAL_CENTRES),
                patient_visit_type=random.choice(VISIT_TYPES),
                charge_type=random.choice(CHARGE_TYPES),
                amount=random.choice(AMOUNTS),
            )
            for _ in range(count)
        ]
        session.add_all(charges)
        await session.commit()
        print(f"Seeded {count} clinic charge records.")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
