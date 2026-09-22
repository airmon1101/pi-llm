# PiLLM API Reference

PiLLM exposes a clean RESTful API with Server-Sent Events (SSE) streaming, served via FastAPI at `/api/` (proxied by Nginx).

Interactive OpenAPI documentation is available locally at:
```text
http://raspberrypi.local/api/docs
```

---

## 1. Health & Status

### `GET /api/health`
Performs live health checks across all subsystem layers: Ollama daemon, active Gemma 4 E2B model, SQLite database connectivity, and microSD storage capacity.

#### Response `200 OK`
```json
{
  "status": "ok",
  "version": "1.0.0",
  "services": [
    {
      "name": "ollama",
      "status": "online",
      "details": null
    },
    {
      "name": "model",
      "status": "available",
      "details": "gemma4:e2b"
    },
    {
      "name": "database",
      "status": "connected",
      "details": null
    },
    {
      "name": "storage",
      "status": "healthy",
      "details": null
    }
  ]
}
```

---

## 2. Models

### `GET /api/models`
Lists all local LLM models currently pulled and available in the Ollama instance.

#### Response `200 OK`
```json
{
  "models": [
    {
      "name": "gemma4:e2b",
      "size": "1677721600",
      "modified_at": "2026-09-22T10:15:30Z"
    }
  ]
}
```

---

## 3. Conversations

### `GET /api/chats`
Returns all conversation sessions ordered by `updated_at` descending.

#### Response `200 OK`
```json
{
  "conversations": [
    {
      "id": "e3a479d2-5b8e-4a6c-9411-a8fd32b4b451",
      "title": "Explain Raspberry Pi 5 Architecture",
      "model": "gemma4:e2b",
      "created_at": "2026-09-22T12:00:00Z",
      "updated_at": "2026-09-22T12:05:30Z"
    }
  ]
}
```

### `POST /api/chats`
Initializes a new empty conversation session.

#### Request Body
```json
{
  "title": "Optional Title",
  "model": "gemma4:e2b"
}
```

#### Response `200 OK`
```json
{
  "id": "e3a479d2-5b8e-4a6c-9411-a8fd32b4b451",
  "title": "Optional Title",
  "model": "gemma4:e2b",
  "created_at": "2026-09-22T12:00:00Z",
  "updated_at": "2026-09-22T12:00:00Z"
}
```

### `GET /api/chats/{chat_id}`
Retrieves metadata for a specific conversation session.

### `PATCH /api/chats/{chat_id}`
Renames an existing conversation.

#### Request Body
```json
{
  "title": "New Title"
}
```

### `DELETE /api/chats/{chat_id}`
Deletes a conversation and cascades deletion to all associated messages in SQLite.

#### Response `200 OK`
```json
{
  "success": true
}
```

---

## 4. Messages & Inference

### `GET /api/chats/{chat_id}/messages`
Retrieves chronological message history for a given conversation.

#### Response `200 OK`
```json
{
  "messages": [
    {
      "id": "msg-01",
      "conversation_id": "e3a479d2-5b8e-4a6c-9411-a8fd32b4b451",
      "role": "user",
      "content": "What is machine learning?",
      "created_at": "2026-09-22T12:01:00Z"
    },
    {
      "id": "msg-02",
      "conversation_id": "e3a479d2-5b8e-4a6c-9411-a8fd32b4b451",
      "role": "assistant",
      "content": "Machine learning is a subset of artificial intelligence...",
      "created_at": "2026-09-22T12:01:05Z"
    }
  ]
}
```

### `POST /api/chat`
Sends a user message, manages conversation context, and streams the assistant response token-by-token over Server-Sent Events (SSE).

#### Request Body
```json
{
  "conversation_id": "e3a479d2-5b8e-4a6c-9411-a8fd32b4b451",
  "message": "Write a Python script to check CPU temperature",
  "model": "gemma4:e2b",
  "temperature": 0.7,
  "max_tokens": 2048,
  "system_prompt": "You are PiLLM, a helpful AI assistant."
}
```

#### Response Stream (`text/event-stream`)
```text
event: message
data: {"type": "token", "content": "Here", "conversation_id": "e3a479d2-5b8e-4a6c-9411-a8fd32b4b451"}

event: message
data: {"type": "token", "content": " is a script", "conversation_id": "e3a479d2-5b8e-4a6c-9411-a8fd32b4b451"}

event: message
data: {"type": "done", "content": "", "conversation_id": "e3a479d2-5b8e-4a6c-9411-a8fd32b4b451", "message_id": "b1b72e81-a532-414f-9e6b-45601d360ad4"}
```

### `POST /api/chat/stop`
Cancels an ongoing generation for a conversation.

#### Request Body
```json
{
  "conversation_id": "e3a479d2-5b8e-4a6c-9411-a8fd32b4b451"
}
```

#### Response `200 OK`
```json
{
  "success": true
}
```

---

## 5. System Monitoring

### `GET /api/system/info`
Returns host hardware metrics, OS version, RAM allocation, and local network IP.

#### Response `200 OK`
```json
{
  "hostname": "raspberrypi",
  "os": "Linux",
  "architecture": "aarch64",
  "cpu_model": "Cortex-A76",
  "cpu_cores": 4,
  "ram_total_gb": 7.82,
  "ram_available_gb": 5.41,
  "storage": {
    "total_gb": 58.4,
    "used_gb": 14.2,
    "free_gb": 44.2,
    "usage_percent": 24.3,
    "warning": false
  },
  "lan_ip": "192.168.1.150",
  "version": "1.0.0"
}
```

### `GET /api/system/storage`
Returns focused disk usage metrics for microSD card capacity monitoring.

#### Response `200 OK`
```json
{
  "storage": {
    "total_gb": 58.4,
    "used_gb": 14.2,
    "free_gb": 44.2,
    "usage_percent": 24.3,
    "warning": false
  }
}
```
