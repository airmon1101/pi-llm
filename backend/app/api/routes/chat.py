from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
from app.schemas.chat import (
    ChatRequest, ConversationCreate, ConversationUpdate, ConversationResponse,
    MessageResponse, ConversationListResponse, MessageListResponse, StopRequest
)
from app.db import repository
from app.services import chat_service

router = APIRouter()

@router.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    generator = await chat_service.create_chat(request)
    return EventSourceResponse(generator)

@router.post("/api/chat/stop")
async def stop_chat_endpoint(request: StopRequest):
    success = chat_service.stop_generation(request.conversation_id)
    return {"success": success}

@router.get("/api/chats", response_model=ConversationListResponse)
async def list_chats():
    convs = await repository.list_conversations()
    return ConversationListResponse(conversations=[
        ConversationResponse(id=c.id, title=c.title, model=c.model, created_at=c.created_at, updated_at=c.updated_at)
        for c in convs
    ])

@router.post("/api/chats", response_model=ConversationResponse)
async def create_chat_api(req: ConversationCreate):
    from app.core.config import settings
    c = await repository.create_conversation(req.title or "New Chat", req.model or settings.ollama_model)
    return ConversationResponse(id=c.id, title=c.title, model=c.model, created_at=c.created_at, updated_at=c.updated_at)

@router.get("/api/chats/{chat_id}", response_model=ConversationResponse)
async def get_chat(chat_id: str):
    c = await repository.get_conversation(chat_id)
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationResponse(id=c.id, title=c.title, model=c.model, created_at=c.created_at, updated_at=c.updated_at)

@router.patch("/api/chats/{chat_id}", response_model=ConversationResponse)
async def update_chat(chat_id: str, req: ConversationUpdate):
    c = await repository.update_conversation(chat_id, req.title)
    if not c:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationResponse(id=c.id, title=c.title, model=c.model, created_at=c.created_at, updated_at=c.updated_at)

@router.delete("/api/chats/{chat_id}")
async def delete_chat(chat_id: str):
    success = await repository.delete_conversation(chat_id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"success": True}

@router.get("/api/chats/{chat_id}/messages", response_model=MessageListResponse)
async def get_messages(chat_id: str):
    msgs = await repository.get_messages(chat_id)
    return MessageListResponse(messages=[
        MessageResponse(id=m.id, conversation_id=m.conversation_id, role=m.role, content=m.content, created_at=m.created_at)
        for m in msgs
    ])
