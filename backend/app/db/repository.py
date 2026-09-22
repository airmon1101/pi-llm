import uuid
from datetime import datetime
from app.db.database import get_db
from app.models.database import Conversation, Message

def get_now_iso():
    return datetime.utcnow().isoformat()

async def create_conversation(title: str, model: str) -> Conversation:
    conv_id = str(uuid.uuid4())
    now = get_now_iso()
    async with await get_db() as db:
        await db.execute(
            "INSERT INTO conversations (id, title, model, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (conv_id, title, model, now, now)
        )
        await db.commit()
    return Conversation(id=conv_id, title=title, model=model, created_at=now, updated_at=now)

async def get_conversation(id: str) -> Conversation | None:
    async with await get_db() as db:
        async with db.execute("SELECT * FROM conversations WHERE id = ?", (id,)) as cursor:
            row = await cursor.fetchone()
            if row:
                return Conversation(**dict(row))
    return None

async def list_conversations() -> list[Conversation]:
    async with await get_db() as db:
        async with db.execute("SELECT * FROM conversations ORDER BY updated_at DESC") as cursor:
            rows = await cursor.fetchall()
            return [Conversation(**dict(row)) for row in rows]

async def update_conversation(id: str, title: str) -> Conversation | None:
    now = get_now_iso()
    async with await get_db() as db:
        await db.execute("UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?", (title, now, id))
        await db.commit()
    return await get_conversation(id)

async def delete_conversation(id: str) -> bool:
    async with await get_db() as db:
        cursor = await db.execute("DELETE FROM conversations WHERE id = ?", (id,))
        await db.commit()
        return cursor.rowcount > 0

async def add_message(conversation_id: str, role: str, content: str) -> Message:
    msg_id = str(uuid.uuid4())
    now = get_now_iso()
    async with await get_db() as db:
        await db.execute(
            "INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
            (msg_id, conversation_id, role, content, now)
        )
        await db.commit()
    await update_conversation_timestamp(conversation_id)
    return Message(id=msg_id, conversation_id=conversation_id, role=role, content=content, created_at=now)

async def get_messages(conversation_id: str) -> list[Message]:
    async with await get_db() as db:
        async with db.execute("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC", (conversation_id,)) as cursor:
            rows = await cursor.fetchall()
            return [Message(**dict(row)) for row in rows]

async def update_conversation_timestamp(id: str) -> None:
    now = get_now_iso()
    async with await get_db() as db:
        await db.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now, id))
        await db.commit()
