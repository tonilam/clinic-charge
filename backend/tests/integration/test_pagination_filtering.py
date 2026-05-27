import pytest


class TestPaginationEdgeCases:
    @pytest.mark.asyncio
    async def test_combined_filters(self, client, seeded_db):
        response = await client.get(
            "/api/charges?startRow=0&endRow=100&charge_type=Consultation&medical_centre_name=City"
        )
        assert response.status_code == 200
        data = response.json()
        for row in data["rows"]:
            assert row["charge_type"] == "Consultation"
            assert "City" in row["medical_centre_name"]

    @pytest.mark.asyncio
    async def test_pagination_total_records_consistent(self, client, seeded_db):
        r1 = await client.get("/api/charges?startRow=0&endRow=1")
        r2 = await client.get("/api/charges?startRow=1&endRow=2")
        assert r1.json()["totalRecords"] == r2.json()["totalRecords"]

    @pytest.mark.asyncio
    async def test_filter_case_insensitive_centre(self, client, seeded_db):
        response_lower = await client.get("/api/charges?startRow=0&endRow=100&medical_centre_name=city")
        response_upper = await client.get("/api/charges?startRow=0&endRow=100&medical_centre_name=City")
        assert response_lower.json()["totalRecords"] == response_upper.json()["totalRecords"]

    @pytest.mark.asyncio
    async def test_health_endpoint(self, client):
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
