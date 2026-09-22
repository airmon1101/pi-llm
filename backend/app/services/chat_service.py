import json
from app.db import repository
from app.schemas.chat import ChatRequest
from app.services.ollama_service import ollama_service
from app.core.config import settings
from app.core.logging import logger


async def create_chat(request: ChatRequest):
    """Orchestrates a chat request: saves messages, streams from Ollama, saves response."""
    conversation = await repository.get_conversation(request.conversation_id)

    if not conversation:
        # Auto-create conversation using first message as title
        title = request.message[:50] + ("..." if len(request.message) > 50 else "")
        model = request.model or settings.ollama_model
        conversation = await repository.create_conversation(title, model)
    else:
        model = request.model or conversation.model

    # Save user message
    await repository.add_message(conversation.id, "user", request.message)

    # Build message history for context
    db_messages = await repository.get_messages(conversation.id)

    messages = []
    sys_prompt = request.system_prompt or settings.default_system_prompt
    if sys_prompt:
        messages.append({"role": "system", "content": sys_prompt})

    for msg in db_messages:
        messages.append({"role": msg.role, "content": msg.content})

    temperature = request.temperature if request.temperature is not None else settings.default_temperature
    max_tokens = request.max_tokens if request.max_tokens is not None else settings.default_max_tokens

    async def event_generator():
        full_content = ""
        try:
            async for chunk in ollama_service.chat_stream(
                conversation.id, messages, model, temperature, max_tokens
            ):
                if chunk["type"] == "token":
                    full_content += chunk["content"]
                    yield {
                        "event": "message",
                        "data": json.dumps({
                            "type": "token",
                            "content": chunk["content"],
                            "conversation_id": conversation.id,
                        }),
                    }
                elif chunk["type"] == "error":
                    yield {
                        "event": "message",
                        "data": json.dumps({
                            "type": "error",
                            "error": chunk.get("content", "Unknown error"),
                        }),
                    }

            # Save assistant message on completion
            if full_content:
                msg = await repository.add_message(
                    conversation.id, "assistant", full_content
                )
                yield {
                    "event": "message",
                    "data": json.dumps({
                        "type": "done",
                        "content": "",
                        "conversation_id": conversation.id,
                        "message_id": msg.id,
                    }),
                }
            else:
                yield {
                    "event": "message",
                    "data": json.dumps({
                        "type": "done",
                        "content": "",
                        "conversation_id": conversation.id,
                    }),
                }
        except Exception as e:
            logger.error(f"Chat stream error: {e}")
            yield {
                "event": "message",
                "data": json.dumps({
                    "type": "error",
                    "error": str(e),
                }),
            }

    return event_generator()


def stop_generation(conversation_id: str) -> bool:
    return ollama_service.cancel_generation(conversation_id)
