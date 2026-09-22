from pydantic import BaseModel, Field
from typing import List, Optional

class ChatRequest(BaseModel):
    conversation_id: str
    message: str
    model: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    system_prompt: Optional[str] = None

class ConversationCreate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None

class ConversationUpdate(BaseModel):
    title: str

class ConversationResponse(BaseModel):
    id: str
    title: str
    model: str
    created_at: str
    updated_at: str

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str

class ConversationListResponse(BaseModel):
    conversations: List[ConversationResponse]

class MessageListResponse(BaseModel):
    messages: List[MessageResponse]

class StopRequest(BaseModel):
    conversation_id: str
