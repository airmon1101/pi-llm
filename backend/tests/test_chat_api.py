import pytest

@pytest.mark.asyncio
async def test_create_and_list_chat(test_client, setup_db):
    resp = await test_client.post("/api/chats", json={"title": "Test Chat", "model": "gemma4:e2b"})
    assert resp.status_code == 200
    chat_id = resp.json()["id"]

    resp = await test_client.get("/api/chats")
    assert resp.status_code == 200
    assert len(resp.json()["conversations"]) > 0

    resp = await test_client.get(f"/api/chats/{chat_id}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Test Chat"

    resp = await test_client.patch(f"/api/chats/{chat_id}", json={"title": "Updated Chat"})
    assert resp.status_code == 200
    assert resp.json()["title"] == "Updated Chat"

    resp = await test_client.delete(f"/api/chats/{chat_id}")
    assert resp.status_code == 200

    resp = await test_client.get(f"/api/chats/{chat_id}")
    assert resp.status_code == 404
