from dataclasses import dataclass

@dataclass
class Conversation:
    id: str
    title: str
    model: str
    created_at: str
    updated_at: str

@dataclass
class Message:
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: str
