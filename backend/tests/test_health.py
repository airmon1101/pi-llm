import pytest

@pytest.mark.asyncio
async def test_health(test_client):
    response = await test_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "version" in data
    assert "services" in data
