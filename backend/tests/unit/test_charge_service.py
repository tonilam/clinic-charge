import pytest
from app.services.charge_service import ChargeService
from app.schemas import ChargeCreate, ChargeUpdate


class TestChargeServiceCalculations:
    def test_calculate_offset_first_page(self):
        service = ChargeService()
        limit, offset = service.calculate_offset(start_row=0, end_row=10)
        assert limit == 10
        assert offset == 0

    def test_calculate_offset_second_page(self):
        service = ChargeService()
        limit, offset = service.calculate_offset(start_row=10, end_row=20)
        assert limit == 10
        assert offset == 10

    def test_calculate_offset_large_page(self):
        service = ChargeService()
        limit, offset = service.calculate_offset(start_row=0, end_row=100)
        assert limit == 100
        assert offset == 0

    def test_calculate_offset_negative_start_clamped(self):
        service = ChargeService()
        limit, offset = service.calculate_offset(start_row=-5, end_row=10)
        assert limit == 15
        assert offset == 0

    def test_calculate_offset_zero_range_clamps_to_one(self):
        service = ChargeService()
        limit, offset = service.calculate_offset(start_row=5, end_row=5)
        assert limit == 1


class TestChargeServiceDatabase:
    @pytest.mark.asyncio
    async def test_create_charge(self, db_session):
        service = ChargeService()
        payload = ChargeCreate(
            medical_centre_name="City Medical",
            patient_visit_type="Standard",
            charge_type="Consultation",
            amount=85.00,
        )
        charge = await service.create_charge(db_session, payload)
        assert charge.id is not None
        assert charge.charge_type == "Consultation"
        assert float(charge.amount) == 85.00

    @pytest.mark.asyncio
    async def test_get_charges_empty_db(self, db_session):
        service = ChargeService()
        rows, total = await service.get_charges(db_session)
        assert rows == []
        assert total == 0

    @pytest.mark.asyncio
    async def test_get_charges_pagination(self, db_session, seeded_db):
        service = ChargeService()
        rows, total = await service.get_charges(db_session, start_row=0, end_row=2)
        assert len(rows) == 2
        assert total == 3

    @pytest.mark.asyncio
    async def test_get_charges_filter_by_type(self, db_session, seeded_db):
        service = ChargeService()
        rows, total = await service.get_charges(db_session, charge_type="Consultation")
        assert all(r.charge_type == "Consultation" for r in rows)

    @pytest.mark.asyncio
    async def test_get_charges_filter_by_centre(self, db_session, seeded_db):
        service = ChargeService()
        rows, total = await service.get_charges(db_session, medical_centre_name="City")
        assert all("City" in r.medical_centre_name for r in rows)
        assert total == 2

    @pytest.mark.asyncio
    async def test_update_charge(self, db_session, seeded_db):
        service = ChargeService()
        charge_id = seeded_db[0].id
        updated = await service.update_charge(
            db_session, charge_id, ChargeUpdate(amount=200.00)
        )
        assert updated is not None
        assert float(updated.amount) == 200.00

    @pytest.mark.asyncio
    async def test_update_nonexistent_charge_returns_none(self, db_session):
        service = ChargeService()
        result = await service.update_charge(db_session, 99999, ChargeUpdate(amount=100))
        assert result is None

    @pytest.mark.asyncio
    async def test_get_charge_by_id(self, db_session, seeded_db):
        service = ChargeService()
        charge_id = seeded_db[0].id
        found = await service.get_charge_by_id(db_session, charge_id)
        assert found is not None
        assert found.id == charge_id

    @pytest.mark.asyncio
    async def test_get_charge_by_id_not_found(self, db_session):
        service = ChargeService()
        result = await service.get_charge_by_id(db_session, 99999)
        assert result is None
