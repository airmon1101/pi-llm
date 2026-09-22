import pytest

@pytest.mark.asyncio
async def test_system_info(test_client):
    resp = await test_client.get("/api/system/info")
    assert resp.status_code == 200
    assert "hostname" in resp.json()

@pytest.mark.asyncio
async def test_storage(test_client):
    resp = await test_client.get("/api/system/storage")
    assert resp.status_code == 200
    assert "storage" in resp.json()

@pytest.mark.asyncio
async def test_models(test_client):
    resp = await test_client.get("/api/models")
    assert resp.status_code == 200
    assert "models" in resp.json()
