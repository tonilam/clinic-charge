import pytest
from decimal import Decimal
from pydantic import ValidationError
from app.schemas import ChargeCreate, ChargeUpdate


class TestChargeCreate:
    def test_valid_charge_create(self):
        data = {
            "medical_centre_name": "City Medical",
            "patient_visit_type": "Standard",
            "charge_type": "Consultation",
            "amount": 150.00,
        }
        charge = ChargeCreate(**data)
        assert charge.charge_type == "Consultation"
        assert charge.amount == Decimal("150.00")

    def test_missing_required_field_raises_error(self):
        with pytest.raises(ValidationError):
            ChargeCreate(
                medical_centre_name="City Medical",
                patient_visit_type="Standard",
                charge_type="Consultation",
                # missing amount
            )

    def test_invalid_amount_type_raises_error(self):
        with pytest.raises(ValidationError):
            ChargeCreate(
                medical_centre_name="City Medical",
                patient_visit_type="Standard",
                charge_type="Consultation",
                amount="not_a_number",
            )

    def test_zero_amount_raises_error(self):
        with pytest.raises(ValidationError):
            ChargeCreate(
                medical_centre_name="City Medical",
                patient_visit_type="Standard",
                charge_type="Consultation",
                amount=0,
            )

    def test_negative_amount_raises_error(self):
        with pytest.raises(ValidationError):
            ChargeCreate(
                medical_centre_name="City Medical",
                patient_visit_type="Standard",
                charge_type="Consultation",
                amount=-10,
            )


class TestChargeUpdate:
    def test_partial_update_amount_only(self):
        charge = ChargeUpdate(amount=200.00)
        assert charge.amount == Decimal("200.00")
        assert charge.charge_type is None

    def test_partial_update_charge_type_only(self):
        charge = ChargeUpdate(charge_type="Emergency")
        assert charge.charge_type == "Emergency"
        assert charge.amount is None

    def test_empty_update_is_valid(self):
        charge = ChargeUpdate()
        assert charge.amount is None
        assert charge.charge_type is None

    def test_partial_update_zero_amount_raises_error(self):
        with pytest.raises(ValidationError):
            ChargeUpdate(amount=0)
