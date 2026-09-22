import pytest
from app.db import repository

@pytest.mark.asyncio
async def test_db_crud(setup_db):
    conv = await repository.create_conversation("My Chat", "test-model")
    assert conv.title == "My Chat"
    
    msg = await repository.add_message(conv.id, "user", "Hello")
    assert msg.content == "Hello"
    
    msgs = await repository.get_messages(conv.id)
    assert len(msgs) == 1
    
    await repository.delete_conversation(conv.id)
    conv_check = await repository.get_conversation(conv.id)
    assert conv_check is None
