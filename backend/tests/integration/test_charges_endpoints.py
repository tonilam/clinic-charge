import pytest


class TestGetCharges:
    @pytest.mark.asyncio
    async def test_get_charges_returns_200(self, client, seeded_db):
        response = await client.get("/api/charges?startRow=0&endRow=10")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_get_charges_response_structure(self, client, seeded_db):
        response = await client.get("/api/charges?startRow=0&endRow=10")
        data = response.json()
        assert "rows" in data
        assert "totalRecords" in data
        assert isinstance(data["rows"], list)
        assert isinstance(data["totalRecords"], int)

    @pytest.mark.asyncio
    async def test_get_charges_pagination_limit(self, client, seeded_db):
        response = await client.get("/api/charges?startRow=0&endRow=2")
        data = response.json()
        assert len(data["rows"]) == 2
        assert data["totalRecords"] == 3

    @pytest.mark.asyncio
    async def test_get_charges_second_page_different_data(self, client, seeded_db):
        r1 = await client.get("/api/charges?startRow=0&endRow=1")
        r2 = await client.get("/api/charges?startRow=1&endRow=2")
        ids1 = [r["id"] for r in r1.json()["rows"]]
        ids2 = [r["id"] for r in r2.json()["rows"]]
        assert ids1 != ids2

    @pytest.mark.asyncio
    async def test_get_charges_filter_charge_type(self, client, seeded_db):
        response = await client.get("/api/charges?startRow=0&endRow=100&charge_type=Consultation")
        data = response.json()
        assert all(r["charge_type"] == "Consultation" for r in data["rows"])

    @pytest.mark.asyncio
    async def test_get_charges_filter_medical_centre(self, client, seeded_db):
        response = await client.get("/api/charges?startRow=0&endRow=100&medical_centre_name=City")
        data = response.json()
        assert all("City" in r["medical_centre_name"] for r in data["rows"])

    @pytest.mark.asyncio
    async def test_get_charges_beyond_total_returns_empty(self, client, seeded_db):
        response = await client.get("/api/charges?startRow=9999&endRow=10000")
        data = response.json()
        assert data["rows"] == []

    @pytest.mark.asyncio
    async def test_get_charges_nonexistent_filter_returns_empty(self, client, seeded_db):
        response = await client.get("/api/charges?startRow=0&endRow=100&charge_type=NonExistent")
        data = response.json()
        assert data["rows"] == []
        assert data["totalRecords"] == 0


class TestCreateCharge:
    @pytest.mark.asyncio
    async def test_create_charge_returns_201(self, client, db_session):
        payload = {
            "medical_centre_name": "Metro Hospital",
            "patient_visit_type": "Private Patient",
            "charge_type": "Consultation",
            "amount": 500.00,
        }
        response = await client.post("/api/charges", json=payload)
        assert response.status_code == 201

    @pytest.mark.asyncio
    async def test_create_charge_returns_id(self, client, db_session):
        payload = {
            "medical_centre_name": "Metro Hospital",
            "patient_visit_type": "Private Patient",
            "charge_type": "Consultation",
            "amount": 500.00,
        }
        response = await client.post("/api/charges", json=payload)
        data = response.json()
        assert data["id"] is not None
        assert data["charge_type"] == "Consultation"
        assert float(data["amount"]) == 500.00

    @pytest.mark.asyncio
    async def test_create_charge_invalid_missing_fields_returns_422(self, client):
        response = await client.post("/api/charges", json={"charge_type": "Consultation"})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_charge_invalid_charge_type_returns_422(self, client):
        payload = {
            "medical_centre_name": "Metro Hospital",
            "patient_visit_type": "Private Patient",
            "charge_type": "Surgery",
            "amount": 500.00,
        }
        response = await client.post("/api/charges", json=payload)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_create_charge_zero_amount_returns_422(self, client):
        payload = {
            "medical_centre_name": "Metro Hospital",
            "patient_visit_type": "Private Patient",
            "charge_type": "Consultation",
            "amount": 0,
        }
        response = await client.post("/api/charges", json=payload)
        assert response.status_code == 422


class TestUpdateCharge:
    @pytest.mark.asyncio
    async def test_patch_charge_returns_200(self, client, seeded_db):
        charge_id = seeded_db[0].id
        response = await client.patch(f"/api/charges/{charge_id}", json={"amount": 200.00})
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_patch_charge_updates_amount(self, client, seeded_db):
        charge_id = seeded_db[0].id
        response = await client.patch(f"/api/charges/{charge_id}", json={"amount": 200.00})
        data = response.json()
        assert float(data["amount"]) == 200.00

    @pytest.mark.asyncio
    async def test_patch_charge_not_found_returns_404(self, client, db_session):
        response = await client.patch("/api/charges/99999", json={"amount": 100})
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_patch_charge_partial_update(self, client, seeded_db):
        charge_id = seeded_db[0].id
        original_centre = seeded_db[0].medical_centre_name
        response = await client.patch(
            f"/api/charges/{charge_id}", json={"charge_type": "Emergency"}
        )
        data = response.json()
        assert data["charge_type"] == "Emergency"
        assert data["medical_centre_name"] == original_centre
