from app.models import ClinicCharge


class TestClinicChargeModel:
    def test_charge_instantiation(self):
        charge = ClinicCharge(
            id=1,
            medical_centre_name="City Medical",
            patient_visit_type="Standard",
            charge_type="Consultation",
            amount=85.00,
        )
        assert charge.id == 1
        assert charge.charge_type == "Consultation"
        assert charge.amount == 85.00

    def test_charge_repr(self):
        charge = ClinicCharge(id=1, charge_type="Consultation", amount=85.00)
        assert "ClinicCharge" in repr(charge)
        assert "Consultation" in repr(charge)
