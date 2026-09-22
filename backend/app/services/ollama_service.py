import httpx
import json
from typing import AsyncGenerator
from app.core.config import settings
from app.core.logging import logger

class OllamaService:
    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.client = httpx.AsyncClient(timeout=httpx.Timeout(connect=10.0, read=300.0, write=10.0, pool=10.0))
        self.active_requests: dict[str, httpx.Response] = {}

    async def check_health(self) -> bool:
        try:
            resp = await self.client.get(f"{self.base_url}/api/tags")
            return resp.status_code == 200
        except Exception as e:
            logger.error(f"Ollama health check failed: {e}")
            return False

    async def list_models(self) -> list[dict]:
        try:
            resp = await self.client.get(f"{self.base_url}/api/tags")
            if resp.status_code == 200:
                return resp.json().get("models", [])
            return []
        except Exception as e:
            logger.error(f"Error listing models: {e}")
            return []

    async def check_model(self, model_name: str) -> bool:
        models = await self.list_models()
        return any(
            m.get("name") == model_name or
            m.get("name", "").startswith(model_name)
            for m in models
        )

    async def chat_stream(self, conversation_id: str, messages: list[dict], model: str, temperature: float, max_tokens: int) -> AsyncGenerator[dict, None]:
        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }
        try:
            async with self.client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                self.active_requests[conversation_id] = response
                if response.status_code != 200:
                    yield {"type": "error", "content": f"Ollama error: {response.status_code}"}
                    return
                
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                        if data.get("done"):
                            yield {"type": "done", "content": ""}
                            break
                        else:
                            msg = data.get("message", {})
                            content = msg.get("content", "")
                            if content:
                                yield {"type": "token", "content": content}
                    except json.JSONDecodeError:
                        continue
        except httpx.ReadError as e:
             logger.info(f"Ollama stream cancelled or read error: {e}")
        except Exception as e:
            logger.error(f"Ollama chat_stream error: {e}")
            yield {"type": "error", "content": str(e)}
        finally:
            self.active_requests.pop(conversation_id, None)

    def cancel_generation(self, conversation_id: str) -> bool:
        response = self.active_requests.get(conversation_id)
        if response:
            try:
                response.close()
                self.active_requests.pop(conversation_id, None)
                return True
            except Exception as e:
                logger.error(f"Error cancelling generation for {conversation_id}: {e}")
        return False

ollama_service = OllamaService()
