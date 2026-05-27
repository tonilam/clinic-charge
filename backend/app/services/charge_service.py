from typing import Optional
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ClinicCharge
from app.schemas import ChargeCreate, ChargeUpdate


class ChargeService:
    @staticmethod
    def calculate_offset(start_row: int, end_row: int) -> tuple[int, int]:
        limit = max(1, end_row - start_row)
        offset = max(0, start_row)
        return limit, offset

    @staticmethod
    def build_filter_query(
        query,
        charge_type: Optional[str] = None,
        medical_centre_name: Optional[str] = None,
    ):
        if charge_type:
            query = query.where(ClinicCharge.charge_type == charge_type)
        if medical_centre_name:
            query = query.where(
                ClinicCharge.medical_centre_name.ilike(f"%{medical_centre_name}%")
            )
        return query

    async def get_charges(
        self,
        db: AsyncSession,
        start_row: int = 0,
        end_row: int = 100,
        charge_type: Optional[str] = None,
        medical_centre_name: Optional[str] = None,
    ) -> tuple[list[ClinicCharge], int]:
        limit, offset = self.calculate_offset(start_row, end_row)

        base_query = select(ClinicCharge)
        base_query = self.build_filter_query(base_query, charge_type, medical_centre_name)

        count_query = select(func.count()).select_from(
            self.build_filter_query(select(ClinicCharge), charge_type, medical_centre_name).subquery()
        )

        count_result = await db.execute(count_query)
        total = count_result.scalar_one()

        data_query = base_query.offset(offset).limit(limit).order_by(ClinicCharge.id)
        data_result = await db.execute(data_query)
        rows = data_result.scalars().all()

        return list(rows), total

    async def get_charge_by_id(
        self, db: AsyncSession, charge_id: int
    ) -> Optional[ClinicCharge]:
        result = await db.execute(
            select(ClinicCharge).where(ClinicCharge.id == charge_id)
        )
        return result.scalar_one_or_none()

    async def create_charge(
        self, db: AsyncSession, payload: ChargeCreate
    ) -> ClinicCharge:
        charge = ClinicCharge(**payload.model_dump())
        db.add(charge)
        await db.commit()
        await db.refresh(charge)
        return charge

    async def update_charge(
        self, db: AsyncSession, charge_id: int, payload: ChargeUpdate
    ) -> Optional[ClinicCharge]:
        existing = await self.get_charge_by_id(db, charge_id)
        if existing is None:
            return None

        updates = payload.model_dump(exclude_none=True)
        if not updates:
            return existing

        await db.execute(
            update(ClinicCharge)
            .where(ClinicCharge.id == charge_id)
            .values(**updates)
        )
        await db.commit()
        await db.refresh(existing)
        return existing
