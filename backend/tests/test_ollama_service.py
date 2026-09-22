import pytest
from app.services.ollama_service import ollama_service

@pytest.mark.asyncio
async def test_cancel_generation():
    ollama_service.active_requests["test-id"] = None
    res = ollama_service.cancel_generation("test-id")
    assert res is False
    assert "test-id" not in ollama_service.active_requests
